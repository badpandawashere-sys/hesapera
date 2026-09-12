export function calculateMonetaryValue(amount: number, rate: number, periods: number) {
  const finalValue = amount * Math.pow(1 + (rate / 100), periods);
  const changeAmount = finalValue - amount;

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(finalValue),
    secondaryResults: {
      'Başlangıç Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount),
      'Toplam Değişim Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(changeAmount),
      'Dönem Sayısı': periods,
      'Dönemsel Oran': '%' + rate
    },
    notes: ['Formül: Başlangıç Tutarı × (1 + Oran)^Dönem Sayısı']
  };
}