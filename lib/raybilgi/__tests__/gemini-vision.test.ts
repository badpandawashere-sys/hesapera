import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractWagonIdentitiesFromImage,
  GEMINI_REQUEST_TIMEOUT_MS,
  DEFAULT_GEMINI_VISION_MODEL,
  FRIENDLY_TIMEOUT_ERROR_MESSAGE,
  isTimeoutError,
} from '@/lib/raybilgi/gemini-vision';

describe('gemini-vision', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-api-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('has a 45 second request timeout constant', () => {
    expect(GEMINI_REQUEST_TIMEOUT_MS).toBe(45000);
  });

  it('uses gemini-3.8-flash as the default fallback model', () => {
    expect(DEFAULT_GEMINI_VISION_MODEL).toBe('gemini-3.8-flash');
  });

  it('prefers GEMINI_VISION_MODEL environment variable over default', async () => {
    process.env.GEMINI_VISION_MODEL = 'gemini-custom-test-model';

    let calledUrl = '';
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      calledUrl = String(url);
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      wagons: [{ regime: '3175', serial: '2461', wagonNo: '776-8' }],
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

    const result = await extractWagonIdentitiesFromImage('base64test');
    expect(calledUrl).toContain('models/gemini-custom-test-model:generateContent');
    expect(result).toHaveLength(1);
    expect(result[0].serial).toBe('2461');
  });

  it('uses default fallback model gemini-3.8-flash when env is omitted', async () => {
    delete process.env.GEMINI_VISION_MODEL;

    let calledUrl = '';
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      calledUrl = String(url);
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      wagons: [{ regime: '3175', serial: '5379', wagonNo: '209-6' }],
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

    const result = await extractWagonIdentitiesFromImage('base64test');
    expect(calledUrl).toContain('models/gemini-3.8-flash:generateContent');
    expect(result[0].serial).toBe('5379');
  });

  it('extracts wagon identity without any technical specs or tare', async () => {
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
                        { rawText: '31 75 2461 776-8', regime: '31 75', serial: '24 61', wagonNo: '776-8' },
                      ],
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

    const result = await extractWagonIdentitiesFromImage('base64test');
    expect(result[0]).toEqual({
      rawText: '31 75 2461 776-8',
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
    });
    // AI does NOT output tare or any technical values
    const item = result[0] as unknown as Record<string, unknown>;
    expect(item.tare).toBeUndefined();
    expect(item.axle).toBeUndefined();
    expect(item.wagonType).toBeUndefined();
  });

  it('maps AbortError / TimeoutError to the friendly Turkish timeout message', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      const error = new Error('The operation was aborted due to timeout');
      error.name = 'TimeoutError';
      throw error;
    });

    await expect(extractWagonIdentitiesFromImage('base64test')).rejects.toThrow(
      FRIENDLY_TIMEOUT_ERROR_MESSAGE
    );
  });

  it('handles 429 quota exhaustion immediately without retries', async () => {
    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      callCount++;
      return new Response('Quota exceeded', { status: 429 });
    });

    await expect(extractWagonIdentitiesFromImage('base64test')).rejects.toThrow(
      'Gemini API kotası aşıldı (429 RESOURCE_EXHAUSTED)'
    );
    expect(callCount).toBe(1); // Zero retries
  });

  it('throws friendly configuration error when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(extractWagonIdentitiesFromImage('base64test')).rejects.toThrow(
      'GEMINI_API_KEY yapılandırılmamış'
    );
  });
});
