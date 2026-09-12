export function calculateLoss(cost: number, sellingPrice: number) {
  const loss = cost - sellingPrice;
  
  const notes = [];
  if (loss < 0) {
    notes.push('Sonuç negatif, satış fiyatı maliyetten yüksek (Aslında kâr durumu).');
  }

  const lossPercentage = (loss / cost) * 100;
  
  return {
    primaryResult: loss,
    secondaryResults: {
      'Maliyet': cost,
      'Satış Fiyatı': sellingPrice,
      'Zarar Oranı': '%' + lossPercentage.toFixed(2)
    },
    notes: notes.length > 0 ? notes : undefined
  };
}