import { calculateMsu } from '../msu';
import { describe, it, expect } from 'vitest';

describe('MSU Calculator', () => {
  it('A) Tam sinirlar (40T, 20S, 40M, 20F)', () => {
    const res = calculateMsu('SAY', 40, 0, 20, 0, 40, 0, 20, 0);
    expect(res.primaryResult).toBe('500.000');
  });

  it('B) Sadece Turkce maksimum', () => {
    // SAY: turkce %25. 100 + (1 * 0.25 * 400) = 200
    const res = calculateMsu('SAY', 40, 0, 0, 0, 0, 0, 0, 0);
    expect(parseFloat(res.primaryResult)).toBeCloseTo(200, 0);
  });

  it('C) Sadece Sosyal maksimum', () => {
    // SOZ: sosyal %20. 100 + (1 * 0.20 * 400) = 180
    const res = calculateMsu('SOZ', 0, 0, 20, 0, 0, 0, 0, 0);
    expect(parseFloat(res.primaryResult)).toBeCloseTo(180, 0);
  });

  it('D) Sadece Matematik maksimum', () => {
    // SAY: mat %50. 100 + (1 * 0.50 * 400) = 300
    const res = calculateMsu('SAY', 0, 0, 0, 0, 40, 0, 0, 0);
    expect(parseFloat(res.primaryResult)).toBeCloseTo(300, 0);
  });

  it('E) Sadece Fen maksimum', () => {
    // EA: fen %15. 100 + (1 * 0.15 * 400) = 160
    const res = calculateMsu('EA', 0, 0, 0, 0, 0, 0, 20, 0);
    expect(parseFloat(res.primaryResult)).toBeCloseTo(160, 0);
  });

  it('F) Toplam soru asimi firlatir (Turkce 41)', () => {
    expect(() => calculateMsu('SAY', 41, 0, 0, 0, 0, 0, 0, 0)).toThrow();
  });
  
  it('F) Toplam soru asimi firlatir (Sosyal 21)', () => {
    expect(() => calculateMsu('SAY', 0, 0, 21, 0, 0, 0, 0, 0)).toThrow();
  });

  it('G) Negatif deger firlatir', () => {
    expect(() => calculateMsu('SAY', -1, 0, 0, 0, 0, 0, 0, 0)).toThrow();
  });

  it('H) Ondalikli deger firlatir', () => {
    expect(() => calculateMsu('SAY', 10.5, 0, 0, 0, 0, 0, 0, 0)).toThrow();
  });

  it('I) Karisik gercekci senaryo (GENEL)', () => {
    // Turkce 30D 4Y (net 29) -> norm 29/40 = 0.725
    // Sosyal 15D 4Y (net 14) -> norm 14/20 = 0.70
    // Mat 20D 4Y (net 19) -> norm 19/40 = 0.475
    // Fen 10D 4Y (net 9) -> norm 9/20 = 0.45
    // GENEL w: T:0.33, S:0.17, M:0.33, F:0.17
    // weighted = (0.725*0.33) + (0.70*0.17) + (0.475*0.33) + (0.45*0.17) = 0.23925 + 0.119 + 0.15675 + 0.0765 = 0.5915
    // approx = 100 + 0.5915*400 = 336.6
    const res = calculateMsu('GENEL', 30, 4, 15, 4, 20, 4, 10, 4);
    expect(parseFloat(res.primaryResult)).toBeCloseTo(336.6, 1);
  });
});
