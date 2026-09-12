import { generateAmortizationSchedule } from './loan/amortization';

export function calculateMortgageLoan(loanAmount: number, monthlyInterestRate: number, termMonths: number) {
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
    primaryLabel: 'Aylık Taksit Tutarı',
    secondaryResults: {
      'Kredi Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(loanAmount),
      'Toplam Faiz': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalInterest),
      'Toplam Ödeme': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalPayment),
      'Vade': termMonths + ' Ay'
    },
    table: formattedTable,
    infoReference: {
      title: 'Önemli Bilgilendirme',
      description: 'Bu hesaplama anapara ve faiz üzerinden temel konut kredisi taksit hesabıdır. Ekspertiz, ipotek tesisi, tahsis ücreti, DASK, hayat sigortası ve banka teklifine bağlı diğer ek maliyetler hesaplamaya dahil değildir. Kesin toplam maliyet için bankanızın teklifini kontrol ediniz.'
    }
  };
}