import { calculateCreditCardAdditionalInstallment } from '../creditCardAdditionalInstallment';
import { describe, it, expect } from 'vitest';

describe('Credit Card Additional Installment Calculator', () => {
  it('should calculate new installment correctly', () => {
    const res = calculateCreditCardAdditionalInstallment(1200, 4, 2);
    // 1200 / 6 = 200
    expect(res.primaryResult.includes('200')).toBe(true);
  });
});