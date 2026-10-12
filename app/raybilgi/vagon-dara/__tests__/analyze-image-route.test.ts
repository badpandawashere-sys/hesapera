import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../analyze-image/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/raybilgi/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/raybilgi/gemini-vision', () => ({
  extractWagonIdentitiesFromImage: vi.fn(),
  isTimeoutError: (err: unknown) => {
    if (!(err instanceof Error)) return false;
    return (
      err.name === 'TimeoutError' ||
      err.name === 'AbortError' ||
      err.message.includes('aborted') ||
      err.message.includes('timeout') ||
      err.message.includes('zaman aşımına')
    );
  },
  FRIENDLY_TIMEOUT_ERROR_MESSAGE:
    'Fotoğraf analizi zaman aşımına uğradı. Lütfen tekrar deneyin veya daha küçük/net bir fotoğraf kullanın.',
}));

import { getSession } from '@/lib/raybilgi/auth/session';
import {
  extractWagonIdentitiesFromImage,
  FRIENDLY_TIMEOUT_ERROR_MESSAGE,
} from '@/lib/raybilgi/gemini-vision';

function createMockRequest(formData?: FormData | null): NextRequest {
  return {
    formData: async () => {
      if (formData === null) throw new Error('Form parse error');
      return formData ?? new FormData();
    },
  } as unknown as NextRequest;
}

describe('analyze-image route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const req = createMockRequest();
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('Yetkisiz');
  });

  it('returns 400 when formData parsing fails', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    const req = createMockRequest(null);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('Geçersiz istek formu');
  });

  it('returns 400 when no image is provided', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    const formData = new FormData();
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('Görsel dosyası bulunamadı');
  });

  it('returns 400 when file type is unsupported', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    const file = new File(['dummy-content'], 'test.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('image', file);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('Desteklenmeyen dosya formatı');
  });

  it('returns 400 when file size exceeds 8MB', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    const bigFile = new File(['a'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(bigFile, 'size', { value: 9 * 1024 * 1024 });

    const formData = new FormData();
    formData.append('image', bigFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('8 MB');
  });

  it('returns extracted wagons on successful analysis', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    vi.mocked(extractWagonIdentitiesFromImage).mockResolvedValue([
      {
        rawText: '3175 2461 776-8',
        regime: '3175',
        serial: '2461',
        wagonNo: '776-8',
      },
    ]);

    const validFile = new File(['image-bytes'], 'wagon.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', validFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.wagons).toHaveLength(1);
    expect(json.wagons[0].serial).toBe('2461');
    expect(json.wagons[0].wagonNo).toBe('776-8');
  });

  it('returns friendly Turkish timeout error on timeout/abort', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    const timeoutError = new Error('The operation was aborted due to timeout');
    timeoutError.name = 'TimeoutError';
    vi.mocked(extractWagonIdentitiesFromImage).mockRejectedValue(timeoutError);

    const validFile = new File(['image-bytes'], 'wagon.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', validFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(504);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe(FRIENDLY_TIMEOUT_ERROR_MESSAGE);
  });

  it('returns 429 quota error immediately without retrying', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    vi.mocked(extractWagonIdentitiesFromImage).mockRejectedValue(
      new Error('Gemini API kotası aşıldı (429 RESOURCE_EXHAUSTED). Lütfen bir süre sonra tekrar deneyin.')
    );

    const validFile = new File(['image-bytes'], 'wagon.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', validFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('429 RESOURCE_EXHAUSTED');
  });
});
