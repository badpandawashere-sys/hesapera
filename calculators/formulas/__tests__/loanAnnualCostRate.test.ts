import { calculateLoanAnnualCostRate } from '../loanAnnualCostRate';
import { describe, it, expect } from 'vitest';

describe('Loan Annual Cost Rate', () => {
  it('should calculate annual effective rate correctly', () => {
    // Received 100000, payment 9455.96 for 12 months, 0 upfront
    const res = calculateLoanAnnualCostRate(100000, 9455.96, 12, 0) as any;
    expect(res.primaryResult.includes('26')).toBe(true); // approx 26.82% annual effective
  });
  it('should fail gracefully if upfront fees >= principal', () => {
    const res = calculateLoanAnnualCostRate(1000, 100, 12, 1000) as any;
    expect(res.success).toBe(false);
  });
});