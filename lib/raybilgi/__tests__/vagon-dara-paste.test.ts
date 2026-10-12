import { describe, it, expect } from 'vitest';
import {
  parseSingleDaraLine,
  parsePasteForDara,
  isHeaderLine,
} from '@/lib/raybilgi/vagon-dara-engine';

describe('vagon-dara-paste', () => {
  describe('parseSingleDaraLine', () => {
    it('parses 3-column tab-separated format', () => {
      const line = '3175\t2461\t776-8';
      const parsed = parseSingleDaraLine(line);
      expect(parsed).toEqual({
        regime: '3175',
        serial: '2461',
        wagonNo: '776-8',
      });
    });

    it('parses 4-column tab-separated format (ignoring arrival)', () => {
      const line = '3175\t2461\t776-8\tKAYSERİ';
      const parsed = parseSingleDaraLine(line);
      expect(parsed).toEqual({
        regime: '3175',
        serial: '2461',
        wagonNo: '776-8',
      });
    });

    it('parses 5-column tab-separated format (ignoring arrival and net ton)', () => {
      const line = '3175\t2461\t776-8\tKAYSERİ\t25,5';
      const parsed = parseSingleDaraLine(line);
      expect(parsed).toEqual({
        regime: '3175',
        serial: '2461',
        wagonNo: '776-8',
      });
    });

    it('parses 6-column tab-separated format (ignoring departure, arrival and net ton)', () => {
      const line = '3175\t2461\t776-8\tANKARA\tKAYSERİ\t25,5';
      const parsed = parseSingleDaraLine(line);
      expect(parsed).toEqual({
        regime: '3175',
        serial: '2461',
        wagonNo: '776-8',
      });
    });

    it('parses 2-column tab-separated format (serial and wagonNo)', () => {
      const line = '2461\t776-8';
      const parsed = parseSingleDaraLine(line);
      expect(parsed).toEqual({
        regime: '',
        serial: '2461',
        wagonNo: '776-8',
      });
    });

    it('parses 12-digit compact wagon identity', () => {
      const line = '31752461776-8';
      const parsed = parseSingleDaraLine(line);
      expect(parsed).toEqual({
        regime: '3175',
        serial: '2461',
        wagonNo: '776-8',
      });
    });

    it('parses space-separated full identity', () => {
      const line = '3175 2461 776-8';
      const parsed = parseSingleDaraLine(line);
      expect(parsed).toEqual({
        regime: '3175',
        serial: '2461',
        wagonNo: '776-8',
      });
    });

    it('parses space-separated serial + wagonNo', () => {
      const line = '2461 776-8';
      const parsed = parseSingleDaraLine(line);
      expect(parsed).toEqual({
        regime: '',
        serial: '2461',
        wagonNo: '776-8',
      });
    });

    it('parses hyphenated serial-wagonNo', () => {
      const line = '2461-776-8';
      const parsed = parseSingleDaraLine(line);
      expect(parsed).toEqual({
        regime: '',
        serial: '2461',
        wagonNo: '776-8',
      });
    });

    it('parses free-text with station and net ton', () => {
      const line = '3175 2461 776-8 KAYSERİ 25,5';
      const parsed = parseSingleDaraLine(line);
      expect(parsed).toEqual({
        regime: '3175',
        serial: '2461',
        wagonNo: '776-8',
      });
    });
  });

  describe('isHeaderLine', () => {
    it('detects header lines and rejects data lines', () => {
      expect(isHeaderLine('Sıra\tRejim\tSeri\tVagon No\tVarış\tNet Ton')).toBe(true);
      expect(isHeaderLine('REJİM\tSERİ\tVAGON NO')).toBe(true);
      expect(isHeaderLine('3175\t2461\t776-8')).toBe(false);
    });
  });

  describe('parsePasteForDara', () => {
    it('parses multi-line text and filters headers', () => {
      const text = `
Sıra\tRejim\tSeri\tVagon No\tVarış\tNet Ton
1\t3175\t2461\t776-8\tKAYSERİ\t25,5
2\t3175\t4569\t183-2\tSİVAS\t26,0
31755379209-6
      `.trim();

      const { rows, truncated, totalLinesFound } = parsePasteForDara(text, 200);

      expect(rows).toHaveLength(3);
      expect(truncated).toBe(false);
      expect(totalLinesFound).toBe(3);

      expect(rows[0].regime).toBe('3175');
      expect(rows[0].serial).toBe('2461');
      expect(rows[0].wagonNo).toBe('776-8');

      expect(rows[1].regime).toBe('3175');
      expect(rows[1].serial).toBe('4569');
      expect(rows[1].wagonNo).toBe('183-2');

      expect(rows[2].regime).toBe('3175');
      expect(rows[2].serial).toBe('5379');
      expect(rows[2].wagonNo).toBe('209-6');
    });

    it('enforces maximum 200 row capacity limit', () => {
      const lines: string[] = [];
      for (let i = 0; i < 220; i++) {
        lines.push(`3175\t2461\t${i + 100}-1`);
      }
      const text = lines.join('\n');

      const { rows, truncated, totalLinesFound } = parsePasteForDara(text, 200);

      expect(totalLinesFound).toBe(220);
      expect(truncated).toBe(true);
      expect(rows).toHaveLength(200);
    });
  });
});
