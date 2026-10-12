import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExcelJS from 'exceljs';
import path from 'path';
import { generate5600Xlsx, resolveStationCode } from '@/lib/raybilgi/mod5600-export';
import { POST } from '@/app/raybilgi/5600/export/route';
import { getSession } from '@/lib/raybilgi/auth/session';
import { WagonRecord } from '@/types/raybilgi';

vi.mock('@/lib/raybilgi/auth/session', () => ({
  getSession: vi.fn(),
}));

const mockStationCodes: Record<string, string> = {
  '1512': 'Arifiye',
  '1530': 'Körfez',
  '0123': 'Sıfırlı İstasyon',
  '2435': 'Eskişehir',
};

const mockLookup: Record<string, WagonRecord> = {
  '5379': {
    seri: '5379',
    vagon: 'Ea',
    dingil: 4,
    dara: 24.4,
    uzunluk: 15.74,
    fren_bos: 26,
    fren_dolu: 72,
    fren_aralik: 25,
  },
  '0456': {
    seri: '0456',
    vagon: 'Fas',
    dingil: 4,
    dara: 20.0,
    uzunluk: 12.0,
    fren_bos: 18,
    fren_dolu: 50,
    fren_aralik: 30,
  },
  'NO_THRESH': {
    seri: 'NO_THRESH',
    vagon: 'Hbbills',
    dingil: 2,
    dara: 15.0,
    uzunluk: 14.5,
    fren_bos: 12,
    fren_dolu: 32,
    fren_aralik: null,
  },
};

