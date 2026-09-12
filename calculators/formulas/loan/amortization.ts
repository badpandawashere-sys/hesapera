import { LoanParams, AmortizationRow, LoanResult } from './loan-types';
import { calculateMonthlyPayment } from './loan-payment';

export function generateAmortizationSchedule(params: LoanParams): LoanResult {
  const p = params.principal;
  const n = params.termMonths;
  const rawR = params.monthlyInterestRate / 100;
  
  const kkdfRate = (params.kkdfRate || 0) / 100;
  const bsmvRate = (params.bsmvRate || 0) / 100;
  
  const rawPayment = calculateMonthlyPayment(params);
  const payment = Math.round(rawPayment * 100) / 100; // Round to 2 decimal places

  const schedule: AmortizationRow[] = [];
  let remaining = p;
  let totalInterest = 0;
  let totalKKDF = 0;
  let totalBSMV = 0;
  let totalPayment = 0;

  for (let i = 1; i <= n; i++) {
    const rawInterest = remaining * rawR;
    const roundedInterest = Math.round(rawInterest * 100) / 100;
    
    const kkdf = Math.round(roundedInterest * kkdfRate * 100) / 100;
    const bsmv = Math.round(roundedInterest * bsmvRate * 100) / 100;
    const totalTax = kkdf + bsmv;
    
    let principalPaid = payment - roundedInterest - totalTax;
    
    // Adjust last month
    if (i === n) {
      principalPaid = remaining;
    }

    let currentPayment = principalPaid + roundedInterest + totalTax;
    remaining = remaining - principalPaid;
    
    if (Math.abs(remaining) < 0.01) remaining = 0;

    totalInterest += roundedInterest;
    totalKKDF += kkdf;
    totalBSMV += bsmv;
    totalPayment += currentPayment;

    schedule.push({
      installmentNumber: i,
      payment: currentPayment,
      principalPaid: principalPaid,
      interestPaid: roundedInterest,
      kkdfPaid: kkdf,
      bsmvPaid: bsmv,
      remainingPrincipal: remaining
    });
  }

  return {
    schedule,
    totalInterest,
    totalKKDF,
    totalBSMV,
    totalPayment,
    monthlyPayment: payment
  };
}
