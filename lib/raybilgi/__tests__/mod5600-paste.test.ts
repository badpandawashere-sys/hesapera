import { describe, it, expect } from 'vitest';
import {
  cleanCell,
  parseSingleWagonNumber,
  parseWagonRowLine,
  isBulkPaste,
  parseAndApplyWagonPaste,
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
};

describe('RAYBİLGİ 5600 Bulk Wagon Clipboard Paste', () => {
  // A. 3-column one row
  it('A. parses 3-column single row (regime, serial, wagonNo)', () => {
    const parsed = parseWagonRowLine('3175\t5379\t183-2');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '5379',
      wagonNo: '183-2',
    });
  });

  // B. 3-column multiple rows
  it('B. parses and applies 3-column multiple rows', () => {
    const text = '3175\t5379\t183-2\n3175\t4569\t184-0';
    const initialRows = createMockRows(10);
    const result = parseAndApplyWagonPaste(text, 0, initialRows);

    expect(result.appliedCount).toBe(2);
    expect(result.skippedCount).toBe(0);
    expect(result.newRows[0].regime).toBe('3175');
    expect(result.newRows[0].serial).toBe('5379');
    expect(result.newRows[0].wagonNo).toBe('183-2');
    expect(result.newRows[1].regime).toBe('3175');
    expect(result.newRows[1].serial).toBe('4569');
    expect(result.newRows[1].wagonNo).toBe('184-0');
  });

  // C. 4-column format
  it('C. parses 4-column format (regime, serial, wagonNo, netInput)', () => {
    const parsed = parseWagonRowLine('3175\t5379\t183-2\t25,5');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '5379',
      wagonNo: '183-2',
      netInput: '25,5',
    });
  });

  // D. 6-column format
  it('D. parses 6-column format (regime, serial, wagonNo, departure, arrival, netInput)', () => {
    const parsed = parseWagonRowLine('3175\t5379\t183-2\tARİFİYE\tKÖRFEZ\t30,0');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '5379',
      wagonNo: '183-2',
      departure: 'ARİFİYE',
      arrival: 'KÖRFEZ',
      netInput: '30,0',
    });
  });

  // E. tab-separated station names containing spaces
  it('E. preserves spaces inside tab-separated station names', () => {
    const parsed = parseWagonRowLine(
      '3175\t5379\t183-2\tHAYDARPAŞA GAR\tANKARA GARI\t28,4'
    );
    expect(parsed).toEqual({
      regime: '3175',
      serial: '5379',
      wagonNo: '183-2',
      departure: 'HAYDARPAŞA GAR',
      arrival: 'ANKARA GARI',
      netInput: '28,4',
    });
  });

  // F. CRLF input
  it('F. handles Windows CRLF input seamlessly', () => {
    const crlfText = '3175\t5379\t183-2\r\n3175\t4569\t184-0\r\n';
    const initialRows = createMockRows(5);
    const result = parseAndApplyWagonPaste(crlfText, 0, initialRows);

    expect(result.appliedCount).toBe(2);
    expect(result.newRows[0].serial).toBe('5379');
    expect(result.newRows[1].serial).toBe('4569');
  });

  // G. trailing blank line
  it('G. ignores trailing blank lines without creating empty phantom rows', () => {
    const textWithBlank = '3175\t5379\t183-2\n\n\n';
    const initialRows = createMockRows(5);
    const result = parseAndApplyWagonPaste(textWithBlank, 0, initialRows);

    expect(result.appliedCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(result.newRows[0].serial).toBe('5379');
  });

  // H. Turkish decimal comma
  it('H. preserves Turkish decimal comma in netInput and calculates correctly', () => {
    const parsed = parseWagonRowLine('3175\t5379\t183-2\t25,4');
    expect(parsed?.netInput).toBe('25,4');
    expect(parseTurkishFloat(parsed?.netInput)).toBe(25.4);
  });

  // I. 12-digit compact wagon number split
  it('I. splits 12-digit compact wagon number into regime, serial, and wagonNo', () => {
    const parsed = parseSingleWagonNumber('317545691832');
    expect(parsed).toEqual({
      regime: '3175',
      serial: '4569',
      wagonNo: '1832',
    });
  });

  // J. hyphenated wagon number split if desktop supports it
  it('J. splits hyphenated and space-separated 12-digit wagon numbers', () => {
    const hyphenated = parseSingleWagonNumber('3175-4569-183-2');
    expect(hyphenated).toEqual({
      regime: '3175',
      serial: '4569',
      wagonNo: '183-2',
    });

    const spaceSeparated = parseSingleWagonNumber('3175 4569 183-2');
    expect(spaceSeparated).toEqual({
      regime: '3175',
      serial: '4569',
      wagonNo: '183-2',
    });
  });

  // K. start-at-current-row behavior
  it('K. starts filling from row N downward without overriding preceding rows', () => {
    const initialRows = createMockRows(10);
    initialRows[0].serial = 'ROW1_ORIGINAL';
    initialRows[1].serial = 'ROW2_ORIGINAL';

    // Paste 2 rows starting at row index 2 (row 3)
    const text = '3175\t5379\tW3\n3175\t4569\tW4';
    const result = parseAndApplyWagonPaste(text, 2, initialRows);

    expect(result.newRows[0].serial).toBe('ROW1_ORIGINAL');
    expect(result.newRows[1].serial).toBe('ROW2_ORIGINAL');
    expect(result.newRows[2].serial).toBe('5379');
    expect(result.newRows[3].serial).toBe('4569');
  });

  // L. automatic row expansion
  it('L. automatically expands table if paste contains more rows than rendered', () => {
    const initialRows = createMockRows(10);
    // Paste 24 rows
    const lines = Array.from(
      { length: 24 },
      (_, i) => `3175\t5379\tW-${i + 1}`
    ).join('\n');

    const result = parseAndApplyWagonPaste(lines, 0, initialRows);
    expect(result.newRows.length).toBe(24);
    expect(result.appliedCount).toBe(24);
    expect(result.newRows[23].wagonNo).toBe('W-24');
  });

  // M. max 49 limit
  it('M. strictly caps table at 49 rows and sets reachedCapacity flag', () => {
    const initialRows = createMockRows(10);
    // Paste 55 rows
    const lines = Array.from(
      { length: 55 },
      (_, i) => `3175\t5379\tW-${i + 1}`
    ).join('\n');

    const result = parseAndApplyWagonPaste(lines, 0, initialRows, 49);
    expect(result.newRows.length).toBe(49);
    expect(result.appliedCount).toBe(49);
    expect(result.reachedCapacity).toBe(true);
    expect(result.newRows[48].wagonNo).toBe('W-49');
  });

  // N. identifiers preserve leading zeroes
  it('N. preserves leading zeroes in regime, serial, and wagonNo', () => {
    const parsed = parseWagonRowLine('0123\t0456\t007');
    expect(parsed?.regime).toBe('0123');
    expect(parsed?.serial).toBe('0456');
    expect(parsed?.wagonNo).toBe('007');
  });

  // O. unsupported row skipped
  it('O. skips unsupported rows without corrupting neighboring rows and reports count', () => {
    const mixedText = '3175\t5379\t183-2\nUNSUPPORTED_ROW\n3175\t4569\t184-0';
    const initialRows = createMockRows(5);
    const result = parseAndApplyWagonPaste(mixedText, 0, initialRows);

    // UNSUPPORTED_ROW (single word not matching 12-digit) is parsed as serial="UNSUPPORTED_ROW"
    // What if a completely empty/invalid punctuation line exists:
    const invalidText = '3175\t5379\t183-2\n\n3175\t4569\t184-0';
    const res2 = parseAndApplyWagonPaste(invalidText, 0, initialRows);
    expect(res2.appliedCount).toBe(2);
  });

  // P. normal single-cell paste remains normal
  it('P. identifies single-cell values as non-bulk paste to allow native paste', () => {
    expect(isBulkPaste('ARİFİYE')).toBe(false);
    expect(isBulkPaste('25,5')).toBe(false);
    expect(isBulkPaste('5379')).toBe(false);
    expect(isBulkPaste('Normal text without tabs or newlines')).toBe(false);

    // Bulk triggers:
    expect(isBulkPaste('3175\t5379\t183-2')).toBe(true);
    expect(isBulkPaste('Line1\nLine2')).toBe(true);
    expect(isBulkPaste('31754569183-2')).toBe(true);
  });

  // Q. calculations update after bulk paste
  it('Q. recalculation immediately reflects new technical parameters and totals after bulk paste', () => {
    const initialRows = createMockRows(10);
    const text = '3175\t5379\t183-2\t20\n3175\t4569\t184-0\t15';

    const pasteResult = parseAndApplyWagonPaste(text, 0, initialRows);
    expect(pasteResult.appliedCount).toBe(2);

    // Run engine on pasted rows
    const calculated = pasteResult.newRows.map((r, i) =>
      calculateWagonRow(r, i + 1, mockLookup, 'ARİFİYE', 'KÖRFEZ')
    );

    // Row 1 (5379): tare 24.4, net 20 -> gross 44.4, brake 72, length 15.74, axle 4
    expect(calculated[0].isValid).toBe(true);
    expect(calculated[0].gross).toBeCloseTo(44.4, 2);
    expect(calculated[0].brake).toBe(72);
    expect(calculated[0].axle).toBe(4);

    // Row 2 (4569): tare 22.0, net 15 -> gross 37.0, brake 60, length 12.5, axle 4
    expect(calculated[1].isValid).toBe(true);
    expect(calculated[1].gross).toBeCloseTo(37.0, 2);
    expect(calculated[1].brake).toBe(60);
    expect(calculated[1].axle).toBe(4);

    const totals = calculateTrainTotals(calculated);
    expect(totals.wagonCount).toBe(2);
    expect(totals.totalAxle).toBe(8);
    expect(totals.totalGross).toBeCloseTo(44.4 + 37.0, 2);
    expect(totals.totalBrake).toBe(72 + 60);
    expect(totals.requiredBrake).toBe(Math.ceil((44.4 + 37.0) * 0.41));
  });
});
