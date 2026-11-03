import { generateAmortizationSchedule } from './loan/amortization';

export function calculateConsumerLoan(loanAmount: number, monthlyInterestRate: number, termMonths: number) {
  const result = generateAmortizationSchedule({
    principal: loanAmount,
    monthlyInterestRate: monthlyInterestRate,
    termMonths: termMonths,
    kkdfRate: 15,
    bsmvRate: 15
  });
  
  const totalTax = (result.totalKKDF || 0) + (result.totalBSMV || 0);

  const formattedTable = result.schedule.map(row => ({
    'Taksit No': row.installmentNumber,
    'Taksit Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.payment),
    'Anapara': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.principalPaid),
    'Faiz': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.interestPaid),
    'KKDF': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.kkdfPaid || 0),
    'BSMV': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.bsmvPaid || 0),
    'Kalan Bakiye': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.remainingPrincipal)
  }));
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.monthlyPayment),
    primaryLabel: 'Aylık Taksit Tutarı',
    secondaryResults: {
      'Kredi Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(loanAmount),
      'Toplam Faiz': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalInterest),
      'KKDF (%15)': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalKKDF || 0),
      'BSMV (%15)': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalBSMV || 0),
      'Toplam Vergi': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalTax),
      'Toplam Ödeme': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalPayment),
      'Vade': termMonths + ' Ay'
    },
    table: formattedTable,
    infoReference: {
      title: 'Yasal Vergiler Dahil Tüketici Kredisi Hesabı',
      description: 'Hesaplama, Türkiye Cumhuriyeti mevzuatına uygun olarak bireysel tüketici kredilerine uygulanan %15 KKDF ve %15 BSMV yasal kesintileri dahil edilerek eşit taksitli (anüite) formülüyle yapılmıştır. Kredi tahsis (dosya) masrafı ve sigorta bedelleri bankalara ve müşteri profiline göre farklılık gösterdiğinden bu ödeme planına dahil edilmemiştir.'
    }
  };
}