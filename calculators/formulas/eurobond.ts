export function calculateEurobond(faceValue: number, purchasePrice: number, annualCouponRate: number, couponFrequency: string, remainingYears: number) {
  const freq = parseInt(couponFrequency, 10);
  const annualCoupon = faceValue * (annualCouponRate / 100);
  const periodicCoupon = annualCoupon / freq;
  const periods = remainingYears * freq;
  
  const estimatedCouponIncome = periodicCoupon * periods;
  const estimatedTotalCashFlow = estimatedCouponIncome + faceValue;
  
  let discountPremium = '';
  if (purchasePrice < faceValue) {
    discountPremium = 'İskontolu (Discount)';
  } else if (purchasePrice > faceValue) {
    discountPremium = 'Primli (Premium)';
  } else {
    discountPremium = 'Başa Baş (Par)';
  }

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(estimatedTotalCashFlow),
    secondaryResults: {
      'Nominal Değer': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(faceValue),
      'Alış Fiyatı': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(purchasePrice),
      'Fiyat Durumu': discountPremium,
      'Tahmini Kupon Geliri': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(estimatedCouponIncome),
      'Kupon Oranı': '%' + annualCouponRate
    },
    notes: ['Bu araç basit tahmini nakit akışını hesaplar. Gerçek YTM (Vadeye Kadar Getiri), birikmiş faiz (accrued interest) veya vergi (stopaj) hesaplamalarını içermez.']
  };
}