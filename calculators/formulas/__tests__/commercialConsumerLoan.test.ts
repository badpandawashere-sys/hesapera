import { calculateCommercialConsumerLoan } from '../commercialConsumerLoan';
import { describe, it, expect } from 'vitest';

describe('commercialConsumerLoan Calculator', () => {
  it('should calculate loan schedule correctly', () => {
    const res = calculateCommercialConsumerLoan(100000, 2, 12);
    expect(res.table).toBeDefined();
    expect(res.table?.length).toBe(12);
  });
  it('should handle zero interest correctly', () => {
    const res = calculateCommercialConsumerLoan(120000, 0, 12);
    expect(res.primaryResult.includes('10.000')).toBe(true);
  });
});