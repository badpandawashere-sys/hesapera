import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractWagonIdentitiesWithGemini,
  GEMINI_REQUEST_TIMEOUT_MS,
  DEFAULT_GEMINI_VISION_MODEL,
} from '@/lib/raybilgi/gemini-vision';
import { OcrClientError } from '@/lib/raybilgi/ocr-client';

describe('gemini-vision', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = {
      ...originalEnv,
      GEMINI_API_KEY: 'test-gemini-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('has a 25 second request timeout constant', () => {
    expect(GEMINI_REQUEST_TIMEOUT_MS).toBe(25_000);
  });

  it('uses gemini-3.8-flash as the default model', () => {
    expect(DEFAULT_GEMINI_VISION_MODEL).toBe('gemini-3.8-flash');
  });

  it('throws 503 when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const dummy = Buffer.from([1, 2, 3]);

    await expect(extractWagonIdentitiesWithGemini(dummy)).rejects.toThrow(
      'Fotoğraf okuma servisi yapılandırılmamış (GEMINI_API_KEY eksik).'
    );
  });

  it('successfully extracts a single valid wagon number with confidence', async () => {
    let capturedUrl = '';
    let capturedBody: any = null;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      capturedUrl = String(url);
      capturedBody = JSON.parse(String(init?.body || '{}'));
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      wagons: [
                        {
                          rawText: '31 75 2461 776-8',
                          regime: '31 75',
                          serial: '2461',
                          wagonNo: '776-8',
                          confidence: 0.98,
                        },
                      ],
                      warnings: [],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    const dummy = Buffer.from([1, 2, 3]);
    const result = await extractWagonIdentitiesWithGemini(dummy, 'image/jpeg');

    expect(capturedUrl).toContain('models/gemini-3.8-flash:generateContent?key=test-gemini-key');
    expect(capturedBody.generationConfig.temperature).toBe(0.0);
    expect(capturedBody.generationConfig.thinkingConfig?.thinkingLevel).toBe('low');
    expect(capturedBody.generationConfig.responseMimeType).toBe('application/json');

    expect(result.ok).toBe(true);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].text).toBe('31 75 2461 776-8');
    expect(result.lines[0].confidence).toBe(0.98);

    // CRITICAL: Verify NO tare, length, or axles in OCR line output
    const lineItem = result.lines[0] as unknown as Record<string, unknown>;
    expect(lineItem.tare).toBeUndefined();
    expect(lineItem.axle).toBeUndefined();
    expect(lineItem.wagonType).toBeUndefined();
  });

  it('extracts multiple wagon numbers in top-to-bottom order', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      wagons: [
                        { rawText: '3175 2461 776-8', regime: '3175', serial: '2461', wagonNo: '776-8', confidence: 0.96 },
                        { rawText: '3175 4569 183-2', regime: '3175', serial: '4569', wagonNo: '183-2', confidence: 0.92 },
                        { rawText: '3175 5379 209-6', regime: '3175', serial: '5379', wagonNo: '209-6', confidence: 0.88 },
                      ],
                      warnings: [],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    const result = await extractWagonIdentitiesWithGemini(Buffer.from([1, 2, 3]));
    expect(result.lines).toHaveLength(3);
    expect(result.lines[0].text).toBe('3175 2461 776-8');
    expect(result.lines[1].text).toBe('3175 4569 183-2');
    expect(result.lines[2].text).toBe('3175 5379 209-6');
  });

  it('marks blurry or occluded markings with low confidence and warning', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      wagons: [
                        { rawText: '2461 7??-8', regime: '', serial: '2461', wagonNo: '7??-8', confidence: 0.55 },
                      ],
                      warnings: ['Görsel kısmen bulanık, kontrol önerilir.'],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    const result = await extractWagonIdentitiesWithGemini(Buffer.from([1, 2, 3]));
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].confidence).toBe(0.55);
    expect(result.warnings).toContain('Görsel kısmen bulanık, kontrol önerilir.');
  });

  it('returns empty lines when image contains no railway markings', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      wagons: [],
                      warnings: ['Görselde okunabilir vagon numarası bulunamadı.'],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    const result = await extractWagonIdentitiesWithGemini(Buffer.from([1, 2, 3]));
    expect(result.lines).toEqual([]);
    expect(result.warnings).toContain('Görselde okunabilir vagon numarası bulunamadı.');
  });

  it('handles 429 quota exhaustion immediately without retries', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response('Quota exceeded', { status: 429 });
    });

    try {
      await extractWagonIdentitiesWithGemini(Buffer.from([1, 2, 3]));
      expect.fail('Should have thrown 429');
    } catch (err: any) {
      expect(err).toBeInstanceOf(OcrClientError);
      expect(err.status).toBe(429);
      expect(err.message).toContain('kotası geçici olarak doldu');
    }
  });

  it('maps timeout error to 504 status with friendly message', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      const error = new Error('The operation was aborted due to timeout');
      error.name = 'TimeoutError';
      throw error;
    });

    try {
      await extractWagonIdentitiesWithGemini(Buffer.from([1, 2, 3]));
      expect.fail('Should have thrown 504');
    } catch (err: any) {
      expect(err).toBeInstanceOf(OcrClientError);
      expect(err.status).toBe(504);
      expect(err.message).toContain('zaman aşımına uğradı');
    }
  });

  it('maps 401 / 403 to 502 authorization error', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response('Invalid API Key', { status: 403 });
    });

    try {
      await extractWagonIdentitiesWithGemini(Buffer.from([1, 2, 3]));
      expect.fail('Should have thrown 502');
    } catch (err: any) {
      expect(err).toBeInstanceOf(OcrClientError);
      expect(err.status).toBe(502);
      expect(err.message).toContain('yetkilendirme hatası');
    }
  });

  it('handles markdown wrapped JSON responses cleanly', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '```json\n{\n  "wagons": [{"rawText": "2461 776-8", "serial": "2461", "wagonNo": "776-8", "confidence": 0.95}],\n  "warnings": []\n}\n```',
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    const result = await extractWagonIdentitiesWithGemini(Buffer.from([1, 2, 3]));
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].text).toBe('2461 776-8');
  });

  it('maps 400 Bad Request error cleanly', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response('Bad Request', { status: 400 });
    });

    try {
      await extractWagonIdentitiesWithGemini(Buffer.from([1, 2, 3]));
      expect.fail('Should have thrown 400');
    } catch (err: any) {
      expect(err).toBeInstanceOf(OcrClientError);
      expect(err.status).toBe(400);
      expect(err.message).toContain('kullanılamıyor (400)');
    }
  });

  it('maps 404 Not Found error cleanly', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response('Not Found', { status: 404 });
    });

    try {
      await extractWagonIdentitiesWithGemini(Buffer.from([1, 2, 3]));
      expect.fail('Should have thrown 404');
    } catch (err: any) {
      expect(err).toBeInstanceOf(OcrClientError);
      expect(err.status).toBe(404);
      expect(err.message).toContain('kullanılamıyor (404)');
    }
  });

  it('logs safe performance metrics without leaking sensitive information', async () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      wagons: [
                        { rawText: '3175 2461 776-8', serial: '2461', wagonNo: '776-8', confidence: 0.95 },
                      ],
                      warnings: [],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    await extractWagonIdentitiesWithGemini(Buffer.from([1, 2, 3, 4]));

    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0][0];
    expect(logCall).toContain('[Wagon OCR]');
    expect(logCall).toContain('Boyut:');
    expect(logCall).toContain('Süre:');
    expect(logCall).toContain('HTTP: 200');
    expect(logCall).not.toContain('test-gemini-key');
    expect(logCall).not.toContain('3175 2461 776-8');
  });
});
