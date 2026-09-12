import { generateAmortizationSchedule } from './loan/amortization';

export function calculateLoan(loanAmount: number, monthlyInterestRate: number, termMonths: number) {
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
    primaryLabel: 'Aylık Taksit Tutarı',
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.monthlyPayment),
    secondaryResults: {
      'Toplam Faiz': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalInterest),
      'Toplam Ödeme': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalPayment)
    },
    breakdown: [
      { label: 'Kredi Tutarı', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(loanAmount) },
      { label: 'Vade', value: `${termMonths} Ay` },
      { label: 'Aylık Faiz Oranı', value: `%${monthlyInterestRate.toFixed(2)}` },
      { label: 'Toplam Faiz Tutarı', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalInterest) },
      { label: 'Toplam Geri Ödeme', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalPayment) }
    ],
    table: formattedTable,
    infoReference: {
      title: "Kredi Hesaplaması Nasıl Yapılır?",
      description: "İhtiyaç, taşıt veya diğer kredilerin ödeme planı genellikle anüiteler (eşit taksitli ödeme) yöntemi ile hesaplanır. Her taksitte ödenen faiz tutarı, kalan anapara üzerinden hesaplandığı için aylar ilerledikçe azalır, anapara ödemesi ise artar. Belirtilen sonuçlar gösterge niteliğindedir ve bankaların uyguladığı ek ücretler (KKDF, BSMV, tahsis ücreti vb.) dahil edilmemiş olabilir."
    }
  };
}