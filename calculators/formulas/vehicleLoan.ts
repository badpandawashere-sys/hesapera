import { generateAmortizationSchedule } from './loan/amortization';

export function calculateVehicleLoan(loanAmount: number, monthlyInterestRate: number, termMonths: number) {
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
    primaryLabel: 'Aylık Taksit Tutarı',
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.monthlyPayment),
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
      title: 'Bireysel Taşıt Kredisi Simülasyonu',
      description: 'Hesaplama, gerçek kişi bireysel taşıt kredilerinde uygulanan %15 KKDF ve %15 BSMV yasal kesintileri dahil edilerek eşit taksitli (anüite) modeliyle hazırlanmış bir matematiksel ödeme simülasyonudur. Bu simülasyon bankanın nihai kredi onayını veya BDDK sınırlarına uygunluk garantisini teşkil etmez. Kredi tahsis ücreti, kasko poliçesi, rehin ücreti ve hayat sigortası bankalara göre değişebileceğinden bu plana dahil edilmemiştir. Ticari taşıt kredilerinde ise KKDF uygulanmamakta (%0) ve BSMV %5 olarak tahakkuk etmektedir (ticari krediler için Ticari Taşıt Kredisi hesaplayıcımızı inceleyebilirsiniz).'
    }
  };
}