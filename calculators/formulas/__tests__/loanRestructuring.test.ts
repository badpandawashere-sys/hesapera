import { calculateLoanRestructuring } from '../loanRestructuring';
import { loanRestructuringCalculatorDef } from '../../definitions/loanRestructuring';
import { describe, it, expect } from 'vitest';

describe('Loan Restructuring Calculator', () => {
  it('TEST 1: 100.000 TL, %3, 12 ay', () => {
    const res = calculateLoanRestructuring(100000, 3, 12);
    
    const monthlyStr = res.primaryResult.replace(/\./g, '').replace(',', '.');
    const monthlyVal = parseFloat(monthlyStr.replace(/[^0-9.]/g, ''));
    expect(monthlyVal).toBeCloseTo(10046.21, 1);
    
    const totalPaymentStr = res.secondaryResults['Toplam Ödeme'].replace(/\./g, '').replace(',', '.');
    const totalPaymentVal = parseFloat(totalPaymentStr.replace(/[^0-9.]/g, ''));
    expect(totalPaymentVal).toBeCloseTo(120554.52, 1);
    
    const totalInterestStr = res.secondaryResults['Toplam Faiz'].replace(/\./g, '').replace(',', '.');
    const totalInterestVal = parseFloat(totalInterestStr.replace(/[^0-9.]/g, ''));
    expect(totalInterestVal).toBeCloseTo(20554.52, 1);
  });

  it('TEST 2: 100.000 TL, %0, 12 ay', () => {
    const res = calculateLoanRestructuring(100000, 0, 12);
    
    const monthlyStr = res.primaryResult.replace(/\./g, '').replace(',', '.');
    const monthlyVal = parseFloat(monthlyStr.replace(/[^0-9.]/g, ''));
    expect(monthlyVal).toBeCloseTo(8333.33, 1);

    const totalPaymentStr = res.secondaryResults['Toplam Ödeme'].replace(/\./g, '').replace(',', '.');
    const totalPaymentVal = parseFloat(totalPaymentStr.replace(/[^0-9.]/g, ''));
    expect(totalPaymentVal).toBeCloseTo(100000, 1);

    const totalInterestStr = res.secondaryResults['Toplam Faiz'].replace(/\./g, '').replace(',', '.');
    const totalInterestVal = parseFloat(totalInterestStr.replace(/[^0-9.]/g, ''));
    expect(totalInterestVal).toBeCloseTo(0, 1);
  });

  it('TEST 3: 100.000 TL, %3, 1 ay', () => {
    const res = calculateLoanRestructuring(100000, 3, 1);
    
    const monthlyStr = res.primaryResult.replace(/\./g, '').replace(',', '.');
    const monthlyVal = parseFloat(monthlyStr.replace(/[^0-9.]/g, ''));
    expect(monthlyVal).toBeCloseTo(103000, 1);

    const totalInterestStr = res.secondaryResults['Toplam Faiz'].replace(/\./g, '').replace(',', '.');
    const totalInterestVal = parseFloat(totalInterestStr.replace(/[^0-9.]/g, ''));
    expect(totalInterestVal).toBeCloseTo(3000, 1);
  });

  it('TEST 4-7: Schema validation for invalid inputs', () => {
    const schema = loanRestructuringCalculatorDef.schema;
    
    // Invalid / NaN
    expect(schema.safeParse({ remainingPrincipal: NaN, newMonthlyInterestRate: 3, newTermMonths: 12 }).success).toBe(false);
    expect(schema.safeParse({ remainingPrincipal: 100000, newMonthlyInterestRate: Infinity, newTermMonths: 12 }).success).toBe(false);
    
    // Negatif bakiye
    expect(schema.safeParse({ remainingPrincipal: -1000, newMonthlyInterestRate: 3, newTermMonths: 12 }).success).toBe(false);
    
    // Negatif faiz
    expect(schema.safeParse({ remainingPrincipal: 100000, newMonthlyInterestRate: -1, newTermMonths: 12 }).success).toBe(false);
    
    // Vade 0
    expect(schema.safeParse({ remainingPrincipal: 100000, newMonthlyInterestRate: 3, newTermMonths: 0 }).success).toBe(false);
  });
});
