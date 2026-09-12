import { generateAmortizationSchedule } from './loan/amortization';

export function calculateLoanRestructuring(remainingPrincipal: number, newMonthlyInterestRate: number, newTermMonths: number) {
  const result = generateAmortizationSchedule({
    principal: remainingPrincipal,
    monthlyInterestRate: newMonthlyInterestRate,
    termMonths: newTermMonths
  });
  
  const formattedTable = result.schedule.map(row => ({
    'Taksit No': row.installmentNumber,
    'Taksit Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.payment),
    'Anapara': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.principalPaid),
    'Faiz': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.interestPaid),
    'Kalan Bakiye': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.remainingPrincipal)
  }));
  
  return {
    primaryLabel: 'Yeni Aylık Taksit',
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.monthlyPayment),
    secondaryResults: {
      'Yapılandırılan Borç': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(remainingPrincipal),
      'Toplam Ödeme': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalPayment),
      'Toplam Faiz': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalInterest)
    },
    breakdown: [
      { label: 'Yapılandırılan Borç', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(remainingPrincipal) },
      { label: 'Yeni Vade', value: `${newTermMonths} Ay` },
      { label: 'Yeni Aylık Faiz Oranı', value: `%${newMonthlyInterestRate.toFixed(2)}` },
      { label: 'Yeni Toplam Faiz', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalInterest) },
      { label: 'Yeni Toplam Ödeme', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalPayment) }
    ],
    table: formattedTable,
    infoReference: {
      title: "Kredi Yapılandırma Hesaplaması Nasıl Yapılır?",
      description: "Mevcut bakiye, yeni faiz oranı ve yeni vade dikkate alınarak standart eşit taksitli annüite yöntemi ile simülasyon yapılır. Bu hesaplama banka özelindeki yapılandırma ücretleri, sigorta, vergi, komisyon veya erken kapama bedeli gibi ilave masrafları kapsamaz. Yalnızca tahmini matematiksel bir simülasyondur."
    }
  };
}
