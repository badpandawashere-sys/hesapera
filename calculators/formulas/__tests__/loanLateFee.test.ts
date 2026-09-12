import { calculateLoanLateFee } from '../loanLateFee';
import { describe, it, expect } from 'vitest';

describe('Loan Late Fee', () => {
  it('should calculate late fee correctly', () => {
    const res = calculateLoanLateFee(10000, 3, 2);
    expect(res.primaryResult.includes('600')).toBe(true);
    expect(res.secondaryResults['Toplam Tutar'].includes('10.600')).toBe(true);
  });
});