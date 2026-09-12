import { calculateAverageMaturity } from '../averageMaturity';
import { describe, it, expect } from 'vitest';

describe('Average Maturity Calculator', () => {
  it('should calculate weighted average correctly', () => {
    // 10000x30, 20000x60, 30000x90 = 300000 + 1200000 + 2700000 = 4200000. 
    // Total amount = 60000. 4200000 / 60000 = 70 days.
    // Prompt said 60 days but wait, 300+1200+2700=4200k. 4200/60 = 70.
    // The prompt was slightly off (said 60). We expect 70.
    const items = [
      { amount: 10000, days: 30 },
      { amount: 20000, days: 60 },
      { amount: 30000, days: 90 }
    ];
    const res = calculateAverageMaturity(items);
    expect(res.primaryResult.includes('70 Gün')).toBe(true);
  });
});