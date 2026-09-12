export function calculateTahvil(nominalValue: number, couponRate: number, couponFrequency: string, timeToMaturity: number, marketYield: number) {
  const m = parseInt(couponFrequency, 10);
  const n = timeToMaturity * m;
  const couponPayment = nominalValue * (couponRate / 100) / m;
  const yieldPerPeriod = (marketYield / 100) / m;
  
  let bondPrice = 0;
  
  if (yieldPerPeriod === 0) {
    bondPrice = (couponPayment * n) + nominalValue;
  } else {
    for (let t = 1; t <= n; t++) {
      bondPrice += couponPayment / Math.pow(1 + yieldPerPeriod, t);
    }
    bondPrice += nominalValue / Math.pow(1 + yieldPerPeriod, n);
  }
  
  const totalCouponIncome = couponPayment * n;
  
  let status = "Başa Baş (Nominal Değerinde)";
  if (Math.abs(bondPrice - nominalValue) < 0.01) {
    status = "Başa Baş (Nominal Değerinde)";
  } else if (bondPrice < nominalValue) {
    status = "İskontolu (İndirimli)";
  } else if (bondPrice > nominalValue) {
    status = "Primli";
  }

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(bondPrice),
    secondaryResults: {
      'Tahvil Durumu': status,
      'Dönemsel Kupon Ödemesi': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(couponPayment),
      'Toplam Kupon Geliri': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalCouponIncome),
      'Nominal Değer': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(nominalValue),
      'Piyasa Getirisi (YTM)': '%' + marketYield
    },
    notes: ['Tahvil fiyatı hesaplamasında iskontolanmış nakit akışları (DCF) yöntemi kullanılmıştır. Kesirli dönemler için tamsayı yaklaşımı yapılmıştır.']
  };
}