import { calculateCreditCardLateFee } from '../creditCardLateFee';
import { describe, it, expect } from 'vitest';

describe('Credit Card Late Fee Calculator', () => {
  it('should calculate late fee correctly', () => {
    const res = calculateCreditCardLateFee(10000, 3, 2);
    expect(res.primaryResult.includes('600')).toBe(true);
    expect(res.secondaryResults['Toplam Tutar'].includes('10.600')).toBe(true);
  });
});