import { describe, it, expect } from 'vitest';
import {
  parseSingleDaraLine,
  resolveWagonsForTare,
  calculateTareTotals,
  validateUicCheckDigit,
  DaraWagonInput,
} from '../vagon-dara-engine';
import { WagonRecord } from '@/types/raybilgi';
import vagonRaw from '@/data/vagon_data.json';

const lookup: Record<string, WagonRecord> = {};
for (const item of vagonRaw as unknown as WagonRecord[]) {
  if (item.seri) {
    lookup[item.seri] = item;
  }
}

describe('Independent Wagon OCR & Engine Integration', () => {
  it('validates UIC Modulo 10 check digits correctly', () => {
    // 3175 4568 213-8 (authentic valid)
    const v1 = validateUicCheckDigit('3175', '4568', '213-8');
    expect(v1.isValid).toBe(true);
    expect(v1.warning).toBeUndefined();

    // 3175 4568 213-9 (invalid check digit 9 instead of 8)
    const v2 = validateUicCheckDigit('3175', '4568', '213-9');
    expect(v2.isValid).toBe(false);
    expect(v2.expectedCheckDigit).toBe(8);
    expect(v2.actualCheckDigit).toBe(9);
    expect(v2.warning).toContain('Beklenen: 8');

    // 2175 3302 603-5 (2-axle valid)
    const v3 = validateUicCheckDigit('2175', '3302', '603-5');
    expect(v3.isValid).toBe(true);

    // Regime omitted but valid with candidate regimes (4568 213-8)
    const v4 = validateUicCheckDigit('', '4568', '213-8');
    expect(v4.isValid).toBe(true);
  });
  it('parses synthetic railway table lines correctly', () => {
    const line1 = '3175 2461 776-8 KAYSERI';
    const p1 = parseSingleDaraLine(line1);
    expect(p1).not.toBeNull();
    expect(p1?.regime).toBe('3175');
    expect(p1?.serial).toBe('2461');
    expect(p1?.wagonNo).toBe('776-8');

    const line2 = '3175 2752 262-5 ARIFIYE';
    const p2 = parseSingleDaraLine(line2);
    expect(p2?.serial).toBe('2752');
    expect(p2?.wagonNo).toBe('262-5');

    const line3 = '2175 3302 474-1 IZMIT';
    const p3 = parseSingleDaraLine(line3);
    expect(p3?.serial).toBe('3302');
    expect(p3?.wagonNo).toBe('474-1');
  });

  it('parses real test1.png recognized lines', () => {
    const rawLines = [
      '175 4568 213-8 CORLU 4',
      '175 4569 397-8 CORLU 4',
      '475 2752 237-7 KOSEKOY',
      '175 4540 102-6 YEDEK',
      '175 2461 215-7 TEKERBKLF TI',
      '475 6641 457-7 HAYRETTIN',
      '075 9229 069-8 REV. DA',
      'M175 3302 603-5 REV.',
      '175 6936 081-8 BALANSVG',
      '175 7851 023-0 YEDEK',
      '175 6641 663-9 YEDEK',
      '175 6641 472-6 YEDEK',
      '075 9103 005-5 ARIFIYE',
    ];

    const parsed = rawLines.map((l) => ({ raw: l, res: parseSingleDaraLine(l) }));

    parsed.forEach(({ raw, res }) => {
      console.log(`[RAW]: ${raw} =>`, res);
      expect(res).not.toBeNull();
      expect(res?.serial).toBeTruthy();
      expect(res?.wagonNo).toBeTruthy();
    });
  });

  it('resolves authentic tare and lengths strictly from canonical database', () => {
    const inputs: DaraWagonInput[] = [
      { id: '1', regime: '3175', serial: '4568', wagonNo: '213-8' },
      { id: '2', regime: '3175', serial: '4569', wagonNo: '397-8' },
      { id: '3', regime: '3175', serial: '2752', wagonNo: '237-7' },
      { id: '4', regime: '3175', serial: '6936', wagonNo: '081-8' }, // unknown serial
    ];

    const rows = resolveWagonsForTare(inputs, lookup);
    expect(rows[0].status).toBe('resolved');
    expect(rows[0].tare).toBe(23);
    expect(rows[0].wagonType).toBe('Sgss');

    expect(rows[1].status).toBe('resolved');
    expect(rows[1].tare).toBe(23);

    expect(rows[2].status).toBe('resolved');
    expect(rows[2].tare).toBe(28);
    expect(rows[2].wagonType).toBe('Habis');

    // 6936 must NOT have guessed tare or wagon type
    expect(rows[3].status).toBe('unknown_serial');
    expect(rows[3].tare).toBeNull();
    expect(rows[3].wagonType).toBe('');

    const totals = calculateTareTotals(rows);
    // Only resolved rows counted in tare: 23 + 23 + 28 = 74
    expect(totals.totalTare).toBe(74);
    expect(totals.resolvedCount).toBe(3);
    expect(totals.controlNeededCount).toBe(1);
  });
});
