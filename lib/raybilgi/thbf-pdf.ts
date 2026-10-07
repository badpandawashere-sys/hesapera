/**
 * THBF — PDF.js tabanlı, tamamen tarayıcı içi metin + renk çıkarımı.
 *
 * Masaüstü PyMuPDF iki kaynak kullanır: `get_text("words")` (konum) ve
 * `get_text("dict")` span rengi. Burada eşdeğerleri:
 *  - konum: `page.getTextContent()` öğeleri
 *  - renk:  `page.getOperatorList()` üzerinde grafik durumu (CTM, metin
 *           matrisi, dolgu rengi) izlenerek her `showText` çiziminin
 *           taban çizgisi y'si ve gerçek dolgu rengi.
 *
 * PDF baytları hiçbir zaman ağ, depolama veya analitiğe gönderilmez.
 * PDF.js kütüphanesi parametre olarak verilir (istemcide dinamik import,
 * testlerde Node build) — bu modül statik olarak pdfjs import etmez.
 */
import type { ThbfColoredRun, ThbfPageData, ThbfTextItem } from './thbf';

type Matrix = [number, number, number, number, number, number];

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

/** m1 × m2 (PDF satır-vektör sözleşmesi). */
function multiply(m1: Matrix, m2: Matrix): Matrix {
  return [
    m1[0] * m2[0] + m1[1] * m2[2],
    m1[0] * m2[1] + m1[1] * m2[3],
    m1[2] * m2[0] + m1[3] * m2[2],
    m1[2] * m2[1] + m1[3] * m2[3],
    m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
    m1[4] * m2[1] + m1[5] * m2[3] + m2[5],
  ];
}

// Minimal PDF.js arayüzü (pdfjs-dist 3.x)
type PdfjsLike = {
  OPS: Record<string, number>;
  getDocument: (src: Record<string, unknown>) => { promise: Promise<PdfDocLike> };
};
type PdfDocLike = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPageLike>;
  destroy?: () => Promise<void>;
};
type PdfPageLike = {
  getTextContent: () => Promise<{ items: Array<Record<string, unknown>> }>;
  getOperatorList: () => Promise<{ fnArray: number[]; argsArray: unknown[][] }>;
};

type GlyphLike = { unicode?: string } | number | null;

function glyphsToString(glyphs: unknown): string {
  if (!Array.isArray(glyphs)) return '';
  let s = '';
  for (const g of glyphs as GlyphLike[]) {
    if (g && typeof g === 'object' && typeof g.unicode === 'string') s += g.unicode;
  }
  return s;
}

/** Operator list'ten her metin çiziminin (str, taban y, dolgu rengi) listesini üretir. */
export function extractColoredRuns(
  OPS: Record<string, number>,
  opList: { fnArray: number[]; argsArray: unknown[][] },
): ThbfColoredRun[] {
  const runs: ThbfColoredRun[] = [];
  let ctm: Matrix = [...IDENTITY];
  let fill: [number, number, number] = [0, 0, 0];
  let tm: Matrix = [...IDENTITY];
  let tlm: Matrix = [...IDENTITY];
  let leading = 0;
  const stack: Array<{ ctm: Matrix; fill: [number, number, number]; leading: number }> = [];

  const moveText = (tx: number, ty: number) => {
    tlm = multiply([1, 0, 0, 1, tx, ty], tlm);
    tm = [...tlm];
  };
  const emit = (glyphs: unknown) => {
    const str = glyphsToString(glyphs);
    if (!str) return;
    const m = multiply(tm, ctm);
    runs.push({ str, y: m[5], color: [...fill] as [number, number, number] });
  };

  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    const args = (opList.argsArray[i] ?? []) as unknown[];
    switch (fn) {
      case OPS.save:
        stack.push({ ctm: [...ctm], fill: [...fill] as [number, number, number], leading });
        break;
      case OPS.restore: {
        const s = stack.pop();
        if (s) {
          ctm = s.ctm;
          fill = s.fill;
          leading = s.leading;
        }
        break;
      }
      case OPS.transform:
        ctm = multiply(args.map(Number) as Matrix, ctm);
        break;
      case OPS.setFillRGBColor: {
        const c = args as unknown as ArrayLike<number>;
        fill = [Number(c[0]), Number(c[1]), Number(c[2])];
        break;
      }
      case OPS.beginText:
        tm = [...IDENTITY];
        tlm = [...IDENTITY];
        break;
      case OPS.setTextMatrix: {
        const m = (Array.isArray(args[0]) ? args[0] : args).map(Number) as Matrix;
        tm = [...m];
        tlm = [...m];
        break;
      }
      case OPS.moveText:
        moveText(Number(args[0]), Number(args[1]));
        break;
      case OPS.setLeading:
        leading = Number(args[0]);
        break;
      case OPS.setLeadingMoveText:
        leading = -Number(args[1]);
        moveText(Number(args[0]), Number(args[1]));
        break;
      case OPS.nextLine:
        moveText(0, -leading);
        break;
      case OPS.showText:
      case OPS.showSpacedText:
        emit(args[0]);
        break;
      case OPS.nextLineShowText:
        moveText(0, -leading);
        emit(args[0]);
        break;
      case OPS.nextLineSetSpacingShowText:
        moveText(0, -leading);
        emit(args[2]);
        break;
      default:
        break;
    }
  }
  return runs;
}

export class ThbfPdfError extends Error {}

/** PDF baytlarını (yalnız bellek) sayfa verilerine dönüştürür. */
export async function extractThbfPages(pdfjs: PdfjsLike, data: Uint8Array): Promise<ThbfPageData[]> {
  let doc: PdfDocLike;
  try {
    doc = await pdfjs.getDocument({
      data,
      // CVE-2024-4367 azaltımı: font derlemede eval kullanılmaz.
      isEvalSupported: false,
      // Harici standart font / CMap indirmesi yapılmaz.
      useSystemFonts: false,
      disableFontFace: true,
      verbosity: 0,
    }).promise;
  } catch {
    throw new ThbfPdfError('PDF dosyası açılamadı. Dosyanın bozuk veya şifreli olmadığından emin olun.');
  }

  const pages: ThbfPageData[] = [];
  try {
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const [text, ops] = await Promise.all([page.getTextContent(), page.getOperatorList()]);
      const items: ThbfTextItem[] = [];
      for (const raw of text.items) {
        if (typeof raw.str !== 'string' || !Array.isArray(raw.transform)) continue;
        const t = raw.transform as number[];
        items.push({ str: raw.str, x: t[4], y: t[5], width: Number(raw.width) || 0 });
      }
      pages.push({ items, coloredRuns: extractColoredRuns(pdfjs.OPS, ops) });
    }
  } finally {
    await doc.destroy?.();
  }
  return pages;
}
