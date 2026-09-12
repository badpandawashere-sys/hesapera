export function calculateDiscount(price: number, discountRate: number) {
  const discountAmount = price * (discountRate / 100);
  const finalPrice = price - discountAmount;
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(finalPrice),
    secondaryResults: {
      'İndirim Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(discountAmount),
      'İndirim Oranı': '%' + discountRate,
      'Orijinal Fiyat': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)
    }
  };
}