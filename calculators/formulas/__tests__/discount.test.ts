import { calculateDiscount } from '../discount';
import { describe, it, expect } from 'vitest';

describe('Discount Calculator', () => {
  it('should calculate discount correctly', () => {
    const res = calculateDiscount(100, 20);
    expect(res.primaryResult.includes('80')).toBe(true);
  });
});