import { describe, it, expect } from 'vitest';
import {
  cleanCell,
  parseSingleWagonNumber,
  parseFullWagonIdentity,
  parseWagonRowLine,
  isBulkPaste,
  parseAndApplyWagonPaste,
  isKnownSerial,
  isWagonNoCandidate,
  isNetTonCandidate,
  isStationCandidate,
} from '@/lib/raybilgi/mod5600-paste';
import { calculateWagonRow, calculateTrainTotals, parseTurkishFloat } from '@/lib/raybilgi/mod5600-engine';
import { WagonRecord, WagonRowInput } from '@/types/raybilgi';

function createMockRows(count: number): WagonRowInput[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i + 1}`,
    regime: '',
    serial: '',
    wagonNo: '',
    departure: '',
    arrival: '',
    netInput: '',
  }));
}

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
  '4569': {
    seri: '4569',
    vagon: 'Fas',
    dingil: 4,
    dara: 22.0,
    uzunluk: 12.5,
    fren_bos: 20,
    fren_dolu: 60,
    fren_aralik: 30,
  },
  '2461': {
    seri: '2461',
    vagon: 'Eaos',
    dingil: 4,
    dara: 21.5,
    uzunluk: 14.04,
    fren_bos: 24,
    fren_dolu: 68,
    fren_aralik: 25,
  },
  '2752': {
    seri: '2752',
    vagon: 'Falns',
    dingil: 4,
    dara: 23.0,
    uzunluk: 13.0,
    fren_bos: 22,
    fren_dolu: 64,
    fren_aralik: 25,
  },
  '2851': {
    seri: '2851',
    vagon: 'Habis',
    dingil: 4,
    dara: 25.0,
    uzunluk: 16.0,
    fren_bos: 28,
    fren_dolu: 75,
    fren_aralik: 25,
  },
};

describe('RAYBİLGİ 5600 Smart Interpretive Parser Test Matrix', () => {
  // A. compact full wagon id only
  it('A. compact full wagon id only', () => {
    const parsed = parseWagonRowLine('31752461776-8');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      confidence: 'strong',
    });
  });

  // B. spaced full wagon id only
  it('B. spaced full wagon id only', () => {
    const parsed = parseWagonRowLine('3175 2461 776-8');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      confidence: 'strong',
    });
  });

  // C. hyphenated full wagon id
  it('C. hyphenated full wagon id', () => {
    const parsed = parseWagonRowLine('3175-2461-776-8');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      confidence: 'strong',
    });
  });

  // D. full wagon id + arrival
  it('D. full wagon id + arrival', () => {
    const parsedTab = parseWagonRowLine('31752461776-8\tKAYSERİ');
    expect(parsedTab).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      arrival: 'KAYSERİ',
      confidence: 'strong',
    });

    const parsedSpaced = parseWagonRowLine('3175 2461 776-8 KAYSERİ');
    expect(parsedSpaced).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      arrival: 'KAYSERİ',
      confidence: 'strong',
    });
  });

  // E. full wagon id + net
  it('E. full wagon id + net', () => {
    const parsedTab = parseWagonRowLine('31752461776-8\t25,5');
    expect(parsedTab).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      netInput: '25,5',
      confidence: 'strong',
    });

    const parsedSpaced = parseWagonRowLine('3175 2461 776-8 25,5');
    expect(parsedSpaced).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      netInput: '25,5',
      confidence: 'strong',
    });
  });

  // F. full wagon id + arrival + net
  it('F. full wagon id + arrival + net', () => {
    const parsed = parseWagonRowLine('3175 2461 776-8 KAYSERİ 25,5');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      arrival: 'KAYSERİ',
      netInput: '25,5',
      confidence: 'strong',
    });

    const parsedCompact = parseWagonRowLine('31752461776-8 KAYSERİ 25,5');
    expect(parsedCompact).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      arrival: 'KAYSERİ',
      netInput: '25,5',
      confidence: 'strong',
    });
  });

  // G. 3 explicit cells
  it('G. 3 explicit cells', () => {
    const parsed = parseWagonRowLine('3175\t2461\t776-8');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      confidence: 'strong',
    });
  });

  // H. 4 explicit cells -> arrival
  it('H. 4 explicit cells -> arrival', () => {
    const parsed = parseWagonRowLine('3175\t2461\t776-8\tKAYSERİ');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      departure: '',
      arrival: 'KAYSERİ',
      netInput: '',
      confidence: 'strong',
    });
  });

  // I. 5 explicit cells -> arrival + net
  it('I. 5 explicit cells -> arrival + net', () => {
    const parsed = parseWagonRowLine('3175\t2461\t776-8\tKAYSERİ\t25,5');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      departure: '',
      arrival: 'KAYSERİ',
      netInput: '25,5',
      confidence: 'strong',
    });
  });

  // J. 6 explicit cells -> departure + arrival + net
  it('J. 6 explicit cells -> departure + arrival + net', () => {
    const parsed = parseWagonRowLine('3175\t5379\t183-2\tARİFİYE\tKÖRFEZ\t30,0');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '5379',
      wagonNo: '183-2',
      departure: 'ARİFİYE',
      arrival: 'KÖRFEZ',
      netInput: '30,0',
      confidence: 'strong',
    });
  });

  // K. serial + wagonNo only uses existing row regime
  it('K. serial + wagonNo only uses existing row regime', () => {
    const rows = createMockRows(5);
    rows[0].regime = '3175';

    const result = parseAndApplyWagonPaste('2461\t776-8', 0, rows);
    expect(result.appliedCount).toBe(1);
    expect(result.newRows[0].regime).toBe('3175');
    expect(result.newRows[0].serial).toBe('2461');
    expect(result.newRows[0].wagonNo).toBe('776-8');
  });

  // L. partial paste does not wipe existing arrival/net
  it('L. partial paste does not wipe existing arrival/net', () => {
    const rows = createMockRows(5);
    rows[0].regime = '3175';
    rows[0].arrival = 'KAYSERİ';
    rows[0].netInput = '25,5';

    const result = parseAndApplyWagonPaste('2461\t776-8', 0, rows);
    expect(result.newRows[0].regime).toBe('3175');
    expect(result.newRows[0].serial).toBe('2461');
    expect(result.newRows[0].wagonNo).toBe('776-8');
    expect(result.newRows[0].arrival).toBe('KAYSERİ');
    expect(result.newRows[0].netInput).toBe('25,5');
  });

  // M. existing row plus arrival/net-only contextual paste if supported safely
  it('M. existing row plus arrival/net-only contextual paste if supported safely', () => {
    const rows = createMockRows(5);
    rows[0].regime = '3175';
    rows[0].serial = '2461';
    rows[0].wagonNo = '776-8';

    const result = parseAndApplyWagonPaste('KAYSERİ\t25,5', 0, rows);
    expect(result.newRows[0].regime).toBe('3175');
    expect(result.newRows[0].serial).toBe('2461');
    expect(result.newRows[0].wagonNo).toBe('776-8');
    expect(result.newRows[0].arrival).toBe('KAYSERİ');
    expect(result.newRows[0].netInput).toBe('25,5');
  });

  // N. multi-word station: HAYDARPAŞA GAR
  it('N. multi-word station: HAYDARPAŞA GAR', () => {
    const parsed = parseWagonRowLine('3175 2461 776-8 HAYDARPAŞA GAR 25,5');
    expect(parsed?.arrival).toBe('HAYDARPAŞA GAR');
    expect(parsed?.netInput).toBe('25,5');
    expect(parsed?.regime).toBe('3175');
    expect(parsed?.serial).toBe('2461');
    expect(parsed?.wagonNo).toBe('776-8');
  });

  // O. Turkish decimal comma
  it('O. Turkish decimal comma', () => {
    const parsed = parseWagonRowLine('3175 2461 776-8 KAYSERİ 25,5');
    expect(parsed?.netInput).toBe('25,5');
    expect(parseTurkishFloat(parsed?.netInput)).toBe(25.5);
  });

  // P. decimal dot
  it('P. decimal dot', () => {
    const parsed = parseWagonRowLine('3175 2461 776-8 ANKARA 25.5');
    expect(parsed?.netInput).toBe('25.5');
    expect(parseTurkishFloat(parsed?.netInput)).toBe(25.5);
  });

  // Q. integer net ton
  it('Q. integer net ton', () => {
    const parsed = parseWagonRowLine('3175 2461 776-8 ANKARA 20');
    expect(parsed?.netInput).toBe('20');
    expect(parseTurkishFloat(parsed?.netInput)).toBe(20);
  });

  // R. known 4-digit serial not mistaken for net
  it('R. known 4-digit serial not mistaken for net', () => {
    expect(isNetTonCandidate('2461')).toBe(false);
    expect(isNetTonCandidate('2752')).toBe(false);
    expect(isNetTonCandidate('2851')).toBe(false);
    expect(isNetTonCandidate('5379')).toBe(false);
  });

  // S. regime not mistaken for net
  it('S. regime not mistaken for net', () => {
    expect(isNetTonCandidate('3175')).toBe(false);
    expect(isNetTonCandidate('2175')).toBe(false);
  });

  // T. leading zeros preserved
  it('T. leading zeros preserved', () => {
    const parsed = parseWagonRowLine('0123\t0456\t007-1');
    expect(parsed?.regime).toBe('0123');
    expect(parsed?.serial).toBe('0456');
    expect(parsed?.wagonNo).toBe('007-1');
  });

  // U. multi-row mixed forms
  it('U. multi-row mixed forms', () => {
    const text =
      '3175 2461 776-8 KAYSERİ 25,5\n' +
      '3175 2461 473-2 ANKARA 20\n' +
      '3175 2752 262-5 ILICA 42,3\n' +
      '3175 2851 209-6 KARS';
    const rows = createMockRows(10);
    const result = parseAndApplyWagonPaste(text, 0, rows);

    expect(result.appliedCount).toBe(4);
    expect(result.skippedCount).toBe(0);

    expect(result.newRows[0].arrival).toBe('KAYSERİ');
    expect(result.newRows[0].netInput).toBe('25,5');

    expect(result.newRows[1].arrival).toBe('ANKARA');
    expect(result.newRows[1].netInput).toBe('20');

    expect(result.newRows[2].arrival).toBe('ILICA');
    expect(result.newRows[2].netInput).toBe('42,3');

    expect(result.newRows[3].arrival).toBe('KARS');
    expect(result.newRows[3].netInput).toBe('');
  });

  // V. invalid ambiguous row skipped
  it('V. invalid ambiguous row skipped', () => {
    const text = '3175 2461 776-8\nRANDOM_GIBBERISH_NO_DIGITS\n3175 2461 473-2';
    const rows = createMockRows(5);
    const result = parseAndApplyWagonPaste(text, 0, rows);

    expect(result.appliedCount).toBe(2);
    expect(result.skippedCount).toBe(1);
    expect(result.newRows[0].wagonNo).toBe('776-8');
    expect(result.newRows[1].wagonNo).toBe('473-2');
  });

  // W. paste from focused row
  it('W. paste from focused row', () => {
    const rows = createMockRows(5);
    rows[0].serial = 'INITIAL_1';
    rows[1].serial = 'INITIAL_2';

    const result = parseAndApplyWagonPaste('3175 2461 776-8', 2, rows);
    expect(result.newRows[0].serial).toBe('INITIAL_1');
    expect(result.newRows[1].serial).toBe('INITIAL_2');
    expect(result.newRows[2].serial).toBe('2461');
    expect(result.newRows[2].wagonNo).toBe('776-8');
  });

  // X. automatic expansion
  it('X. automatic expansion', () => {
    const rows = createMockRows(5);
    const text = Array.from({ length: 15 }, (_, i) => `3175 2461 ${i + 1}-0`).join('\n');
    const result = parseAndApplyWagonPaste(text, 0, rows);

    expect(result.newRows.length).toBe(15);
    expect(result.appliedCount).toBe(15);
  });

  // Y. max 49 behavior
  it('Y. max 49 behavior', () => {
    const rows = createMockRows(5);
    const text = Array.from({ length: 55 }, (_, i) => `3175 2461 ${i + 1}-0`).join('\n');
    const result = parseAndApplyWagonPaste(text, 0, rows, 49);

    expect(result.newRows.length).toBe(49);
    expect(result.appliedCount).toBe(49);
    expect(result.reachedCapacity).toBe(true);
  });

  // Z. calculations update through existing engine
  it('Z. calculations update through existing engine', () => {
    const rows = createMockRows(5);
    const text = '3175 5379 183-2 KÖRFEZ 20\n3175 4569 184-0 KÖRFEZ 15';
    const result = parseAndApplyWagonPaste(text, 0, rows);

    const calculated = result.newRows.slice(0, 2).map((r, i) =>
      calculateWagonRow(r, i + 1, mockLookup, 'ARİFİYE', 'KÖRFEZ')
    );

    expect(calculated[0].isValid).toBe(true);
    expect(calculated[0].gross).toBeCloseTo(44.4, 2);
    expect(calculated[0].brake).toBe(72);
    expect(calculated[0].axle).toBe(4);

    expect(calculated[1].isValid).toBe(true);
    expect(calculated[1].gross).toBeCloseTo(37.0, 2);
    expect(calculated[1].brake).toBe(60);
    expect(calculated[1].axle).toBe(4);

    const totals = calculateTrainTotals(calculated);
    expect(totals.wagonCount).toBe(2);
    expect(totals.totalGross).toBeCloseTo(44.4 + 37.0, 2);
    expect(totals.totalBrake).toBe(72 + 60);
    expect(totals.requiredBrake).toBe(Math.ceil((44.4 + 37.0) * 0.41));
  });

  // AA. old rigid working formats still pass
  it('AA. old rigid working formats still pass', () => {
    expect(parseWagonRowLine('3175\t5379\t183-2')).toMatchObject({
      regime: '3175',
      serial: '5379',
      wagonNo: '183-2',
    });
    expect(parseWagonRowLine('3175\t2461\t776-8\tKAYSERİ')).toMatchObject({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      arrival: 'KAYSERİ',
    });
    expect(parseWagonRowLine('3175\t2461\t776-8\tKAYSERİ\t25,5')).toMatchObject({
      regime: '3175',
      serial: '2461',
      wagonNo: '776-8',
      arrival: 'KAYSERİ',
      netInput: '25,5',
    });
    expect(parseWagonRowLine('3175\t5379\t183-2\tARİFİYE\tKÖRFEZ\t30,0')).toMatchObject({
      regime: '3175',
      serial: '5379',
      wagonNo: '183-2',
      departure: 'ARİFİYE',
      arrival: 'KÖRFEZ',
      netInput: '30,0',
    });

    // Native single-cell pastes are not intercepted as bulk
    expect(isBulkPaste('ARİFİYE')).toBe(false);
    expect(isBulkPaste('25,5')).toBe(false);
    expect(isBulkPaste('5379')).toBe(false);
    expect(isBulkPaste('Normal text')).toBe(false);

    // Bulk triggers:
    expect(isBulkPaste('3175\t5379\t183-2')).toBe(true);
    expect(isBulkPaste('Line 1\nLine 2')).toBe(true);
    expect(isBulkPaste('31752461776-8')).toBe(true);
    expect(isBulkPaste('3175 2461 776-8 KAYSERİ 25,5')).toBe(true);
  });
});

describe('EXACT PRODUCTION REPRODUCTIONS', () => {
  // 1. "2461 776-8 KAYSERİ 25,5" with existing row regime 3175
  it('1. parses "2461 776-8 KAYSERİ 25,5" and preserves existing regime 3175', () => {
    const rows = createMockRows(5);
    rows[0].regime = '3175';

    const result = parseAndApplyWagonPaste('2461 776-8 KAYSERİ 25,5', 0, rows);
    expect(result.handled).toBe(true);
    expect(result.appliedCount).toBe(1);
    expect(result.newRows[0].regime).toBe('3175');
    expect(result.newRows[0].serial).toBe('2461');
    expect(result.newRows[0].wagonNo).toBe('776-8');
    expect(result.newRows[0].arrival).toBe('KAYSERİ');
    expect(result.newRows[0].netInput).toBe('25,5');
  });

  // 2. "3175 2461 776-8 KAYSERİ"
  it('2. parses "3175 2461 776-8 KAYSERİ" leaving netInput unchanged', () => {
    const rows = createMockRows(5);
    rows[0].netInput = '10,0';

    const result = parseAndApplyWagonPaste('3175 2461 776-8 KAYSERİ', 0, rows);
    expect(result.handled).toBe(true);
    expect(result.appliedCount).toBe(1);
    expect(result.newRows[0].regime).toBe('3175');
    expect(result.newRows[0].serial).toBe('2461');
    expect(result.newRows[0].wagonNo).toBe('776-8');
    expect(result.newRows[0].arrival).toBe('KAYSERİ');
    expect(result.newRows[0].netInput).toBe('10,0');
  });

  // 3. "2461 776-8 KAYSERİ"
  it('3. parses "2461 776-8 KAYSERİ" preserving existing regime', () => {
    const rows = createMockRows(5);
    rows[0].regime = '3175';

    const result = parseAndApplyWagonPaste('2461 776-8 KAYSERİ', 0, rows);
    expect(result.handled).toBe(true);
    expect(result.appliedCount).toBe(1);
    expect(result.newRows[0].regime).toBe('3175');
    expect(result.newRows[0].serial).toBe('2461');
    expect(result.newRows[0].wagonNo).toBe('776-8');
    expect(result.newRows[0].arrival).toBe('KAYSERİ');
  });

  // 4. "2461 776-8 HAYDARPAŞA GAR 25,5"
  it('4. parses "2461 776-8 HAYDARPAŞA GAR 25,5" with exact multi-word arrival', () => {
    const rows = createMockRows(5);
    const result = parseAndApplyWagonPaste('2461 776-8 HAYDARPAŞA GAR 25,5', 0, rows);
    expect(result.handled).toBe(true);
    expect(result.newRows[0].serial).toBe('2461');
    expect(result.newRows[0].wagonNo).toBe('776-8');
    expect(result.newRows[0].arrival).toBe('HAYDARPAŞA GAR');
    expect(result.newRows[0].netInput).toBe('25,5');
  });

  // 5. "3175 2461 776-8 HAYDARPAŞA GAR"
  it('5. parses "3175 2461 776-8 HAYDARPAŞA GAR" with full identity and multi-word arrival', () => {
    const rows = createMockRows(5);
    const result = parseAndApplyWagonPaste('3175 2461 776-8 HAYDARPAŞA GAR', 0, rows);
    expect(result.handled).toBe(true);
    expect(result.newRows[0].regime).toBe('3175');
    expect(result.newRows[0].serial).toBe('2461');
    expect(result.newRows[0].wagonNo).toBe('776-8');
    expect(result.newRows[0].arrival).toBe('HAYDARPAŞA GAR');
  });

  // 6. SMART HANDLED paste prevents native paste
  it('6. smart handled paste sets handled: true and single state application', () => {
    const result = parseAndApplyWagonPaste('2461 776-8 KAYSERİ 25,5', 0, createMockRows(5));
    expect(result.handled).toBe(true);
    expect(result.appliedCount).toBe(1);
  });

  // 7. netInput never duplicates / concatenates (25,5 must never become 25,525,5)
  it('7. netInput replaces exactly and never duplicates (no 25,525,5)', () => {
    const rows = createMockRows(5);
    rows[0].netInput = '25,5';

    const result = parseAndApplyWagonPaste('2461 776-8 KAYSERİ 25,5', 0, rows);
    expect(result.newRows[0].netInput).toBe('25,5');
    expect(result.newRows[0].netInput).not.toBe('25,525,5');
  });

  // 8. Single ordinary value "KAYSERİ" is NOT handled as smart row (allows native browser paste)
  it('8. single ordinary value "KAYSERİ" returns handled: false', () => {
    const result = parseAndApplyWagonPaste('KAYSERİ', 0, createMockRows(5));
    expect(result.handled).toBe(false);
    expect(result.appliedCount).toBe(0);
  });

  // 9. Single ordinary numeric value "25,5" is NOT handled as smart row (allows native browser paste)
  it('9. single ordinary numeric value "25,5" returns handled: false', () => {
    const result = parseAndApplyWagonPaste('25,5', 0, createMockRows(5));
    expect(result.handled).toBe(false);
    expect(result.appliedCount).toBe(0);
  });

  // 10. Existing tab-separated 3/4/5/6-cell pastes remain handled
  it('10. tab-separated 3/4/5/6-cell pastes return handled: true and correct fields', () => {
    const res3 = parseAndApplyWagonPaste('3175\t2461\t776-8', 0, createMockRows(5));
    expect(res3.handled).toBe(true);
    expect(res3.newRows[0].wagonNo).toBe('776-8');

    const res4 = parseAndApplyWagonPaste('3175\t2461\t776-8\tKAYSERİ', 0, createMockRows(5));
    expect(res4.handled).toBe(true);
    expect(res4.newRows[0].arrival).toBe('KAYSERİ');

    const res5 = parseAndApplyWagonPaste('3175\t2461\t776-8\tKAYSERİ\t25,5', 0, createMockRows(5));
    expect(res5.handled).toBe(true);
    expect(res5.newRows[0].netInput).toBe('25,5');

    const res6 = parseAndApplyWagonPaste('3175\t5379\t183-2\tARİFİYE\tKÖRFEZ\t30,0', 0, createMockRows(5));
    expect(res6.handled).toBe(true);
    expect(res6.newRows[0].departure).toBe('ARİFİYE');
    expect(res6.newRows[0].arrival).toBe('KÖRFEZ');
    expect(res6.newRows[0].netInput).toBe('30,0');
  });
});
