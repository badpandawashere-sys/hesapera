import { generateAmortizationSchedule } from '../amortization';
import { describe, it, expect } from 'vitest';

describe('Loan Amortization', () => {
  it('should calculate loan correctly', () => {
    const result = generateAmortizationSchedule({
      principal: 100000,
      monthlyInterestRate: 2,
      termMonths: 12
    });
    
    expect(result.monthlyPayment).toBeCloseTo(9455.96, 1);
    expect(result.schedule.length).toBe(12);
    expect(result.schedule[11].remainingPrincipal).toBe(0);
    // Total principal paid across all schedule should equal original principal
    const totalPrincipal = result.schedule.reduce((acc, row) => acc + row.principalPaid, 0);
    expect(totalPrincipal).toBeCloseTo(100000, 2);
  });
  
  it('should handle zero interest', () => {
    const result = generateAmortizationSchedule({
      principal: 12000,
      monthlyInterestRate: 0,
      termMonths: 12
    });
    
    expect(result.monthlyPayment).toBeCloseTo(1000, 2);
    expect(result.schedule[11].remainingPrincipal).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPayment).toBe(12000);
  });
});