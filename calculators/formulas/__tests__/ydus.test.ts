import { calculateYdus } from '../ydus';
import { describe, it, expect } from 'vitest';

describe('YDUS Calculator', () => {
  it('should calculate max score (80 correct = 100 points)', () => {
    const res = calculateYdus(80, 0);
    expect(res.primaryResult).toBe('100.000');
  });

  it('should apply penalty correctly (4 wrong = 1 correct)', () => {
    // 60C, 20W -> 60 - 5 = 55 net
    // 55 * 1.25 = 68.75
    const res = calculateYdus(60, 20);
    expect(parseFloat(res.primaryResult)).toBeCloseTo(68.75, 2);
    expect(res.secondaryResults['Net Sayısı']).toBe('55.00');
  });

  it('should limit negative scores to 0', () => {
    const res = calculateYdus(0, 80);
    expect(res.primaryResult).toBe('0.000');
  });

  it('should throw on limits', () => {
    expect(() => calculateYdus(81, 0)).toThrow();
    expect(() => calculateYdus(40, 41)).toThrow();
    expect(() => calculateYdus(-1, 0)).toThrow();
    expect(() => calculateYdus(0, -1)).toThrow();
  });
});
