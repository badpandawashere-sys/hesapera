export function calculateAverageCost(items: Array<{quantity: number, unitPrice: number}>) {
  let totalCost = 0;
  let totalQuantity = 0;
  
  for (const item of items) {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    if (q > 0 && p >= 0) {
      totalCost += q * p;
      totalQuantity += q;
    }
  }

  const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
  
  return {
    primaryResult: averageCost,
    secondaryResults: {
      'Toplam Miktar': totalQuantity,
      'Toplam Maliyet': totalCost
    }
  };
}