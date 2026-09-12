export function calculateFinancialDiscount(input: {
  discountType: 'inner' | 'outer';
  nominalValue: number;
  annualRate: number;
  remainingDays: number;
}) {
  const { discountType, nominalValue, annualRate, remainingDays } = input;

  if (
    isNaN(nominalValue) || !isFinite(nominalValue) || nominalValue <= 0 ||
    isNaN(annualRate) || !isFinite(annualRate) || annualRate <= 0 ||
    isNaN(remainingDays) || !isFinite(remainingDays) || remainingDays <= 0 || !Number.isInteger(remainingDays)
  ) {
    throw new Error("Tüm alanlar 0'dan büyük geçerli sayılar olmalıdır.");
  }

  const r = annualRate / 100;
  const t = remainingDays / 365; // 365 gün varsayımı (Türkiye piyasa standardı veya genel kullanım)
  
  let netValue = 0;
  let discountAmount = 0;
  
  if (discountType === 'outer') {
    // Dış İskonto (Ticari İskonto)
    // İskonto Tutarı = S * i * t
    discountAmount = nominalValue * r * t;
    netValue = nominalValue - discountAmount;

    // Matematiksel olarak dış iskonto faizi nominal değeri aşamaz.
    if (netValue < 0) {
      throw new Error("Bu faiz oranı ve vade ile dış iskonto tutarı nominal değeri aşmaktadır. Geçersiz kombinasyon.");
    }
  } else {
    // İç İskonto (Gerçek İskonto)
    // Peşin Değer = S / (1 + i * t)
    netValue = nominalValue / (1 + r * t);
    discountAmount = nominalValue - netValue;
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  const discountTypeLabel = discountType === 'outer' ? 'Dış İskonto' : 'İç İskonto';

  return {
    primaryLabel: 'Peşin Değer (Net Bugünkü Değer)',
    primaryResult: formatCurrency(netValue),
    secondaryResults: {
      'Hesaplama Türü': discountTypeLabel,
      'Nominal Değer': formatCurrency(nominalValue),
      'İskonto Tutarı': formatCurrency(discountAmount),
      'İskonto Oranı': `%${annualRate}`,
      'Vadeye Kalan Gün': `${remainingDays} Gün`
    },
    breakdown: [
      { label: 'Nominal Değer', value: formatCurrency(nominalValue) },
      { label: 'İskonto Tutarı', value: formatCurrency(discountAmount) },
      { label: 'Peşin Değer', value: formatCurrency(netValue) }
    ],
    infoReference: {
      title: `${discountTypeLabel} Hakkında`,
      description: discountType === 'outer' 
        ? 'Dış (ticari) iskonto, iskonto tutarının vade sonundaki nominal değer üzerinden hesaplanmasıdır. Pratikliği nedeniyle piyasada yaygındır.'
        : 'İç (gerçek) iskonto, iskonto tutarının varlığın peşin (bugünkü) değeri üzerinden hesaplanmasıdır. Matematiksel olarak daha tutarlıdır.'
    },
    notes: [
      'Hesaplamalarda Türkiye genel piyasa pratiği olan 1 yıl = 365 gün varsayımı (Day Count Convention) kullanılmıştır.'
    ]
  };
}
