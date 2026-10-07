// @vitest-environment node
/**
 * THBF masaüstü ↔ web parser parity testi (YALNIZ LOKAL).
 *
 * Hassas THBF örnekleri repoya konmaz. Bu test yalnızca aşağıdaki ortam
 * değişkenleri verildiğinde çalışır; aksi halde atlanır:
 *   THBF_SAMPLE_PDF   : lokal PDF yolu
 *   THBF_GOLDEN_JSON  : masaüstü mod_thbf._parse_thbf_pdf çıktısı (JSON)
 *   THBF_GOLDEN_GRAY  : (opsiyonel) masaüstünün yok saydığı gri vagon sayısı
 * Test çıktısına vagon verisi yazılmaz; yalnız sayılar raporlanır.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { parseThbfPages } from '../thbf';
import { extractThbfPages } from '../thbf-pdf';

const samplePath = process.env.THBF_SAMPLE_PDF;
const goldenPath = process.env.THBF_GOLDEN_JSON;
const enabled = Boolean(samplePath && goldenPath && fs.existsSync(samplePath) && fs.existsSync(goldenPath));

const FIELDS = ['sira', 'dingil', 'tip', 'regime', 'seri', 'vagon_no', 'gidecegi'] as const;

describe.skipIf(!enabled)('THBF parser parity (local sample)', () => {
  it('web parser matches desktop golden exactly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfjs = require('pdfjs-dist');
    const data = new Uint8Array(fs.readFileSync(samplePath as string));
    const pages = await extractThbfPages(pdfjs, data);
    const result = parseThbfPages(pages);
    const golden = JSON.parse(fs.readFileSync(goldenPath as string, 'utf-8')) as Array<Record<string, unknown>>;

    let fieldMismatches = 0;
    let orderMismatches = 0;
    const n = Math.min(golden.length, result.rows.length);
    for (let i = 0; i < n; i++) {
      const w = result.rows[i] as unknown as Record<string, unknown>;
      if (w.sira !== golden[i].sira) orderMismatches++;
      for (const f of FIELDS) if (w[f] !== golden[i][f]) fieldMismatches++;
    }
    const countMismatch = golden.length === result.rows.length ? 0 : 1;
    const expectedGray = process.env.THBF_GOLDEN_GRAY;
    const grayMismatch = expectedGray !== undefined && Number(expectedGray) !== result.ignoredGrayCount ? 1 : 0;

    console.log(
      `[THBF parity] desktop=${golden.length} web=${result.rows.length} ` +
        `grayWeb=${result.ignoredGrayCount} grayDesktop=${expectedGray ?? 'n/a'} ` +
        `field=${fieldMismatches} order=${orderMismatches} warnings=${result.warnings.length}`,
    );

    expect(countMismatch + fieldMismatches + orderMismatches + grayMismatch).toBe(0);
  });
});
