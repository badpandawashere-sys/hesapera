import { calculatePybs } from '../pybs';
import { describe, it, expect } from 'vitest';

describe('PYBS Calculator', () => {
  it('should calculate max score (500)', () => {
    const res = calculatePybs(25, 0, 25, 0, 25, 0, 25, 0);
    expect(parseFloat(res.primaryResult)).toBe(500);
    expect(res.secondaryResults['Toplam Net']).toContain('100');
  });

  it('should calculate min score (100) for all wrong', () => {
    const res = calculatePybs(0, 25, 0, 25, 0, 25, 0, 25);
    // Net will be negative, score floored to 100
    expect(parseFloat(res.primaryResult)).toBe(100);
  });

  it('should calculate base score (100) for all blank', () => {
    const res = calculatePybs(0, 0, 0, 0, 0, 0, 0, 0);
    expect(parseFloat(res.primaryResult)).toBe(100);
  });

  it('should correctly apply 1/3 penalty', () => {
    // 15C 3W -> 15 - 1 = 14 net
    const res = calculatePybs(15, 3, 0, 0, 0, 0, 0, 0);
    expect(res.secondaryResults['Turkce / TDE Net']).toContain('14.00');
    // 14 net total -> 100 + 14 * 4 = 156
    expect(parseFloat(res.primaryResult)).toBe(156);
  });

  it('should throw on limits', () => {
    expect(() => calculatePybs(26, 0, 0, 0, 0, 0, 0, 0)).toThrow();
    expect(() => calculatePybs(15, 15, 0, 0, 0, 0, 0, 0)).toThrow(); // >25
    expect(() => calculatePybs(-1, 0, 0, 0, 0, 0, 0, 0)).toThrow();
  });
});
