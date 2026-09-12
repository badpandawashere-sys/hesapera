export function calculateBond(nominalValue: number, purchasePrice: number, daysToMaturity: number) {
  if (purchasePrice >= nominalValue) {
    throw new Error('Alış fiyatı nominal değerden küçük olmalıdır (iskontolu ihraç).');
  }

  const returnAmount = nominalValue - purchasePrice;
  const returnRate = returnAmount / purchasePrice;
  
  const simpleAnnualYield = returnRate * (365 / daysToMaturity) * 100;
  const compoundAnnualYield = (Math.pow(1 + returnRate, 365 / daysToMaturity) - 1) * 100;

  return {
    primaryResult: '%' + simpleAnnualYield.toFixed(4),
    secondaryResults: {
      'Bileşik Yıllık Getiri': '%' + compoundAnnualYield.toFixed(4),
      'Dönem Getirisi Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(returnAmount),
      'Vadeye Kalan Gün': daysToMaturity,
      'Alış Fiyatı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(purchasePrice)
    },
    notes: ['Hazine bonosu hesaplamalarında piyasa standardı olan 365 gün esası alınmıştır.']
  };
}