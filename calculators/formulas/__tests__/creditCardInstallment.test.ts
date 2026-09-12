import { calculateCreditCardInstallment } from '../creditCardInstallment';
import { describe, it, expect } from 'vitest';

describe('Credit Card Installment Calculator', () => {
  it('should calculate installment correctly', () => {
    const res = calculateCreditCardInstallment(10000, 12, 2);
    expect(res.table).toBeDefined();
    expect(res.table?.length).toBe(12);
  });
  it('should handle zero interest correctly', () => {
    const res = calculateCreditCardInstallment(12000, 12, 0);
    expect(res.primaryResult.includes('1.000')).toBe(true);
  });
});