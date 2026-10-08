/**
 * THBF Çözümleyici — saf (DOM/PDF bağımsız) parser ve çıktı mantığı.
 *
 * Kaynak doğruluk: RayBilgi masaüstü `mod_thbf.py` → `_parse_thbf_pdf`.
 * Bu modül, PDF.js'ten çıkarılan metin parçalarını masaüstü parser'ın
 * (PyMuPDF `get_text("words")` + span rengi) kurallarıyla birebir işler.
 *
 * Gizlilik: Bu modül hiçbir ağ / depolama API'si kullanmaz.
 */

/** PDF.js textContent öğesinden türetilmiş, konumlu metin parçası. */
export type ThbfTextItem = {
  str: string;
  /** Sol kenar (PDF birimi). PyMuPDF `x0` ile aynı koordinat sistemi. */
  x: number;
  /** Taban çizgisi y (PDF birimi). */
  y: number;
  /** Parçanın genişliği (PDF birimi). */
  width: number;
};

/** Operator list üzerinden rengi belirlenmiş metin çizimi. */
export type ThbfColoredRun = {
  str: string;
  y: number;
  /** [r, g, b] 0..255 */
  color: [number, number, number];
};

export type ThbfPageData = {
  items: ThbfTextItem[];
  coloredRuns: ThbfColoredRun[];
};

export type ThbfRow = {
  /** Stabil satır kimliği (sıra numarası; tekilleştirme sonrası benzersiz). */
  id: string;
  sira: number;
  dingil: number;
  tip: string;
  regime: string;
  seri: string;
  vagon_no: string;
  gidecegi: string;
};

export type ThbfParseResult = {
  rows: ThbfRow[];
  /** Masaüstü parser'ın da yok saydığı soluk gri (pasif) vagon sayısı. */
  ignoredGrayCount: number;
  warnings: string[];
};

/** PyMuPDF renk tamsayısı 9211020 = 0x8C8C8C = rgb(140,140,140). */
export const THBF_GRAY_INT = 9211020;

export function rgbToInt([r, g, b]: [number, number, number]): number {
  return (r << 16) | (g << 8) | b;
}

const WAGON_IN_TEXT = /\d{7}-\d/;
const WAGON_FULL = /^\d{7}-\d$/;
const LINE_TOLERANCE = 2.0;
/** Aynı kelimeye ait bitişik parçalar arasındaki maksimum boşluk. */
const JOIN_GAP = 0.6;
const SAME_BASELINE = 0.5;

/** Masaüstü `_tr_upper` ile aynı. */
export function trUpper(value: string): string {
  const map: Record<string, string> = {
    i: 'İ', ı: 'I', ş: 'Ş', ğ: 'Ğ', ü: 'Ü', ö: 'Ö', ç: 'Ç',
  };
  return Array.from(value ?? '')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .toUpperCase();
}

type Word = { text: string; x0: number; y: number };

/**
 * PDF.js parçalarını PyMuPDF `get_text("words")` benzeri kelimelere çevirir:
 * aynı taban çizgisinde bitişik (boşluksuz) parçalar birleştirilir,
 * boşluk karakterlerinde kelime bölünür.
 */
export function buildWords(items: ThbfTextItem[]): Word[] {
  const words: Word[] = [];
  let current: { text: string; x0: number; y: number; endX: number } | null = null;

  const flush = () => {
    if (current && current.text.length > 0) {
      words.push({ text: current.text, x0: current.x0, y: current.y });
    }
    current = null;
  };

  for (const item of items) {
    const str = item.str ?? '';
    if (str.length === 0) continue;
    const chars = Array.from(str);
    const charW = chars.length > 0 ? item.width / chars.length : 0;

    chars.forEach((ch, idx) => {
      const cx = item.x + charW * idx;
      if (/\s/.test(ch)) {
        flush();
        return;
      }
      const cur = current as { text: string; x0: number; y: number; endX: number } | null;
      if (
        cur &&
        Math.abs(cur.y - item.y) <= SAME_BASELINE &&
        Math.abs(cx - cur.endX) <= JOIN_GAP
      ) {
        cur.text += ch;
        cur.endX = cx + charW;
      } else {
        flush();
        current = { text: ch, x0: cx, y: item.y, endX: cx + charW };
      }
    });
  }
  flush();
  return words;
}

/** Tek sayfa için masaüstü `_parse_thbf_pdf` döngüsü. */
function parsePage(page: ThbfPageData, out: Omit<ThbfRow, 'id'>[], stats: { gray: number }) {
  const wagonColors = page.coloredRuns.filter((r) => WAGON_IN_TEXT.test(r.str));
  const words = buildWords(page.items);

  for (const wagon of words.filter((w) => WAGON_FULL.test(w.text))) {
    const fullNo = wagon.text;

    let color = 0;
    for (const vc of wagonColors) {
      if (Math.abs(vc.y - wagon.y) < LINE_TOLERANCE) {
        color = rgbToInt(vc.color);
        break;
      }
    }
    if (color === THBF_GRAY_INT) {
      stats.gray += 1;
      continue;
    }

    const line = words
      .filter((w) => Math.abs(w.y - wagon.y) < LINE_TOLERANCE)
      .sort((a, b) => a.x0 - b.x0);

    const firstIn = (xmin: number, xmax: number, pred: (s: string) => boolean = () => true) => {
      const found = line.find((w) => xmin <= w.x0 && w.x0 < xmax && pred(w.text));
      return found ? found.text : '';
    };

    const seq = firstIn(15, 31, (s) => /^\d+$/.test(s));
    const axle = firstIn(30, 54, (s) => s === '2' || s === '4' || s === '6');
    const tip = firstIn(54, 81);
    const regime = firstIn(80, 100, (s) => /^\d{4}$/.test(s));
    const destination = trUpper(
      line.filter((w) => 340 <= w.x0 && w.x0 < 410).map((w) => w.text).join(' '),
    );

    if (!seq || !axle || !regime) continue;
    const seqI = Number.parseInt(seq, 10);
    if (!Number.isFinite(seqI) || seqI < 1 || seqI > 99) continue;

    out.push({
      sira: seqI,
      dingil: Number.parseInt(axle, 10),
      tip: tip.replace(/\n/g, ' ').split(/\s+/).filter(Boolean).join(' '),
      regime,
      seri: fullNo.slice(0, 4),
      vagon_no: fullNo.slice(4),
      gidecegi: destination,
    });
  }
}

