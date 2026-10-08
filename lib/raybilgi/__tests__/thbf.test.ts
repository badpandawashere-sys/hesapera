import { describe, it, expect } from 'vitest';
import {
  buildCopyPayload,
  buildWords,
  canonicalWagonNo,
  DEFAULT_SAHA_LAYOUT,
  parseThbfPages,
  reverseRows,
  rgbToInt,
  SAHA_LAYOUTS,
  selectedInOrder,
  splitWagonNo,
  THBF_GRAY_INT,
  trUpper,
  type ThbfPageData,
  type ThbfRow,
  type ThbfTextItem,
} from '../thbf';
import { extractColoredRuns } from '../thbf-pdf';

const BLACK: [number, number, number] = [0, 0, 0];
const GRAY: [number, number, number] = [140, 140, 140];

/** Sentetik THBF satırı: PDF.js'in ürettiği gibi parçalı öğeler (rejim 2 parça). */
function line(opts: {
  y: number;
  sira: string;
  dingil?: string;
  tip?: string;
  regime: string;
  full: string;
  dest: string;
  color?: [number, number, number];
}): ThbfPageData {
  const { y } = opts;
  const items: ThbfTextItem[] = [
    { str: opts.sira, x: 20.8, y, width: 3.9 * opts.sira.length },
    { str: ' ', x: 24.7, y, width: 2 },
    { str: opts.dingil ?? '4', x: 34.1, y, width: 3.9 },
    { str: ' ', x: 38.0, y, width: 2 },
    { str: opts.regime.slice(0, 2), x: 82.9, y, width: 7.78 },
    { str: opts.regime.slice(2), x: 90.68, y, width: 7.78 },
    { str: ' ', x: 98.5, y, width: 2 },
    { str: opts.full, x: 100.5, y, width: 33.5 },
    { str: ' ', x: 134.0, y, width: 2 },
    { str: opts.dest, x: 356.6, y, width: 20 },
  ];
  if (opts.tip) items.push({ str: opts.tip, x: 59.9, y, width: 14 });
  return { items, coloredRuns: [{ str: opts.full, y, color: opts.color ?? BLACK }] };
}

function merge(...pages: ThbfPageData[]): ThbfPageData {
  return {
    items: pages.flatMap((p) => p.items),
    coloredRuns: pages.flatMap((p) => p.coloredRuns),
  };
}

function row(partial: Partial<ThbfRow> & Pick<ThbfRow, 'regime' | 'seri' | 'vagon_no'>): ThbfRow {
  return { id: 'x', sira: 1, dingil: 4, tip: '', gidecegi: 'ARIFIYE', ...partial };
}

