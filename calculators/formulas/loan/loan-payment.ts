import { LoanParams } from './loan-types';

export function calculateMonthlyPayment(params: LoanParams): number {
  const p = params.principal;
  const n = params.termMonths;
  
  const kkdf = (params.kkdfRate || 0) / 100;
  const bsmv = (params.bsmvRate || 0) / 100;
  
  // The effective monthly rate includes taxes
  let r = (params.monthlyInterestRate / 100) * (1 + kkdf + bsmv);

  if (r === 0) {
    return p / n;
  }

  // Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const factor = Math.pow(1 + r, n);
  const payment = (p * r * factor) / (factor - 1);
  return payment;
}