/** Tüm sayfaları işler; aynı sıra → son okunan kalır; sıraya göre artan. */
export function parseThbfPages(pages: ThbfPageData[]): ThbfParseResult {
  const collected: Omit<ThbfRow, 'id'>[] = [];
  const stats = { gray: 0 };
  for (const page of pages) parsePage(page, collected, stats);

  const unique = new Map<number, Omit<ThbfRow, 'id'>>();
  for (const row of collected) unique.set(row.sira, row);

  const rows: ThbfRow[] = Array.from(unique.keys())
    .sort((a, b) => a - b)
    .map((k) => ({ id: `sira-${k}`, ...(unique.get(k) as Omit<ThbfRow, 'id'>) }));

  const warnings: string[] = [];
  for (const row of rows) {
    if (canonicalWagonNo(row) === null) {
      warnings.push(`Sıra ${row.sira}: 12 haneli vagon numarası üretilemedi; bu satır kopyalanmayacak.`);
    }
  }
  return { rows, ignoredGrayCount: stats.gray, warnings };
}

/** regime + seri + vagon_no (tiresiz). 12 hane değilse null. Number dönüşümü yok. */
export function canonicalWagonNo(row: Pick<ThbfRow, 'regime' | 'seri' | 'vagon_no'>): string | null {
  const canon = `${row.regime}${row.seri}${row.vagon_no.replace(/-/g, '')}`;
  return /^\d{12}$/.test(canon) ? canon : null;
}

export const SAHA_LAYOUTS = ['4-4-4', '8-4', '11-1', '12 Direkt'] as const;
export type SahaLayout = (typeof SAHA_LAYOUTS)[number];
export const DEFAULT_SAHA_LAYOUT: SahaLayout = '4-4-4';

/** Kanonik 12 haneli numarayı seçilen düzene göre hücrelere böler. */
export function splitWagonNo(canon: string, layout: SahaLayout): string[] {
  const dashed = canon.length === 12 ? canon.slice(0, 11) + '-' + canon.slice(11) : canon;
  switch (layout) {
    case '4-4-4':
      return [dashed.slice(0, 4), dashed.slice(4, 8), dashed.slice(8)];
    case '8-4':
      return [dashed.slice(0, 8), dashed.slice(8)];
    case '11-1':
      return [dashed.slice(0, 11), dashed.slice(11)];
    case '12 Direkt':
      return [dashed];
  }
}

export type CopyPayload = {
  text: string;
  html: string;
  copiedCount: number;
  skippedCount: number;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Pano çıktısı: her vagon = vagon no hücreleri + gideceği (son sütun),
 * hücreler TAB, satırlar \n ile ayrılır (masaüstü ile aynı ayraçlar).
 * HTML varyantında hücreler Excel'in metin olarak yorumlaması için
 * `mso-number-format:"\@"` ve `x:str` ile işaretlenir; görünür içerik değişmez.
 */
export function buildCopyPayload(rows: ThbfRow[], layout: SahaLayout): CopyPayload {
  const textLines: string[] = [];
  const htmlRows: string[] = [];
  let skipped = 0;

  for (const row of rows) {
    const canon = canonicalWagonNo(row);
    if (canon === null) {
      skipped += 1;
      continue;
    }
    const wagonChunks = splitWagonNo(canon, layout);
    const destination = row.gidecegi;
    const cells = [...wagonChunks, destination];
    
    textLines.push(cells.join('\t'));
    
    const htmlCells = [
      ...wagonChunks.map((c) => {
        if (/^\d+$/.test(c)) {
          const format = '0'.repeat(c.length);
          const numVal = parseInt(c, 10).toString();
          return `<td style='mso-number-format:"${format}"'>${numVal}</td>`;
        }
        return `<td x:str style='mso-number-format:"\\@"'>${escapeHtml(c)}</td>`;
      }),
      `<td x:str style='mso-number-format:"\\@"'>${escapeHtml(destination)}</td>`
    ];
    
    htmlRows.push('<tr>' + htmlCells.join('') + '</tr>');
  }

  const html =
    '<html><head><meta charset="utf-8"></head><body><table>' +
    htmlRows.join('') +
    '</table></body></html>';

  return { text: textLines.join('\n'), html, copiedCount: textLines.length, skippedCount: skipped };
}

/** Satır sırasını ters çevirir (yeni dizi). Seçim id tabanlı olduğundan korunur. */
export function reverseRows<T>(rows: T[]): T[] {
  return [...rows].reverse();
}

/** Mevcut görüntülenen sırayı koruyarak seçili satırları döndürür. */
export function selectedInOrder(rows: ThbfRow[], selectedIds: ReadonlySet<string>): ThbfRow[] {
  return rows.filter((r) => selectedIds.has(r.id));
}
