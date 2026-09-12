import { LoanParams } from './loan-types';

export function calculateMonthlyPayment(params: LoanParams): number {
  const p = params.principal;
  const n = params.termMonths;
  let r = params.monthlyInterestRate / 100;

  if (r === 0) {
    return p / n;
  }

  // Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const factor = Math.pow(1 + r, n);
  const payment = (p * r * factor) / (factor - 1);
  return payment;
}