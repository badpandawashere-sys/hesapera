import { calculateLgs } from '../lgs';
import { describe, it, expect } from 'vitest';

const allCorrect = { turkceC: 20, turkceW: 0, matematikC: 20, matematikW: 0, fenC: 20, fenW: 0, inkilapC: 10, inkilapW: 0, dinC: 10, dinW: 0, yabanciDilC: 10, yabanciDilW: 0 };
const allZero   = { turkceC: 0, turkceW: 0, matematikC: 0, matematikW: 0, fenC: 0, fenW: 0, inkilapC: 0, inkilapW: 0, dinC: 0, dinW: 0, yabanciDilC: 0, yabanciDilW: 0 };

describe('LGS Calculator', () => {
  it('should calculate perfect correct properly (total 90)', () => {
    const res = calculateLgs(allCorrect);
    expect(res.primaryResult).toBe('90.00 Net');
    expect(res.secondaryResults['Toplam Net']).toBe('90.00');
  });

  it('should give 0 net for all zero', () => {
    const res = calculateLgs(allZero);
    expect(res.primaryResult).toBe('0.00 Net');
  });

  it('should correctly apply 1/3 penalty WITHOUT negative clamp', () => {
    const res = calculateLgs({ ...allZero, turkceC: 0, turkceW: 20 });
    // 0 - 20/3 = -6.666... => -6.67
    expect(res.secondaryResults['Türkçe Neti']).toBe('-6.67 / 20');
  });

  it('should correctly calculate EXACT user golden mid range with valid limits', () => {
    const res = calculateLgs({
      turkceC: 15, turkceW: 3,
      matematikC: 12, matematikW: 6,
      fenC: 14, fenW: 3,
      inkilapC: 8, inkilapW: 3, // EXACT USER REQUEST
      dinC: 7, dinW: 3,
      yabanciDilC: 6, yabanciDilW: 3
    });
    
    expect(res.secondaryResults['Türkçe Neti']).toBe('14.00 / 20');
    expect(res.secondaryResults['Matematik Neti']).toBe('10.00 / 20');
    expect(res.secondaryResults['Fen Bilimleri Neti']).toBe('13.00 / 20');
    expect(res.secondaryResults['İnkılap Neti']).toBe('7.00 / 10');
    expect(res.secondaryResults['Din Kültürü Neti']).toBe('6.00 / 10');
    expect(res.secondaryResults['Yabancı Dil Neti']).toBe('5.00 / 10');
    expect(res.primaryResult).toBe('55.00 Net');
  });

  it('should handle exemption correctly (muafiyet)', () => {
    const res = calculateLgs({ ...allZero, turkceC: 10, dinMuaf: true });
    expect(res.secondaryResults['Din Kültürü Neti']).toBe('Muaf');
    // Total net is exactly what the remaining are: turkce 10 net = 10
    expect(res.primaryResult).toBe('10.00 Net');
    // Should contain exemption note
    const hasNote = res.notes.some(n => n.includes("Muafiyet durumunda"));
    expect(hasNote).toBe(true);
  });
});
