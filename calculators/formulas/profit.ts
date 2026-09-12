export function calculateProfit(cost: number, sellingPrice: number) {
  const profit = sellingPrice - cost;
  
  const notes = [];
  if (profit < 0) {
    notes.push('Sonuç negatif, satış fiyatı maliyetten düşük (Zarar durumu).');
  }

  let profitMargin = 0;
  if (sellingPrice > 0) {
    profitMargin = (profit / sellingPrice) * 100;
  }
  
  return {
    primaryResult: profit,
    secondaryResults: {
      'Maliyet': cost,
      'Satış Fiyatı': sellingPrice,
      'Kâr Oranı': '%' + profitMargin.toFixed(2)
    },
    notes: notes.length > 0 ? notes : undefined
  };
}