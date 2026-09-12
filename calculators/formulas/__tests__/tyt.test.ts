import { calculateTyt } from '../tyt';
import { describe, it, expect } from 'vitest';

describe('TYT Calculator', () => {
  it('should calculate roughly max score', () => {
    // 40T, 20S, 40M, 20F -> 120 total.
    // 100 + 40*3.3 + 20*3.4 + 40*3.3 + 20*3.4 = 100 + 132 + 68 + 132 + 68 = 500
    const res = calculateTyt(40, 0, 20, 0, 40, 0, 20, 0);
    expect(parseFloat(res.primaryResult)).toBeCloseTo(500, 0);
  });

  it('should calculate min score (100) for all wrong', () => {
    const res = calculateTyt(0, 40, 0, 20, 0, 40, 0, 20);
    expect(parseFloat(res.primaryResult)).toBe(100);
  });

  it('should calculate realistic mixed score', () => {
    // Turkce: 30D 4Y -> 29 net
    // Sosyal: 15D 4Y -> 14 net
    // Mat: 20D 4Y -> 19 net
    // Fen: 10D 4Y -> 9 net
    // Approx = 100 + 29*3.3 + 14*3.4 + 19*3.3 + 9*3.4 = 100 + 95.7 + 47.6 + 62.7 + 30.6 = 336.6
    const res = calculateTyt(30, 4, 15, 4, 20, 4, 10, 4);
    expect(parseFloat(res.primaryResult)).toBeCloseTo(336.6, 1);
  });

  it('should throw on limits', () => {
    expect(() => calculateTyt(41, 0, 0, 0, 0, 0, 0, 0)).toThrow();
    expect(() => calculateTyt(0, 0, 21, 0, 0, 0, 0, 0)).toThrow();
    expect(() => calculateTyt(0, 0, 0, 0, 41, 0, 0, 0)).toThrow();
    expect(() => calculateTyt(0, 0, 0, 0, 0, 0, 21, 0)).toThrow();
  });
});