describe('THBF parser', () => {
  it('A) 3353 + 7912345-6 → canonical 335379123456', () => {
    const res = parseThbfPages([line({ y: 400, sira: '1', regime: '3353', full: '7912345-6', dest: 'Arifiye' })]);
    expect(res.rows).toHaveLength(1);
    const r = res.rows[0];
    expect(r.regime).toBe('3353');
    expect(r.seri).toBe('7912');
    expect(r.vagon_no).toBe('345-6');
    expect(canonicalWagonNo(r)).toBe('335379123456');
    expect(typeof canonicalWagonNo(r)).toBe('string');
  });

  it('B) leading-zero canonical stays a 12-char string', () => {
    const res = parseThbfPages([line({ y: 400, sira: '1', regime: '0012', full: '3456789-0', dest: 'X' })]);
    expect(canonicalWagonNo(res.rows[0])).toBe('001234567890');
  });

  it('C/D/E/F) layouts split correctly, including leading zeros', () => {
    expect(SAHA_LAYOUTS).toEqual(['4-4-4', '8-4', '11-1', '12 Direkt']);
    expect(DEFAULT_SAHA_LAYOUT).toBe('4-4-4');
    expect(splitWagonNo('335379123456', '4-4-4')).toEqual(['3353', '7912', '345-6']);
    expect(splitWagonNo('335379123456', '8-4')).toEqual(['33537912', '345-6']);
    expect(splitWagonNo('335379123456', '11-1')).toEqual(['33537912345', '-6']);
    expect(splitWagonNo('335379123456', '12 Direkt')).toEqual(['33537912345-6']);
    expect(splitWagonNo('001234567890', '4-4-4')).toEqual(['0012', '3456', '789-0']);
    expect(splitWagonNo('001234567890', '8-4')).toEqual(['00123456', '789-0']);
    expect(splitWagonNo('001234567890', '11-1')).toEqual(['00123456789', '-0']);
    expect(splitWagonNo('001234567890', '12 Direkt')).toEqual(['00123456789-0']);
  });

  it('G) reverse ordering', () => {
    const res = parseThbfPages([
      merge(
        line({ y: 400, sira: '1', regime: '3353', full: '7912345-6', dest: 'A' }),
        line({ y: 380, sira: '2', regime: '3353', full: '7912346-4', dest: 'B' }),
        line({ y: 360, sira: '3', regime: '3353', full: '7912347-2', dest: 'C' }),
      ),
    ]);
    expect(res.rows.map((r) => r.sira)).toEqual([1, 2, 3]);
    const rev = reverseRows(res.rows);
    expect(rev.map((r) => r.sira)).toEqual([3, 2, 1]);
    expect(buildCopyPayload(rev, '12 Direkt').text.split('\n').map((l) => l.split('\t')[1])).toEqual(['C', 'B', 'A']);
  });

  it('H) selected rows survive reverse (stable ids) and follow new order', () => {
    const res = parseThbfPages([
      merge(
        line({ y: 400, sira: '1', regime: '3353', full: '7912345-6', dest: 'A' }),
        line({ y: 380, sira: '2', regime: '3353', full: '7912346-4', dest: 'B' }),
        line({ y: 360, sira: '3', regime: '3353', full: '7912347-2', dest: 'C' }),
      ),
    ]);
    const selected = new Set([res.rows[0].id, res.rows[2].id]);
    const rev = reverseRows(res.rows);
    expect(selectedInOrder(rev, selected).map((r) => r.sira)).toEqual([3, 1]);
    expect(selectedInOrder(res.rows, selected).map((r) => r.sira)).toEqual([1, 3]);
  });

  it('I) duplicate sira → last read row wins', () => {
    const res = parseThbfPages([
      line({ y: 400, sira: '5', regime: '3353', full: '7912345-6', dest: 'Ilk' }),
      line({ y: 400, sira: '5', regime: '3375', full: '4508113-1', dest: 'Son' }),
    ]);
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0].regime).toBe('3375');
    expect(res.rows[0].gidecegi).toBe('SON');
  });

  it('J) sira outside 1..99 is ignored', () => {
    const res = parseThbfPages([
      merge(
        line({ y: 400, sira: '0', regime: '3353', full: '7912345-6', dest: 'A' }),
        line({ y: 380, sira: '100', regime: '3353', full: '7912346-4', dest: 'B' }),
        line({ y: 360, sira: '99', regime: '3353', full: '7912347-2', dest: 'C' }),
      ),
    ]);
    expect(res.rows.map((r) => r.sira)).toEqual([99]);
  });

  it('K) gray (9211020) wagon rows are ignored', () => {
    expect(rgbToInt(GRAY)).toBe(THBF_GRAY_INT);
    const res = parseThbfPages([
      merge(
        line({ y: 400, sira: '1', regime: '3353', full: '7912345-6', dest: 'A' }),
        line({ y: 380, sira: '2', regime: '3353', full: '7912346-4', dest: 'B', color: GRAY }),
      ),
    ]);
    expect(res.rows.map((r) => r.sira)).toEqual([1]);
    expect(res.ignoredGrayCount).toBe(1);
  });

  it('L/M) gidecegi is always the final column; TSV tabs/newlines exact', () => {
    const rows = [
      row({ id: 'a', regime: '3353', seri: '7912', vagon_no: '345-6', gidecegi: 'ARIFIYE' }),
      row({ id: 'b', regime: '0012', seri: '3456', vagon_no: '789-0', gidecegi: 'KÖRFEZ' }),
    ];
    expect(buildCopyPayload(rows, '4-4-4').text).toBe('3353\t7912\t345-6\tARIFIYE\n0012\t3456\t789-0\tKÖRFEZ');
    expect(buildCopyPayload(rows, '8-4').text).toBe('33537912\t345-6\tARIFIYE\n00123456\t789-0\tKÖRFEZ');
    expect(buildCopyPayload(rows, '11-1').text).toBe('33537912345\t-6\tARIFIYE\n00123456789\t-0\tKÖRFEZ');
    expect(buildCopyPayload(rows, '12 Direkt').text).toBe('33537912345-6\tARIFIYE\n00123456789-0\tKÖRFEZ');
  });

  it('HTML clipboard variant marks cells as numeric/text appropriately without visible prefixes', () => {
    const p = buildCopyPayload([row({ regime: '0012', seri: '3456', vagon_no: '789-0', gidecegi: 'A<B' })], '4-4-4');
    // 0012 becomes a numeric cell with 0000 format
    expect(p.html).toContain(`<td style='mso-number-format:"0000"'>12</td>`);
    // 3456 becomes a numeric cell with 0000 format
    expect(p.html).toContain(`<td style='mso-number-format:"0000"'>3456</td>`);
    // 789-0 is non-numeric, remains x:str
    expect(p.html).toContain(`<td x:str style='mso-number-format:"\\@"'>789-0</td>`);
    expect(p.html).toContain('A&lt;B');
    expect(p.html).not.toContain("'0012");
    expect(p.html).not.toContain('="0012"');
    expect(p.text).not.toContain("'");
  });

  it('HTML clipboard formats 8-4 and 11-1 correctly as numeric', () => {
    const p8 = buildCopyPayload([row({ regime: '0012', seri: '3456', vagon_no: '789-0', gidecegi: 'X' })], '8-4');
    expect(p8.html).toContain(`<td style='mso-number-format:"00000000"'>123456</td>`);
    expect(p8.html).toContain(`<td x:str style='mso-number-format:"\\@"'>789-0</td>`);

    const p11 = buildCopyPayload([row({ regime: '0012', seri: '3456', vagon_no: '789-0', gidecegi: 'X' })], '11-1');
    expect(p11.html).toContain(`<td style='mso-number-format:"00000000000"'>123456789</td>`);
    expect(p11.html).toContain(`<td x:str style='mso-number-format:"\\@"'>-0</td>`);
  });

  it('numeric conversion is scoped ONLY to wagon cells; numeric destination remains text', () => {
    // 00123 is pure digits but semantically text because it's the destination
    const p = buildCopyPayload([row({ regime: '0012', seri: '3456', vagon_no: '789-0', gidecegi: '00123' })], '4-4-4');
    expect(p.html).toContain(`<td x:str style='mso-number-format:"\\@"'>00123</td>`);
  });

  it('non-12-digit canonical is not silently corrupted: warned and skipped on copy', () => {
    const bad = row({ id: 'bad', regime: '335', seri: '7912', vagon_no: '345-6' });
    const good = row({ id: 'good', regime: '3353', seri: '7912', vagon_no: '345-6' });
    expect(canonicalWagonNo(bad)).toBeNull();
    const p = buildCopyPayload([bad, good], '4-4-4');
    expect(p.copiedCount).toBe(1);
    expect(p.skippedCount).toBe(1);
    expect(p.text).toBe('3353\t7912\t345-6\tARIFIYE');
  });

  it('builds PyMuPDF-like words from split PDF.js fragments', () => {
    const words = buildWords([
      { str: 'Mal', x: 203.0, y: 1, width: 11.3 },
      { str: 'ı', x: 214.3, y: 1, width: 1.6 },
      { str: 'köy', x: 215.9, y: 1, width: 10.9 },
      { str: ' ', x: 226.8, y: 1, width: 2 },
      { str: 'Körfez', x: 306.0, y: 1, width: 20.2 },
    ]);
    expect(words.map((w) => w.text)).toEqual(['Malıköy', 'Körfez']);
    expect(words[0].x0).toBeCloseTo(203.0);
  });

  it('Turkish upper-casing matches desktop _tr_upper', () => {
    expect(trUpper('Körfez')).toBe('KÖRFEZ');
    expect(trUpper('Arifiye')).toBe('ARİFİYE');
    expect(trUpper('Malıköy')).toBe('MALIKÖY');
  });

  it('operator-list tracker reports exact fill colour and baseline per text run', () => {
    const OPS = { save: 1, restore: 2, transform: 3, setFillRGBColor: 4, beginText: 5, setTextMatrix: 6, moveText: 7, showText: 8 };
    const runs = extractColoredRuns(OPS as unknown as Record<string, number>, {
      fnArray: [1, 3, 4, 5, 6, 8, 2, 4, 5, 6, 7, 8],
      argsArray: [
        [],
        [1, 0, 0, 1, 0, 10],
        [140, 140, 140],
        [],
        [[7, 0, 0, 7, 100, 400]],
        [[{ unicode: '7912345-6' }]],
        [],
        [0, 0, 0],
        [],
        [[7, 0, 0, 7, 100, 300]],
        [0, 2],
        [[{ unicode: '7912346-4' }]],
      ],
    });
    expect(runs).toEqual([
      { str: '7912345-6', y: 410, color: [140, 140, 140] },
      { str: '7912346-4', y: 314, color: [0, 0, 0] },
    ]);
  });
});
