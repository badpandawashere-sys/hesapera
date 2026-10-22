// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../analyze-image/route';
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/raybilgi/auth/session';
import { recognizeWagonList, OcrClientError } from '@/lib/raybilgi/ocr-client';

vi.mock('@/lib/raybilgi/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/raybilgi/ocr-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/raybilgi/ocr-client')>(
    '@/lib/raybilgi/ocr-client'
  );
  return {
    ...actual,
    recognizeWagonList: vi.fn(),
  };
});

function createMockRequest(formData?: FormData | null): NextRequest {
  return {
    formData: async () => {
      if (formData === null) throw new Error('Form parse error');
      return formData ?? new FormData();
    },
  } as unknown as NextRequest;
}

// Valid JPEG header bytes for signature check
const VALID_JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

describe('analyze-image route with self-hosted OCR service', () => {
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

  it('returns 400 when file size is 0', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', emptyFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('boş');
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

  it('returns 400 when image header signature is corrupt or invalid', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    const corruptFile = new File([new Uint8Array([0x00, 0x00, 0x00, 0x00])], 'corrupt.jpg', {
      type: 'image/jpeg',
    });
    const formData = new FormData();
    formData.append('image', corruptFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('bozuk');
  });

  it('returns extracted wagons with confidence metadata on OCR success', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    vi.mocked(recognizeWagonList).mockResolvedValue({
      ok: true,
      processingTimeMs: 420,
      processedWidth: 1440,
      processedHeight: 900,
      lines: [
        {
          text: '3175 2461 776-8 KAYSERI 25,5',
          confidence: 0.96,
          bbox: { x1: 50, y1: 100, x2: 400, y2: 130 },
        },
        {
          text: '3175 2752 262-5',
          confidence: 0.75, // Moderate confidence -> "Okumayı kontrol edin"
          bbox: { x1: 50, y1: 150, x2: 300, y2: 180 },
        },
        {
          text: '3375 4569 183-2',
          confidence: 0.55, // Low confidence -> "Numarayı doğrulayın"
          bbox: { x1: 50, y1: 200, x2: 300, y2: 230 },
        },
      ],
      warnings: [],
    });

    const validFile = new File([VALID_JPEG_BYTES], 'wagon.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', validFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.wagons).toHaveLength(3);

    // Row 1: High confidence (no warning)
    expect(json.wagons[0].serial).toBe('2461');
    expect(json.wagons[0].wagonNo).toBe('776-8');
    expect(json.wagons[0].confidence).toBe(0.96);
    expect(json.wagons[0].confidenceWarning).toBeUndefined();

    // Row 2: Moderate confidence
    expect(json.wagons[1].serial).toBe('2752');
    expect(json.wagons[1].wagonNo).toBe('262-5');
    expect(json.wagons[1].confidenceWarning).toBe('Okumayı kontrol edin');

    // Row 3: Low confidence
    expect(json.wagons[2].serial).toBe('4569');
    expect(json.wagons[2].wagonNo).toBe('183-2');
    expect(json.wagons[2].confidenceWarning).toBe('Numarayı doğrulayın');
  });

  it('rejects malicious technical fields in OCR response (tare/wagonType MUST NOT affect results)', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    // Simulated malicious response from poisoned or buggy OCR output
    const fakeOcrResponse = {
      ok: true,
      processingTimeMs: 300,
      processedWidth: 1000,
      processedHeight: 600,
      lines: [
        {
          text: '3175 2461 776-8',
          confidence: 0.98,
          tare: 99.99, // Malicious tare
          wagonType: 'FAKE_WAGON_TYPE', // Malicious type
        },
      ],
      warnings: [],
      tare: 12.34,
      wagonType: 'POISONED',
    } as any;

    vi.mocked(recognizeWagonList).mockResolvedValue(fakeOcrResponse);

    const validFile = new File([VALID_JPEG_BYTES], 'wagon.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', validFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);

    // Verify top-level has no technical fields
    expect(json.tare).toBeUndefined();
    expect(json.wagonType).toBeUndefined();

    // Verify wagon item has no technical fields injected by OCR
    expect(json.wagons[0].tare).toBeUndefined();
    expect(json.wagons[0].wagonType).toBeUndefined();
    expect(json.wagons[0].serial).toBe('2461');
    expect(json.wagons[0].wagonNo).toBe('776-8');
  });

  it('returns 504 on OCR timeout error', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    vi.mocked(recognizeWagonList).mockRejectedValue(
      new OcrClientError('Fotoğraf okuma işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.', 504)
    );

    const validFile = new File([VALID_JPEG_BYTES], 'wagon.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', validFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(504);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('zaman aşımına uğradı');
  });

  it('returns 503 on OCR service unreachable error', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    vi.mocked(recognizeWagonList).mockRejectedValue(
      new OcrClientError(
        'Fotoğraf okuma servisine ulaşılamadı. Metin Yapıştır seçeneğini kullanabilirsiniz.',
        503
      )
    );

    const validFile = new File([VALID_JPEG_BYTES], 'wagon.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', validFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('Metin Yapıştır');
  });

  it('returns 502 on malformed OCR JSON response', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    vi.mocked(recognizeWagonList).mockRejectedValue(
      new OcrClientError('Fotoğraf okuma servisinden geçersiz JSON yanıtı alındı.', 502)
    );

    const validFile = new File([VALID_JPEG_BYTES], 'wagon.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', validFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('geçersiz JSON');
  });

  it('returns 400 when no wagon numbers are recognized in the image', async () => {
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });

    vi.mocked(recognizeWagonList).mockResolvedValue({
      ok: true,
      processingTimeMs: 250,
      processedWidth: 800,
      processedHeight: 600,
      lines: [
        {
          text: 'REJIM SERI VAGON NO', // Header only, not a wagon identity
          confidence: 0.99,
        },
      ],
      warnings: [],
    });

    const validFile = new File([VALID_JPEG_BYTES], 'wagon.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', validFile);
    const req = createMockRequest(formData);

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe('Fotoğrafta okunabilir vagon numarası bulunamadı.');
  });
});
