import { calculateBond } from '../bond';
import { describe, it, expect } from 'vitest';

describe('Bono Calculator', () => {
  it('should calculate simple and compound yields', () => {
    // Buy 90, Nominal 100, 182 days
    const res = calculateBond(100, 90, 182);
    // Return = 10. Rate = 10/90 = 11.11%
    // Simple = 11.11 * (365/182) = 22.28...
    expect(res.primaryResult.includes('22')).toBe(true);
  });
});