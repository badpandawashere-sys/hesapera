import { calculateTus } from '../tus';
import { describe, it, expect } from 'vitest';

describe('TUS Calculator', () => {
  it('should calculate T-puan roughly for tip mezunu', () => {
    // 80 TTBT Net (4 wrong -> 80C 0W = 80 net. Wait, say 80C 0W for simplicity)
    // 80 KTBT Net
    // approxKlinik = 25 + (80 * 0.24) + (80 * 0.26) = 25 + 19.2 + 20.8 = 65
    const res = calculateTus(80, 0, 80, 0, 'tip');
    expect(parseFloat(res.primaryResult)).toBeCloseTo(65, 0);
    expect(res.secondaryResults['Temel Tip Neti']).toBe('80.00');
    expect(res.secondaryResults['Klinik Tip Neti']).toBe('80.00');
  });

  it('should calculate K-puan roughly for tip_disi mezunu', () => {
    // 70 TTBT, 0 KTBT
    // approxTemel = 25 + (70 * 0.35) + (0 * 0.15) = 25 + 24.5 = 49.5
    const res = calculateTus(70, 0, 0, 0, 'tip_disi');
    expect(parseFloat(res.primaryResult)).toBeCloseTo(49.5, 1);
    expect(res.secondaryResults['Yaklasik K-Puani (Klinik)']).toBe('Hesaplanmaz');
  });

  it('should calculate minimum correctly', () => {
    // 0 net everywhere
    const res = calculateTus(0, 0, 0, 0, 'tip');
    expect(parseFloat(res.primaryResult)).toBe(25);
  });

  it('should floor negative nets to roughly minimum if possible', () => {
    // Say 120W, net = -30
    // approx = 25 - 30*0.24 - 30*0.26 = 25 - 15 = 10
    const res = calculateTus(0, 100, 0, 100, 'tip');
    expect(parseFloat(res.primaryResult)).toBeGreaterThanOrEqual(0);
  });

  it('should throw on limits', () => {
    expect(() => calculateTus(121, 0, 0, 0, 'tip')).toThrow();
    expect(() => calculateTus(100, 21, 0, 0, 'tip')).toThrow();
    expect(() => calculateTus(-1, 0, 0, 0, 'tip')).toThrow();
  });
});
