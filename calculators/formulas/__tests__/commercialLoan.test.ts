import { calculateCommercialLoan } from '../commercialLoan';
import { describe, it, expect } from 'vitest';

describe('commercialLoan Calculator', () => {
  it('should calculate loan schedule correctly', () => {
    const res = calculateCommercialLoan(100000, 2, 12);
    expect(res.table).toBeDefined();
    expect(res.table?.length).toBe(12);
  });
  it('should handle zero interest correctly', () => {
    const res = calculateCommercialLoan(120000, 0, 12);
    expect(res.primaryResult.includes('10.000')).toBe(true);
  });
});