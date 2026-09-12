import { generateAmortizationSchedule } from './loan/amortization';

export function calculateCommercialVehicleLoan(loanAmount: number, monthlyInterestRate: number, termMonths: number) {
  const result = generateAmortizationSchedule({
    principal: loanAmount,
    monthlyInterestRate: monthlyInterestRate,
    termMonths: termMonths
  });
  
  const formattedTable = result.schedule.map(row => ({
    'Taksit No': row.installmentNumber,
    'Taksit Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.payment),
    'Anapara': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.principalPaid),
    'Faiz': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.interestPaid),
    'Kalan Bakiye': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.remainingPrincipal)
  }));
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.monthlyPayment),
    secondaryResults: {
      'Kredi Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(loanAmount),
      'Toplam Faiz': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalInterest),
      'Toplam Ödeme': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalPayment),
      'Vade': termMonths + ' Ay'
    },
    table: formattedTable,
    notes: ['Bu hesaplama matematiksel bir kredi simülasyonudur. Bankaların sunduğu güncel yasal komisyonlar ve araç yaşı gibi limitler bankanıza göre farklılık gösterebilir.']
  };
}