import { describe, it, expect } from 'vitest';
import { calculateHakimSavci } from '../hakimSavcıYardımcılığı';

describe('Hakim Savcı Yardımcılığı Calculator Formula', () => {
  it('should not contain numeric fake score in results', () => {
    const res = calculateHakimSavci({
      gygk: { correct: 30, wrong: 0 },
      ortak: { correct: 35, wrong: 0 },
      adli: { correct: 35, wrong: 0 },
      idari: {},
      avukat: {}
    });

    const labels = res.results.map((r: any) => r.label);
    expect(labels).not.toContain('Adli Yargı Tahmini Genel Başarı Puanı');
    expect(labels).not.toContain('İdari Yargı Tahmini Genel Başarı Puanı');
    expect(labels).not.toContain('Adli Yargı-Avukat Tahmini Genel Başarı Puanı');

    // Exact official methodology note
    const noteFound = res.notes?.some((n: any) => n.includes('12 alt testin ayrı ayrı standartlaştırılmasıyla hesaplanır'));
    expect(noteFound).toBe(true);
  });

  it('should pass golden regression test exact nets', () => {
    const res = calculateHakimSavci({
      gygk: { correct: 8, wrong: 2 },     // Net: 7.50
      ortak: { correct: 17, wrong: 3 },   // Net: 16.25
      adli: { correct: 17, wrong: 3 },    // Net: 16.25
      idari: { correct: 10, wrong: 0 },   // Net: 10.00
      avukat: { correct: 15, wrong: 3 }   // Net: 14.25
    });

    const expected = {
      gygk: '7.50',
      ortak: '16.25',
      adliNet: '16.25',
      adliToplam: '40.00',
      idariNet: '10.00',
      idariToplam: '33.75',
      avukatNet: '14.25',
      avukatToplam: '38.00'
    };

    const getVal = (label: string) => res.results.find((r: any) => r.label === label)?.value;

    expect(getVal('Genel Yetenek ve Genel Kültür Neti')).toBe(expected.gygk);
    expect(getVal('Ortak Alan Bilgisi Neti')).toBe(expected.ortak);

    expect(getVal('Adli Yargı Neti')).toBe(expected.adliNet);
    expect(getVal('Adli Yargı Toplam Net')).toBe(expected.adliToplam);

    expect(getVal('İdari Yargı Neti')).toBe(expected.idariNet);
    expect(getVal('İdari Yargı Toplam Net')).toBe(expected.idariToplam);

    expect(getVal('Adli Yargı-Avukat Neti')).toBe(expected.avukatNet);
    expect(getVal('Adli Yargı-Avukat Toplam Net')).toBe(expected.avukatToplam);
  });

  it('should handle missing special tests', () => {
    const res = calculateHakimSavci({
      gygk: { correct: 20, wrong: 4 }, // 19 net
      ortak: { correct: 20, wrong: 4 }, // 19 net
      adli: {}, idari: {}, avukat: {}
    });
    expect(res.primaryResult).toContain('En az bir özel alan');
    expect(res.results.find((r: any) => r.label === 'Genel Yetenek ve Genel Kültür Neti')?.value).toBe('19.00');
  });

  it('should not clamp negative values', () => {
    const res = calculateHakimSavci({
      gygk: { correct: 0, wrong: 30 }, // -7.50 net
      ortak: { correct: 0, wrong: 35 }, // -8.75 net
      adli: { correct: 0, wrong: 35 }, // -8.75 net
      idari: {}, avukat: {}
    });
    expect(res.results.find((r: any) => r.label === 'Genel Yetenek ve Genel Kültür Neti')?.value).toBe('-7.50');
    expect(res.results.find((r: any) => r.label === 'Ortak Alan Bilgisi Neti')?.value).toBe('-8.75');
    expect(res.results.find((r: any) => r.label === 'Adli Yargı Neti')?.value).toBe('-8.75');
    expect(res.results.find((r: any) => r.label === 'Adli Yargı Toplam Net')?.value).toBe('-25.00');
  });
});
