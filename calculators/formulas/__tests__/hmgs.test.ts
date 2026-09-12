import { calculateHmgs } from '../hmgs';
import { describe, it, expect } from 'vitest';

describe('HMGS Calculator — Hukuk Mesleklerine Giriş Sınavı', () => {
  it('should calculate max score for all correct (40+40)', () => {
    const res = calculateHmgs(40, 0, 40, 0);
    expect(res.primaryResult).toBe('100.000');
    expect(res.secondaryResults['Toplam Net']).toBe('80.00');
  });

  it('should give base 50 for all blank (zero net)', () => {
    const res = calculateHmgs(0, 0, 0, 0);
    expect(res.primaryResult).toBe('50.000');
  });

  it('should throw for exceeding Medeni-Borclar limit', () => {
    expect(() => calculateHmgs(41, 0, 0, 0)).toThrow();
  });

  it('should throw for exceeding Ticaret-Usul limit', () => {
    expect(() => calculateHmgs(0, 0, 41, 0)).toThrow();
  });

  it('should correctly apply 0.25 wrong penalty', () => {
    // 20 dogru, 4 yanlis -> net = 20 - 1 = 19
    const res = calculateHmgs(20, 4, 0, 0);
    expect(res.secondaryResults['Medeni Hukuk ve Borçlar Net']).toBe('19.00');
  });
});