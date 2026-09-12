import { generateAmortizationSchedule } from './loan/amortization';

export function calculateCreditCardInstallment(transactionAmount: number, installmentCount: number, monthlyInterestRate: number) {
  // Using the robust Loan Calculation Core underlying engine.
  const result = generateAmortizationSchedule({
    principal: transactionAmount,
    monthlyInterestRate: monthlyInterestRate,
    termMonths: installmentCount
  });
  
  const formattedTable = result.schedule.map(row => ({
    'Taksit No': row.installmentNumber,
    'Taksit Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.payment),
    'Anapara Payı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.principalPaid),
    'Faiz Payı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.interestPaid),
    'Kalan Borç': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.remainingPrincipal)
  }));
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.monthlyPayment),
    secondaryResults: {
      'İşlem Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(transactionAmount),
      'Taksit Sayısı': installmentCount,
      'Toplam Faiz': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalInterest),
      'Toplam Ödeme': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalPayment)
    },
    table: formattedTable,
    notes: ['Girilen faiz oranına göre hesaplanmıştır. Vergiler ve ek fonlar bankanız tarafından haricen eklenebilir.']
  };
}