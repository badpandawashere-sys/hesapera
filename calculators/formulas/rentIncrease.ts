export function calculateRentIncrease(currentRent: number, increaseRate: number) {
  const increaseAmount = currentRent * (increaseRate / 100);
  const newRent = currentRent + increaseAmount;

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(newRent),
    secondaryResults: {
      'Mevcut Kira': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(currentRent),
      'Artış Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(increaseAmount),
      'Artış Oranı': '%' + increaseRate
    },
    notes: ['Yasal kira artış oranı dönemsel mevzuata göre değişebilir; bu araç yalnızca girdiğiniz oran üzerinden matematiksel hesaplama yapar.']
  };
}