export function calculateLoanLateFee(overdueAmount: number, monthlyDelayRate: number, delayMonths: number) {
  const interest = overdueAmount * (monthlyDelayRate / 100) * delayMonths;
  const total = overdueAmount + interest;
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(interest),
    secondaryResults: {
      'Geciken Tutar': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(overdueAmount),
      'Gecikme Faizi': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(interest),
      'Toplam Tutar': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total),
      'Gecikme Süresi': delayMonths + ' Ay'
    }
  };
}