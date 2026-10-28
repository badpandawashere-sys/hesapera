// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../analyze-image/route';
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/raybilgi/auth/session';
import { recognizeWagonList, OcrClientError } from '@/lib/raybilgi/ocr-client';
import {
  resolveWagonsForTare,
  calculateTareTotals,
  parsePasteForDara,
  DaraWagonInput,
} from '@/lib/raybilgi/vagon-dara-engine';
import { WagonRecord } from '@/types/raybilgi';

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

function createMockRequest(formData?: FormData): NextRequest {
  return {
    formData: async () => formData ?? new FormData(),
  } as unknown as NextRequest;
}

const VALID_PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

const mockWagonLookup: Record<string, WagonRecord> = {
  '2461': { seri: '2461', vagon: 'Eaos', dingil: 4, dara: 21.5, uzunluk: 14.04 },
  '4568': { seri: '4568', vagon: 'Falns', dingil: 4, dara: 23.2, uzunluk: 13.5 },
  '4569': { seri: '4569', vagon: 'Fas', dingil: 4, dara: '22,4', uzunluk: '12,50' },
  '5379': { seri: '5379', vagon: 'Ea', dingil: 4, dara: 24.4, uzunluk: 15.74 },
};

describe('Simplified Wagon OCR Pipeline & Deterministic Resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      stationCode: '06',
      stationName: 'Ankara Gar',
      expiresAt: new Date(Date.now() + 3600000),
    });
  });

  // 1. Tek Vagon
  it('1. processes a single wagon line correctly into deterministic resolution', async () => {
    vi.mocked(recognizeWagonList).mockResolvedValue({
      ok: true,
      processingTimeMs: 150,
      processedWidth: 0,
      processedHeight: 0,
      lines: [{ text: '3175 2461 776-8' }],
      warnings: [],
    });

    const formData = new FormData();
    formData.append('image', new File([VALID_PNG_BYTES], 'wagon.png', { type: 'image/png' }));
    const res = await POST(createMockRequest(formData));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.wagons).toHaveLength(1);
    expect(json.wagons[0].regime).toBe('3175');
    expect(json.wagons[0].serial).toBe('2461');
    expect(json.wagons[0].wagonNo).toBe('776-8');
    // Honest: no fabricated confidence
    expect(json.wagons[0].confidence).toBeUndefined();

    // Downstream resolution
    const resolved = resolveWagonsForTare(
      json.wagons.map((w: any, idx: number) => ({ id: `row-${idx}`, ...w })),
      mockWagonLookup
    );
    expect(resolved[0].status).toBe('resolved');
    expect(resolved[0].wagonType).toBe('Eaos');
    expect(resolved[0].tare).toBe(21.5);
  });

  // 2. Çok Satırlı Vagon Tablosu
  it('2. preserves order and extracts all rows from multi-line wagon table', async () => {
    vi.mocked(recognizeWagonList).mockResolvedValue({
      ok: true,
      processingTimeMs: 250,
      processedWidth: 0,
      processedHeight: 0,
      lines: [
        { text: '3175 2461 776-8' },
        { text: '3175 4568 213-8' },
        { text: '3175 4569 397-8' },
        { text: '3175 5379 209-6' },
      ],
      warnings: [],
    });

    const formData = new FormData();
    formData.append('image', new File([VALID_PNG_BYTES], 'table.png', { type: 'image/png' }));
    const res = await POST(createMockRequest(formData));
    const json = await res.json();

    expect(json.wagons).toHaveLength(4);
    expect(json.wagons[0].serial).toBe('2461');
    expect(json.wagons[1].serial).toBe('4568');
    expect(json.wagons[2].serial).toBe('4569');
    expect(json.wagons[3].serial).toBe('5379');

    const inputs: DaraWagonInput[] = json.wagons.map((w: any, i: number) => ({
      id: `w-${i}`,
      regime: w.regime,
      serial: w.serial,
      wagonNo: w.wagonNo,
    }));
    const resolved = resolveWagonsForTare(inputs, mockWagonLookup);
    const totals = calculateTareTotals(resolved);

    expect(totals.totalCount).toBe(4);
    expect(totals.resolvedCount).toBe(4);
    // 21.5 + 23.2 + 22.4 + 24.4 = 91.5
    expect(totals.totalTare).toBe(91.5);
  });

  // 3. Eksik ve Geçersiz Numaralar
  it('3. safely handles incomplete or partial numbers without crashing', async () => {
    vi.mocked(recognizeWagonList).mockResolvedValue({
      ok: true,
      processingTimeMs: 180,
      processedWidth: 0,
      processedHeight: 0,
      lines: [
        { text: '776-8' }, // Missing serial and regime
        { text: '999' }, // Incomplete fragment
      ],
      warnings: [],
    });

    const formData = new FormData();
    formData.append('image', new File([VALID_PNG_BYTES], 'partial.png', { type: 'image/png' }));
    const res = await POST(createMockRequest(formData));
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(json.wagons.length).toBeGreaterThanOrEqual(1);

    const inputs: DaraWagonInput[] = json.wagons.map((w: any, i: number) => ({
      id: `w-${i}`,
      regime: w.regime,
      serial: w.serial,
      wagonNo: w.wagonNo,
    }));
    const resolved = resolveWagonsForTare(inputs, mockWagonLookup);

    // Incomplete numbers must be marked 'incomplete' with null tare
    expect(resolved.some((r) => r.status === 'incomplete')).toBe(true);
    expect(resolved.find((r) => r.status === 'incomplete')?.tare).toBeNull();
  });

  // 4. Kontrol Hanesi Uyuşmazlığı / Belirsizliği
  it('4. flags formatting uncertainty when wagon number lacks hyphenated check-digit', async () => {
    vi.mocked(recognizeWagonList).mockResolvedValue({
      ok: true,
      processingTimeMs: 140,
      processedWidth: 0,
      processedHeight: 0,
      lines: [
        { text: '2461 776' }, // No hyphen or check digit
      ],
      warnings: [],
    });

    const formData = new FormData();
    formData.append('image', new File([VALID_PNG_BYTES], 'checkdigit.png', { type: 'image/png' }));
    const res = await POST(createMockRequest(formData));
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(json.wagons).toHaveLength(1);
    expect(json.wagons[0].confidenceWarning).toBe('Okumayı kontrol edin');
  });

  // 5. Mükerrer Vagon
  it('5. detects duplicate wagons in deterministic resolution without double-counting tare', async () => {
    vi.mocked(recognizeWagonList).mockResolvedValue({
      ok: true,
      processingTimeMs: 150,
      processedWidth: 0,
      processedHeight: 0,
      lines: [
        { text: '3175 2461 776-8' },
        { text: '3175 2461 776-8' }, // Duplicate
      ],
      warnings: [],
    });

    const formData = new FormData();
    formData.append('image', new File([VALID_PNG_BYTES], 'dup.png', { type: 'image/png' }));
    const res = await POST(createMockRequest(formData));
    const json = await res.json();

    const inputs: DaraWagonInput[] = json.wagons.map((w: any, i: number) => ({
      id: `w-${i}`,
      regime: w.regime,
      serial: w.serial,
      wagonNo: w.wagonNo,
    }));
    const resolved = resolveWagonsForTare(inputs, mockWagonLookup);
    expect(resolved[0].status).toBe('resolved');
    expect(resolved[0].isDuplicate).toBe(false);

    expect(resolved[1].status).toBe('duplicate');
    expect(resolved[1].isDuplicate).toBe(true);

    const totals = calculateTareTotals(resolved);
    expect(totals.totalCount).toBe(2);
    expect(totals.resolvedCount).toBe(1);
    expect(totals.duplicateCount).toBe(1);
    // Duplicate tare is NOT added twice: 21.5 only
    expect(totals.totalTare).toBe(21.5);
  });

  // 6. Veritabanında Bulunmayan Seri
  it('6. marks unlisted serial as unknown_serial and allows manual user correction', async () => {
    vi.mocked(recognizeWagonList).mockResolvedValue({
      ok: true,
      processingTimeMs: 160,
      processedWidth: 0,
      processedHeight: 0,
      lines: [{ text: '3175 9999 123-4' }],
      warnings: [],
    });

    const formData = new FormData();
    formData.append('image', new File([VALID_PNG_BYTES], 'unknown.png', { type: 'image/png' }));
    const res = await POST(createMockRequest(formData));
    const json = await res.json();

    const inputs: DaraWagonInput[] = json.wagons.map((w: any, i: number) => ({
      id: `w-${i}`,
      regime: w.regime,
      serial: w.serial,
      wagonNo: w.wagonNo,
    }));
    const resolved = resolveWagonsForTare(inputs, mockWagonLookup);

    expect(resolved[0].status).toBe('unknown_serial');
    expect(resolved[0].tare).toBeNull();
    expect(resolved[0].statusMessage).toContain('Kayıtlarda bulunmayan seri: 9999');

    // Simulate user correcting 9999 -> 2461 in place
    inputs[0].serial = '2461';
    const reResolved = resolveWagonsForTare(inputs, mockWagonLookup);
    expect(reResolved[0].status).toBe('resolved');
    expect(reResolved[0].tare).toBe(21.5);
  });

  // 7. Boş OCR Yanıtı
  it('7. returns HTTP 400 when OCR extracts zero lines', async () => {
    vi.mocked(recognizeWagonList).mockResolvedValue({
      ok: true,
      processingTimeMs: 110,
      processedWidth: 0,
      processedHeight: 0,
      lines: [],
      warnings: ['Fotoğrafta okunabilir vagon numarası bulunamadı.'],
    });

    const formData = new FormData();
    formData.append('image', new File([VALID_PNG_BYTES], 'blank.png', { type: 'image/png' }));
    const res = await POST(createMockRequest(formData));

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('Fotoğrafta okunabilir vagon numarası bulunamadı');
  });

  // 8. 429 ve Timeout
  it('8. correctly propagates 429 and 504 errors', async () => {
    // 429
    vi.mocked(recognizeWagonList).mockRejectedValueOnce(
      new OcrClientError('Fotoğraf okuma servisi kotası geçici olarak doldu.', 429)
    );
    const formData429 = new FormData();
    formData429.append('image', new File([VALID_PNG_BYTES], 'w.png', { type: 'image/png' }));
    const res429 = await POST(createMockRequest(formData429));
    expect(res429.status).toBe(429);

    // 504 Timeout
    vi.mocked(recognizeWagonList).mockRejectedValueOnce(
      new OcrClientError(
        'Fotoğraf analizi zaman aşımına uğradı. Lütfen daha küçük veya net bir fotoğrafla tekrar deneyin.',
        504
      )
    );
    const formData504 = new FormData();
    formData504.append('image', new File([VALID_PNG_BYTES], 'w.png', { type: 'image/png' }));
    const res504 = await POST(createMockRequest(formData504));
    expect(res504.status).toBe(504);
  });

  // 9. Manuel Giriş ve Excel Yapıştırma Regresyonları
  it('9. ensures Excel paste and manual entry workflows work identically without regressions', () => {
    const rawExcelPaste = `
Sıra\tRejim\tSeri\tVagon No\tDara
1\t3175\t2461\t776-8\t21,5
2\t3175\t4568\t213-8\t23,2
3\t3175\t4569\t397-8\t22,4
    `.trim();

    const { rows, truncated, totalLinesFound } = parsePasteForDara(rawExcelPaste);
    expect(truncated).toBe(false);
    expect(totalLinesFound).toBe(3);
    expect(rows).toHaveLength(3);
    expect(rows[0].serial).toBe('2461');
    expect(rows[0].wagonNo).toBe('776-8');

    const resolved = resolveWagonsForTare(rows, mockWagonLookup);
    expect(resolved).toHaveLength(3);
    expect(resolved.every((r) => r.status === 'resolved')).toBe(true);

    const totals = calculateTareTotals(resolved);
    expect(totals.totalCount).toBe(3);
    expect(totals.resolvedCount).toBe(3);
    // 21.5 + 23.2 + 22.4 = 67.1
    expect(totals.totalTare).toBe(67.1);
  });
});
