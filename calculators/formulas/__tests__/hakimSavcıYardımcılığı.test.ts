import { describe, it, expect } from 'vitest';
import { calculateHakimSavci } from '../hakimSavcıYardımcılığı';

describe('Hakim ve Savci Yardimciligi Calculator', () => {
  it('should calculate 100 net scenario exactly', () => {
    const res = calculateHakimSavci({
      gygk: { correct: 30, wrong: 0 },
      ortak: { correct: 35, wrong: 0 },
      adli: { correct: 35, wrong: 0 }
    });
    expect(res.primaryResult).toContain('100,000');
    expect(res.secondaryResults['Adli Yargı Toplam Net']).toBe('100,00');
    expect(res.notes.some(n => n.includes('70 puanlık temel başarı eşiğinin üzerinde'))).toBe(true);
  });

  it('should allow negative nets without clamping', () => {
    const res = calculateHakimSavci({
      gygk: { correct: 0, wrong: 30 },
      ortak: { correct: 0, wrong: 35 },
      adli: { correct: 0, wrong: 35 }
    });

    // gygk = -7.5
    // ortak = -8.75
    // adli = -8.75
    // gygk katkisi = (-7.5 / 30) * 20 = -5
    // alan katkisi = (-17.5 / 70) * 80 = -20
    // total = -25
    expect(res.primaryResult).toContain('-25,000');
    expect(res.secondaryResults['Genel Yetenek ve Genel Kültür Neti']).toBe('-7.50');
    expect(res.secondaryResults['Ortak Alan Bilgisi Neti']).toBe('-8.75');
    expect(res.secondaryResults['Adli Yargı Neti']).toBe('-8,75');
    expect(res.secondaryResults['Adli Yargı Toplam Net']).toBe('-25,00');
    expect(res.notes.some(n => n.includes('70 puanlık temel başarı eşiğinin altında'))).toBe(true);
  });

  it('should calculate multiple special fields', () => {
    const res = calculateHakimSavci({
      gygk: { correct: 15, wrong: 0 }, // net 15
      ortak: { correct: 17, wrong: 4 }, // net 16
      adli: { correct: 20, wrong: 4 }, // net 19
      idari: { correct: 25, wrong: 0 } // net 25
    });

    // adli tahmini: gygk(10) + alan((16+19)/70*80 = 40) = 50
    // idari tahmini: gygk(10) + alan((16+25)/70*80 = 46.857) = 56.857
    expect(res.primaryResult).toContain('Adli Yargı: 50,000');
    expect(res.primaryResult).toContain('İdari Yargı: 56,857');
  });

  it('should warn when no special field is filled', () => {
    const res = calculateHakimSavci({
      gygk: { correct: 30, wrong: 0 },
      ortak: { correct: 35, wrong: 0 }
    });
    expect(res.primaryResult).toContain('Lütfen en az bir özel alan');
  });
});
