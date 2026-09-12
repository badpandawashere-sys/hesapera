import { describe, it, expect } from 'vitest';
import { calculateLoanAnnualCostRate } from '../loanAnnualCostRate';

describe('calculateLoanAnnualCostRate', () => {
  it('1. should calculate cost for simple consumer loan (ihtiyac) correctly', () => {
    const result = calculateLoanAnnualCostRate({
      loanType: 'ihtiyac',
      principal: 100000,
      monthlyInterestRate: 3.5,
      termMonths: 12,
      allocationFee: 500, // 0.5% default conceptually but user entered
      insuranceFee: 0,
      appraisalFee: 0,
      mortgageFee: 0,
      otherFees: 0
    });

    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.secondaryResults['Net Kullanılan Kredi']).toContain('99.500');
    // @ts-ignore
    expect(result.primaryResult).toBeDefined();
    // basic check to ensure APR is higher than nominal due to taxes and fees
    // @ts-ignore
    const aprStr = result.primaryResult.replace('%', '').trim();
    const apr = parseFloat(aprStr);
    expect(apr).toBeGreaterThan(42);
  });

  it('2. should calculate cost for mortgage loan (konut) correctly (no BSMV/KKDF)', () => {
    const result = calculateLoanAnnualCostRate({
      loanType: 'konut',
      principal: 1000000,
      monthlyInterestRate: 3.0,
      termMonths: 120,
      allocationFee: 5000,
      insuranceFee: 0,
      appraisalFee: 10000,
      mortgageFee: 2000,
      otherFees: 0
    });

    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.secondaryResults['Net Kullanılan Kredi']).toContain('983.000');
    // @ts-ignore
    expect(result.secondaryResults['Toplam Vergi (BSMV+KKDF)']).toContain('0');
  });

  it('3. should return error if net received is zero or negative', () => {
    const result = calculateLoanAnnualCostRate({
      loanType: 'tasit',
      principal: 10000,
      monthlyInterestRate: 2.0,
      termMonths: 12,
      allocationFee: 10000,
      insuranceFee: 0,
      appraisalFee: 0,
      mortgageFee: 0,
      otherFees: 0
    });

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors![0]).toContain('0 dan b');
  });
});
