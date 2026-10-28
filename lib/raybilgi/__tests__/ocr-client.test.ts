import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  recognizeWagonList,
  callRemoteRapidOcr,
  OcrClientError,
  OCR_TIMEOUT_MS,
} from '@/lib/raybilgi/ocr-client';
import * as geminiVision from '@/lib/raybilgi/gemini-vision';

describe('ocr-client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = {
      ...originalEnv,
      WAGON_OCR_API_URL: 'http://127.0.0.1:8000',
      WAGON_OCR_API_SECRET: 'test-ocr-secret',
      GEMINI_API_KEY: 'test-gemini-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('has a 12 second request timeout constant for remote OCR', () => {
    expect(OCR_TIMEOUT_MS).toBe(12000);
  });

  describe('callRemoteRapidOcr', () => {
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
      const result = await callRemoteRapidOcr(dummyBytes, 'image/png', 'http://127.0.0.1:8000');

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

      await expect(
        callRemoteRapidOcr(new Uint8Array([1, 2]), 'image/jpeg', 'http://127.0.0.1:8000')
      ).rejects.toThrow('Yetkisiz servis erişimi: X-OCR-Secret geçersiz veya eksik.');
    });

    it('throws 504 on timeout error', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
        const err = new Error('The operation was aborted due to timeout');
        err.name = 'TimeoutError';
        throw err;
      });

      try {
        await callRemoteRapidOcr(new Uint8Array([1, 2]), 'image/jpeg', 'http://127.0.0.1:8000');
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e).toBeInstanceOf(OcrClientError);
        expect(e.status).toBe(504);
        expect(e.message).toContain('zaman aşımına uğradı');
      }
    });

    it('throws 503 when remote OCR service is unreachable', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
        throw new TypeError('fetch failed (ECONNREFUSED)');
      });

      try {
        await callRemoteRapidOcr(new Uint8Array([1, 2]), 'image/jpeg', 'http://127.0.0.1:8000');
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e).toBeInstanceOf(OcrClientError);
        expect(e.status).toBe(503);
        expect(e.message).toContain('Fotoğraf okuma servisine ulaşılamadı');
      }
    });
  });

  describe('recognizeWagonList dual-mode orchestrator', () => {
    it('uses Gemini Vision by default when WAGON_OCR_API_URL is not set', async () => {
      delete process.env.WAGON_OCR_API_URL;

      const spyGemini = vi.spyOn(geminiVision, 'extractWagonIdentitiesWithGemini').mockResolvedValue({
        ok: true,
        processingTimeMs: 320,
        processedWidth: 0,
        processedHeight: 0,
        lines: [{ text: '3175 2461 776-8', confidence: 0.98 }],
        warnings: [],
      });

      const result = await recognizeWagonList(new Uint8Array([1, 2, 3]));
      expect(spyGemini).toHaveBeenCalledTimes(1);
      expect(result.ok).toBe(true);
      expect(result.lines[0].text).toBe('3175 2461 776-8');
    });

    it('falls back to Gemini Vision when remote OCR service fails', async () => {
      process.env.WAGON_OCR_API_URL = 'https://wagon-ocr.up.railway.app';

      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fetch failed ECONNREFUSED'));

      const spyGemini = vi.spyOn(geminiVision, 'extractWagonIdentitiesWithGemini').mockResolvedValue({
        ok: true,
        processingTimeMs: 400,
        processedWidth: 0,
        processedHeight: 0,
        lines: [{ text: '3175 5379 209-6', confidence: 0.95 }],
        warnings: ['Harici servis yanıt vermedi, Gemini Vision yedek mekanizması kullanıldı.'],
      });

      const result = await recognizeWagonList(new Uint8Array([1, 2, 3]));
      expect(spyGemini).toHaveBeenCalledTimes(1);
      expect(result.lines[0].text).toBe('3175 5379 209-6');
    });

    it('propagates friendly 503 error when neither service is reachable or configured', async () => {
      delete process.env.WAGON_OCR_API_URL;
      delete process.env.GEMINI_API_KEY;

      await expect(recognizeWagonList(new Uint8Array([1, 2]))).rejects.toThrow(
        'Fotoğraf okuma servisi yapılandırılmamış'
      );
    });
  });
});
