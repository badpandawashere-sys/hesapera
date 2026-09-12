export function calculateAverageMaturity(items: { amount: number; days: number }[]) {
  if (items.length < 1) {
    throw new Error('En az 1 kalem girmelisiniz.');
  }

  let totalAmount = 0;
  let weightedSum = 0;

  items.forEach(item => {
    totalAmount += item.amount;
    weightedSum += (item.amount * item.days);
  });

  if (totalAmount <= 0) {
    throw new Error('Toplam tutar 0 dan büyük olmalıdır.');
  }

  const averageDays = weightedSum / totalAmount;

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(averageDays) + ' Gün',
    secondaryResults: {
      'Toplam Tutar': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalAmount),
      'Ağırlıklı Gün Toplamı (Tutar x Gün)': new Intl.NumberFormat('tr-TR').format(weightedSum),
      'Kalem Sayısı': items.length
    },
    notes: ['Ağırlıklı Ortalama Vade = Toplam(Tutar x Gün) / Toplam(Tutar)']
  };
}