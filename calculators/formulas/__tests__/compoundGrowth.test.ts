import { calculateCompoundGrowth } from '../compoundGrowth';
import { describe, it, expect } from 'vitest';

describe('Compound Growth Calculator', () => {
  it('should calculate compound growth correctly', () => {
    // 1000, 10%, 2 periods -> 1210
    const res = calculateCompoundGrowth(1000, 10, 2);
    expect(res.primaryResult.includes('1.210')).toBe(true);
  });
});