export function calculateCreditCardLateFee(overdueAmount: number, monthlyDelayRate: number, delayMonths: number) {
  const interest = overdueAmount * (monthlyDelayRate / 100) * delayMonths;
  const total = overdueAmount + interest;
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(interest),
    secondaryResults: {
      'Geciken Tutar': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(overdueAmount),
      'Kullanılan Oran': '%' + monthlyDelayRate,
      'Gecikme Süresi': delayMonths + ' Ay',
      'Gecikme Faizi': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(interest),
      'Toplam Tutar': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total)
    },
    notes: ['Dikkat: Girdiğiniz faiz oranı üzerinden hesaplama yapılmıştır. Yasal oranlar değişiklik gösterebilir.']
  };
}