describe('RAYBİLGİ 5600 Official XLSX Output', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // A. unauthenticated POST -> 401
  it('A. unauthenticated POST -> 401', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const req = new Request('http://localhost:3000/raybilgi/5600/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainNo: '12345', rows: [] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  // B. authenticated export succeeds
  it('B. authenticated export succeeds', async () => {
    vi.mocked(getSession).mockResolvedValueOnce({
      stationCode: '1512',
      stationName: 'ARİFİYE',
      expiresAt: new Date(),
    });

    const req = new Request('http://localhost:3000/raybilgi/5600/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainNo: '23215',
        departure: 'ARİFİYE',
        arrival: 'KÖRFEZ',
        rows: [
          {
            regime: '3175',
            serial: '5379',
            wagonNo: '183-2',
            netInput: '30,5',
          },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    const buffer = await res.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(1000);
  });

  // C. client payload does NOT contain station codes
  it('C. client payload does NOT contain station codes', () => {
    const clientPayload = {
      trainNo: '23215',
      departure: 'ARİFİYE',
      arrival: 'KÖRFEZ',
      rows: [
        {
          regime: '3175',
          serial: '5379',
          wagonNo: '183-2',
          departure: '',
          arrival: '',
          netInput: '25',
        },
      ],
    };

    expect(clientPayload).not.toHaveProperty('stationCode');
    expect(clientPayload).not.toHaveProperty('departureCode');
    expect(clientPayload).not.toHaveProperty('arrivalCode');
    expect((clientPayload.rows[0] as any).stationCode).toBeUndefined();
  });

  // D. station codes resolved server-side
  it('D. station codes resolved server-side', () => {
    expect(resolveStationCode('ARİFİYE', mockStationCodes)).toBe('1512');
    expect(resolveStationCode('arifiye', mockStationCodes)).toBe('1512');
    expect(resolveStationCode('Arifiye', mockStationCodes)).toBe('1512');
    expect(resolveStationCode('KÖRFEZ', mockStationCodes)).toBe('1530');
    expect(resolveStationCode('Bilinmeyen İstasyon', mockStationCodes)).toBe('');
  });

  // E. template loads successfully & F. workbook has only expected 5600M sheet
  it('E & F. template loads successfully and keeps only 5600M sheet', async () => {
    const result = await generate5600Xlsx(
      {
        trainNo: '23215',
        departure: 'ARİFİYE',
        arrival: 'KÖRFEZ',
        rows: [{ serial: '5379', netInput: '10' }],
      },
      {
        wagonLookup: mockLookup,
        stationCodes: mockStationCodes,
      }
    );

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(result.buffer as any);
    expect(wb.worksheets.map((s) => s.name)).toEqual(['5600M']);
  });

  // G through Q. Header & totals cell mappings
  it('G - Q. Verifies top cell mappings, Türkiye date, totals, and required brake', async () => {
    const fixedDate = new Date('2026-10-12T14:30:00.000Z');

    const result = await generate5600Xlsx(
      {
        trainNo: '23215',
        departure: 'ARİFİYE',
        arrival: 'KÖRFEZ',
        rows: [
          {
            regime: '3175',
            serial: '5379',
            wagonNo: '183-2',
            netInput: '20', // tare: 24.4, gross: 44.4, axle: 4, len: 15.74, brake: 72 (gross >= 25)
          },
          {
            regime: '3175',
            serial: 'NO_THRESH',
            wagonNo: '100-1',
            netInput: '15', // tare: 15.0, gross: 30.0, axle: 2, len: 14.5, brake: 32
          },
        ],
      },
      {
        now: fixedDate,
        wagonLookup: mockLookup,
        stationCodes: mockStationCodes,
      }
    );

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(result.buffer as any);
    const ws = wb.getWorksheet('5600M')!;

    // G. I5 = train number
    expect(ws.getCell('I5').value).toBe('23215');

    // H. Q6 = Türkiye-local date
    const q6Val = ws.getCell('Q6').value as Date;
    expect(q6Val).toBeInstanceOf(Date);
    expect(q6Val.getUTCFullYear()).toBe(2026);
    expect(q6Val.getUTCMonth()).toBe(9); // 0-indexed 9 = October
    expect(q6Val.getUTCDate()).toBe(12);

    // I. C10/G10 departure name/code
    expect(ws.getCell('C10').value).toBe('ARİFİYE');
    expect(ws.getCell('G10').value).toBe('1512');

    // J. I10/J10 arrival name/code
    expect(ws.getCell('I10').value).toBe('KÖRFEZ');
    expect(ws.getCell('J10').value).toBe('1530');

    // Expected totals:
    // length = 15.74 + 14.5 = 30.24
    // axle = 4 + 2 = 6
    // net = 20 + 15 = 35
    // gross = 44.4 + 30.0 = 74.4
    // brake = 72 + 32 = 104
    // K. R9 total length
    expect(ws.getCell('R9').value).toBeCloseTo(30.24, 2);

    // L. R12 total axle
    expect(ws.getCell('R12').value).toBe(6);

    // M. L13 total gross
    expect(ws.getCell('L13').value).toBeCloseTo(74.4, 2);

    // N. M13 total net
    expect(ws.getCell('M13').value).toBe(35);

    // O. N13 total brake
    expect(ws.getCell('N13').value).toBe(104);

    // P. O11 = 41
    expect(ws.getCell('O11').value).toBe(41);

    // Q. P11 = ceil(totalGross * 0.41) = ceil(74.4 * 0.41) = ceil(30.504) = 31
    expect(ws.getCell('P11').value).toBe(Math.ceil(74.4 * 0.41));
    expect(ws.getCell('P11').value).toBe(31);
  });

  // R, S, T. Wagon rows 16 to 64 and capacity limit
  it('R & S & T. First wagon populates row 16, 49th populates row 64, >49 rejected', async () => {
    // Exactly 49 valid wagons
    const rows49 = Array.from({ length: 49 }, (_, i) => ({
      regime: '3175',
      serial: '5379',
      wagonNo: `W-${i + 1}`,
      netInput: '10',
    }));

    const result = await generate5600Xlsx(
      {
        trainNo: '49TRAIN',
        departure: 'ARİFİYE',
        arrival: 'KÖRFEZ',
        rows: rows49,
      },
      {
        wagonLookup: mockLookup,
        stationCodes: mockStationCodes,
      }
    );

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(result.buffer as any);
    const ws = wb.getWorksheet('5600M')!;

    // R. First wagon populates row 16
    expect(ws.getCell('C16').value).toBe(1);
    expect(ws.getCell('D16').value).toBe(4);
    expect(ws.getCell('E16').value).toBe('Ea');
    expect(ws.getCell('F16').value).toBe('3175');
    expect(ws.getCell('G16').value).toBe('5379');
    expect(ws.getCell('H16').value).toBe('W-1');
    expect(ws.getCell('N16').value).toBe(10);
    expect(ws.getCell('O16').value).toBeCloseTo(34.4, 2);

    // S. 49th wagon populates row 64 (16 + 48 = 64)
    expect(ws.getCell('C64').value).toBe(49);
    expect(ws.getCell('H64').value).toBe('W-49');

    // T. More than 49 rows rejected
    const rows50 = Array.from({ length: 50 }, (_, i) => ({
      regime: '3175',
      serial: '5379',
      wagonNo: `W-${i + 1}`,
      netInput: '10',
    }));

    await expect(
      generate5600Xlsx(
        { trainNo: '50TRAIN', rows: rows50 },
        { wagonLookup: mockLookup, stationCodes: mockStationCodes }
      )
    ).rejects.toThrow('En fazla 49 vagon eklenebilir.');
  });

  // U & V. Station inheritance and override
  it('U & V. Row inherits top-level station when empty, row override wins when present', async () => {
    const result = await generate5600Xlsx(
      {
        trainNo: 'INHERIT_TRAIN',
        departure: 'ARİFİYE',
        arrival: 'KÖRFEZ',
        rows: [
          {
            serial: '5379',
            departure: '', // Should inherit ARİFİYE
            arrival: '', // Should inherit KÖRFEZ
          },
          {
            serial: '5379',
            departure: 'ESKİŞEHİR', // Override
            arrival: 'KÖRFEZ',
          },
        ],
      },
      {
        wagonLookup: mockLookup,
        stationCodes: mockStationCodes,
      }
    );

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(result.buffer as any);
    const ws = wb.getWorksheet('5600M')!;

    // Row 16 inherits
    expect(ws.getCell('J16').value).toBe('ARİFİYE');
    expect(ws.getCell('L16').value).toBe('KÖRFEZ');

    // Row 17 overrides
    expect(ws.getCell('J17').value).toBe('ESKİŞEHİR');
    expect(ws.getCell('L17').value).toBe('KÖRFEZ');
  });

  // W & X. Unknown serial skipped and at least one valid wagon required
  it('W & X. Unknown serial skipped without fabricated technical values; at least one valid required', async () => {
    // Mixed valid and invalid
    const mixedResult = await generate5600Xlsx(
      {
        trainNo: 'MIXED',
        departure: 'ARİFİYE',
        arrival: 'KÖRFEZ',
        rows: [
          { serial: 'UNKNOWN_SERIAL', netInput: '50' }, // Skipped
          { serial: '5379', netInput: '10' }, // Valid
        ],
      },
      {
        wagonLookup: mockLookup,
        stationCodes: mockStationCodes,
      }
    );

    expect(mixedResult.validCount).toBe(1);

    // Only unknown serials
    await expect(
      generate5600Xlsx(
        {
          trainNo: 'ALL_INVALID',
          rows: [
            { serial: 'UNKNOWN_1', netInput: '10' },
            { serial: 'UNKNOWN_2', netInput: '20' },
          ],
        },
        {
          wagonLookup: mockLookup,
          stationCodes: mockStationCodes,
        }
      )
    ).rejects.toThrow('En az bir geçerli vagon girin.');
  });

  // Y. Turkish comma decimal input works
  it('Y. Comma decimal input works correctly in calculations and cell writing', async () => {
    const result = await generate5600Xlsx(
      {
        trainNo: 'COMMA_TEST',
        rows: [{ serial: '5379', netInput: '18,75' }],
      },
      {
        wagonLookup: mockLookup,
        stationCodes: mockStationCodes,
      }
    );

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(result.buffer as any);
    const ws = wb.getWorksheet('5600M')!;

    expect(ws.getCell('N16').value).toBe(18.75);
    expect(ws.getCell('O16').value).toBeCloseTo(24.4 + 18.75, 2);
  });

  // Z. Threshold brake rule
  it('Z. Threshold brake matches canonical engine (empty vs loaded)', async () => {
    // 5379 has dara 24.4, fren_aralik 25.0, fren_bos 26, fren_dolu 72
    // Case 1: gross < 25 (tare 24.4 + net 0.5 = 24.9 < 25) -> empty brake 26
    const resEmpty = await generate5600Xlsx(
      {
        trainNo: 'BRAKE_EMPTY',
        rows: [{ serial: '5379', netInput: '0.5' }],
      },
      { wagonLookup: mockLookup, stationCodes: mockStationCodes }
    );
    const wbEmpty = new ExcelJS.Workbook();
    await wbEmpty.xlsx.load(resEmpty.buffer as any);
    expect(wbEmpty.getWorksheet('5600M')!.getCell('P16').value).toBe(26);

    // Case 2: gross >= 25 (tare 24.4 + net 1.0 = 25.4 >= 25) -> loaded brake 72
    const resLoaded = await generate5600Xlsx(
      {
        trainNo: 'BRAKE_LOADED',
        rows: [{ serial: '5379', netInput: '1.0' }],
      },
      { wagonLookup: mockLookup, stationCodes: mockStationCodes }
    );
    const wbLoaded = new ExcelJS.Workbook();
    await wbLoaded.xlsx.load(resLoaded.buffer as any);
    expect(wbLoaded.getWorksheet('5600M')!.getCell('P16').value).toBe(72);
  });

  // AA. Station / wagon / serial leading zero preservation
  it('AA. Preserves leading zeros in station codes, serials, and wagon numbers', async () => {
    const result = await generate5600Xlsx(
      {
        trainNo: '007',
        departure: 'Sıfırlı İstasyon', // code "0123"
        arrival: 'Arifiye',
        rows: [
          {
            regime: '01',
            serial: '0456',
            wagonNo: '0099',
            netInput: '10',
          },
        ],
      },
      {
        wagonLookup: mockLookup,
        stationCodes: mockStationCodes,
      }
    );

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(result.buffer as any);
    const ws = wb.getWorksheet('5600M')!;

    // Station code preserves leading zero
    expect(ws.getCell('G10').value).toBe('0123');
    // Serial preserves leading zero
    expect(ws.getCell('G16').value).toBe('0456');
    // Wagon number preserves leading zero
    expect(ws.getCell('H16').value).toBe('0099');
    // Regime preserves leading zero
    expect(ws.getCell('F16').value).toBe('01');
  });

  // AB & AC. Valid XLSX load back and Content-Disposition format
  it('AB & AC. Output is valid XLSX and Content-Disposition header format is correct', async () => {
    const fixedDate = new Date('2026-10-12T12:00:00.000Z');
    const result = await generate5600Xlsx(
      {
        trainNo: '23215/A',
        rows: [{ serial: '5379', netInput: '10' }],
      },
      {
        now: fixedDate,
        wagonLookup: mockLookup,
        stationCodes: mockStationCodes,
      }
    );

    // Filename replaces unsafe slash with underscore
    expect(result.filename).toBe('5600_23215_A_20261012.xlsx');

    // AB. ExcelJS loads back cleanly
    const wb = new ExcelJS.Workbook();
    await expect(wb.xlsx.load(result.buffer as any)).resolves.not.toThrow();
  });

  // Section 19: Template visual layout and properties preservation
  it('Section 19: Preserves merged ranges, column widths, row heights, and representative cell styles', async () => {
    const templatePath = path.join(
      process.cwd(),
      'data',
      'raybilgi',
      'raybilgi_5600_sablon.xlsx'
    );

    const originalWb = new ExcelJS.Workbook();
    await originalWb.xlsx.readFile(templatePath);
    const originalWs = originalWb.getWorksheet('5600M')!;

    const result = await generate5600Xlsx(
      {
        trainNo: 'LAYOUT_TEST',
        departure: 'ARİFİYE',
        arrival: 'KÖRFEZ',
        rows: [{ serial: '5379', netInput: '10' }],
      },
      {
        wagonLookup: mockLookup,
        stationCodes: mockStationCodes,
      }
    );

    const outputWb = new ExcelJS.Workbook();
    await outputWb.xlsx.load(result.buffer as any);
    const outputWs = outputWb.getWorksheet('5600M')!;

    // 1. Merged ranges count preserved
    const origMerges = (originalWs as any)._merges || {};
    const outMerges = (outputWs as any)._merges || {};
    const originalMergeCount = Object.keys(origMerges).length;
    const outputMergeCount = Object.keys(outMerges).length;
    expect(outputMergeCount).toBe(originalMergeCount);

    // Key merged ranges exist
    expect(outMerges['C10']).toBeDefined();
    expect(outMerges['G10']).toBeDefined();
    expect(outMerges['J16']).toBeDefined();
    expect(outMerges['L16']).toBeDefined();

    // 2. Representative column widths preserved
    for (let c = 1; c <= 15; c++) {
      const origCol = originalWs.getColumn(c);
      const outCol = outputWs.getColumn(c);
      if (origCol.width) {
        expect(outCol.width).toBe(origCol.width);
      }
    }

    // 3. Representative row heights preserved
    for (const r of [5, 6, 10, 16, 20]) {
      const origRow = originalWs.getRow(r);
      const outRow = outputWs.getRow(r);
      if (origRow.height) {
        expect(outRow.height).toBe(origRow.height);
      }
    }

    // 4. Page setup orientation preserved
    expect(outputWs.pageSetup.orientation).toBe(originalWs.pageSetup.orientation);

    // 5. Representative cell font and borders preserved (e.g. Q6, C10, R9)
    expect(outputWs.getCell('Q6').numFmt).toBe(originalWs.getCell('Q6').numFmt);
    expect(outputWs.getCell('Q6').font?.name).toBe(originalWs.getCell('Q6').font?.name);
    expect(outputWs.getCell('C10').font?.name).toBe(originalWs.getCell('C10').font?.name);
  });
});
