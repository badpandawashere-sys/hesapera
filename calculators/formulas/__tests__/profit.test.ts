import { calculateProfit } from '../profit';
import { describe, it, expect } from 'vitest';

describe('Profit Formula', () => {
  it('should calculate profit correctly', () => {
    const result = calculateProfit(100, 120);
    expect(result.primaryResult).toBe(20);
  });
});