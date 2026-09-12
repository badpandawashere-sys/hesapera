import { calculateLoanFee } from '../loanFee';
import { describe, it, expect } from 'vitest';

describe('Loan Fee Calculator', () => {
  it('should calculate fee correctly', () => {
    const res = calculateLoanFee(100000, 1);
    expect(res.primaryResult.includes('1.000')).toBe(true);
  });
});