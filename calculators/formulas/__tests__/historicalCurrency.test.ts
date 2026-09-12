import { calculateHistoricalCurrency } from '../historicalCurrency';
import { describe, it, expect } from 'vitest';

describe('Historical Currency Calculator', () => {
  it('should calculate historical USD to TRY correctly', () => {
    // 2024-01-01 rate = 29.5
    const res = calculateHistoricalCurrency(100, 'USD', 'TRY', '2024-01-01');
    expect(res.primaryResult.includes('2.950')).toBe(true);
  });
});