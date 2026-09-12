import { calculateRealReturn } from '../realReturn';
import { describe, it, expect } from 'vitest';

describe('Real Return Calculator', () => {
  it('should calculate real return correctly', () => {
    // nominal 20, inflation 10 => 9.0909%
    const res = calculateRealReturn(20, 10);
    expect(res.primaryResult.includes('9.0909')).toBe(true);
  });

  it('should return 0 when nominal equals inflation', () => {
    const res = calculateRealReturn(15, 15);
    expect(res.primaryResult.includes('0.0000')).toBe(true);
  });
});