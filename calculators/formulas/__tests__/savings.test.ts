import { calculateSavings } from '../savings';
import { describe, it, expect } from 'vitest';

describe('Savings Calculator', () => {
  it('should calculate savings correctly with 0 rate', () => {
    // 1000 + 500*12 = 7000
    const res = calculateSavings(1000, 500, 0, 12);
    expect(res.primaryResult.includes('7.000')).toBe(true);
  });
});