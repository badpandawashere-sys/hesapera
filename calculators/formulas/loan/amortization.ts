import { LoanParams, AmortizationRow } from './loan-types';
import { calculateMonthlyPayment } from './loan-payment';

export function generateAmortizationSchedule(params: LoanParams): { schedule: AmortizationRow[], totalInterest: number, totalPayment: number, monthlyPayment: number } {
  const p = params.principal;
  const n = params.termMonths;
  const r = params.monthlyInterestRate / 100;
  
  const rawPayment = calculateMonthlyPayment(params);
  const payment = Math.round(rawPayment * 100) / 100; // Round to 2 decimal places for consistent scheduling

  const schedule: AmortizationRow[] = [];
  let remaining = p;
  let totalInterest = 0;
  let totalPayment = 0;

  for (let i = 1; i <= n; i++) {
    const interestForMonth = remaining * r;
    const roundedInterest = Math.round(interestForMonth * 100) / 100;
    
    let principalPaid = payment - roundedInterest;
    
    // Adjust last month
    if (i === n) {
      principalPaid = remaining;
    }

    let currentPayment = principalPaid + roundedInterest;
    remaining = remaining - principalPaid;
    
    if (Math.abs(remaining) < 0.01) remaining = 0;

    totalInterest += roundedInterest;
    totalPayment += currentPayment;

    schedule.push({
      installmentNumber: i,
      payment: currentPayment,
      principalPaid: principalPaid,
      interestPaid: roundedInterest,
      remainingPrincipal: remaining
    });
  }

  return {
    schedule,
    totalInterest,
    totalPayment,
    monthlyPayment: payment
  };
}