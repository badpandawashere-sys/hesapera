import { generateAmortizationSchedule } from './loan/amortization';

export function calculateVehicleLoan(loanAmount: number, monthlyInterestRate: number, termMonths: number) {
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
      'Kredi Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(loanAmount),
      'Toplam Faiz': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalInterest),
      'Toplam Ödeme': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalPayment),
      'Vade': termMonths + ' Ay'
    },
    table: formattedTable,
    infoReference: {
      title: 'Taşıt Kredisi Nasıl Hesaplanır?',
      description: 'Hesaplama anüite yöntemiyle anapara + faiz üzerinden yapılır. KKDF, BSMV, tahsis ücreti, sigorta ve banka/kurumlara göre değişebilecek diğer ek maliyetler hesaplamaya dahil değildir. Araç bedeline göre uygulanabilecek kredi oranı, vade veya diğer yasal/kurumsal sınırlamalar bu matematiksel simülasyona otomatik olarak uygulanmamaktadır. Kullanıcı gerçek kredi başvurusu öncesinde banka/finans kuruluşunun güncel koşullarını kontrol etmelidir.'
    }
  };
}