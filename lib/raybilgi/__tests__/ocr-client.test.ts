import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  recognizeWagonList,
  OcrClientError,
  OCR_TIMEOUT_MS,
  OcrResponseSchema,
} from '@/lib/raybilgi/ocr-client';

describe('ocr-client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = {
      ...originalEnv,
      WAGON_OCR_API_URL: 'http://127.0.0.1:8000',
      WAGON_OCR_API_SECRET: 'test-ocr-secret',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('has a 12 second request timeout constant', () => {
    expect(OCR_TIMEOUT_MS).toBe(12000);
  });

  it('sends multipart request with X-OCR-Secret header and parses valid response', async () => {
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> = {};

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      capturedUrl = String(url);
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      return new Response(
        JSON.stringify({
          ok: true,
          processingTimeMs: 450,
          processedWidth: 1440,
          processedHeight: 900,
          lines: [
            {
              text: '3175 2461 776-8 KAYSERI 25,5',
              confidence: 0.96,
              bbox: { x1: 10, y1: 20, x2: 300, y2: 50 },
            },
          ],
          warnings: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    const dummyBytes = new Uint8Array([1, 2, 3]);
    const result = await recognizeWagonList(dummyBytes, 'image/png');

    expect(capturedUrl).toContain('/wagon-list');
    expect(capturedHeaders['X-OCR-Secret']).toBe('test-ocr-secret');
    expect(result.ok).toBe(true);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].text).toBe('3175 2461 776-8 KAYSERI 25,5');
    expect(result.lines[0].confidence).toBe(0.96);
  });

  it('throws 403 OcrClientError when secret is rejected', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify({ detail: 'Yetkisiz servis erişimi.' }), { status: 403 });
    });

    await expect(recognizeWagonList(new Uint8Array([1, 2]))).rejects.toThrow(
      'Yetkisiz servis erişimi: X-OCR-Secret geçersiz veya eksik.'
    );
  });

  it('throws 504 on timeout/abort error', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      const err = new Error('The operation was aborted due to timeout');
      err.name = 'TimeoutError';
      throw err;
    });

    try {
      await recognizeWagonList(new Uint8Array([1, 2]));
      expect.fail('Should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(OcrClientError);
      expect(e.status).toBe(504);
      expect(e.message).toContain('zaman aşımına uğradı');
    }
  });

  it('throws 503 when OCR service is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      throw new TypeError('fetch failed (ECONNREFUSED)');
    });

    try {
      await recognizeWagonList(new Uint8Array([1, 2]));
      expect.fail('Should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(OcrClientError);
      expect(e.status).toBe(503);
      expect(e.message).toContain('Fotoğraf okuma servisine ulaşılamadı');
    }
  });

  it('validates response with Zod and strips unapproved fields (like fake tare/wagonType)', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          ok: true,
          processingTimeMs: 120,
          processedWidth: 800,
          processedHeight: 600,
          tare: 99.9, // Malicious / extraneous
          wagonType: 'FAKE_TYPE', // Malicious / extraneous
          lines: [
            {
              text: '3175 2752 262-5',
              confidence: 0.99,
              tare: 50.0,
            },
          ],
          warnings: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    const result = (await recognizeWagonList(new Uint8Array([1, 2]))) as any;
    expect(result.ok).toBe(true);
    expect(result.lines).toHaveLength(1);
    expect(result.tare).toBeUndefined();
    expect(result.wagonType).toBeUndefined();
    expect(result.lines[0].tare).toBeUndefined();
  });

  it('throws 502 when OCR response is malformed JSON or does not match schema', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response('Not valid JSON', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    });

    await expect(recognizeWagonList(new Uint8Array([1, 2]))).rejects.toThrow(
      'Fotoğraf okuma servisinden geçersiz JSON yanıtı alındı.'
    );
  });
});
