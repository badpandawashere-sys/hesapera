import { calculateEkpss } from '../ekpss';
import { describe, it, expect } from 'vitest';

describe('EKPSS Calculator', () => {
  it('should give max score for all correct', () => {
    const res = calculateEkpss('lisans', 40, 0, 40, 0);
    expect(res.primaryResult).toBe('100.000');
    expect(res.secondaryResults['Toplam Net']).toBe('80.00');
  });

  it('should give base 50 for zero net', () => {
    const res = calculateEkpss('onlisans', 0, 0, 0, 0);
    expect(res.primaryResult).toBe('50.000');
  });

  it('should throw for exceeding question limit', () => {
    expect(() => calculateEkpss('lisans', 41, 0, 0, 0)).toThrow();
  });

  it('should throw for negative wrong answers', () => {
    expect(() => calculateEkpss('lisans', 20, -1, 0, 0)).toThrow();
  });
});