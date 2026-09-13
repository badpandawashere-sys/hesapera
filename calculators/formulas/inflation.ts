import { TUIK_CPI_2025_BASE } from '@/lib/data/sources/tuik-cpi';

export function calculateInflation(startAmount: number, startDate: string, endDate: string) {
  if (isNaN(startAmount) || !isFinite(startAmount) || startAmount < 0) {
    throw new Error('Geçersiz tutar girildi.');
  }
  
  if (startDate > endDate) {
    throw new Error('Başlangıç tarihi, bitiş tarihinden ileri olamaz.');
  }

  const startIndex = TUIK_CPI_2025_BASE[startDate];
  const endIndex = TUIK_CPI_2025_BASE[endDate];

  if (startIndex === undefined) {
    throw new Error(`Başlangıç tarihi (${startDate}) için TÜİK verisi bulunamadı.`);
  }

  if (endIndex === undefined) {
    throw new Error(`Bitiş tarihi (${endDate}) için TÜİK verisi bulunamadı.`);
  }

  if (startIndex <= 0 || endIndex <= 0) {
    throw new Error('Endeks değerleri sıfır veya negatif olamaz.');
  }

  // Enflasyon Oranı = (Bitiş Endeksi / Başlangıç Endeksi - 1) * 100
  const inflationRate = ((endIndex / startIndex) - 1) * 100;
  
  // Enflasyon Sonrası Tutar = Başlangıç Tutarı * (Bitiş Endeksi / Başlangıç Endeksi)
  const finalAmount = startAmount * (endIndex / startIndex);
  
  // Fiyat Artışı = Enflasyon Sonrası Tutar - Başlangıç Tutarı
  const priceIncrease = finalAmount - startAmount;

  return {
    primaryLabel: 'Enflasyon Sonrası Tutar',
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(finalAmount),
    secondaryResults: {
      'Başlangıç Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(startAmount),
      'Başlangıç Tarihi': startDate,
      'Bitiş Tarihi': endDate,
      'Başlangıç Endeksi': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(startIndex),
      'Bitiş Endeksi': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(endIndex),
      'TÜFE Değişimi': '%' + new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(inflationRate),
      'Değer Artışı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(priceIncrease)
    },
    breakdown: [
      { label: 'Başlangıç Endeksi (' + startDate + ')', value: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(startIndex) },
      { label: 'Bitiş Endeksi (' + endDate + ')', value: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(endIndex) },
      { label: 'Uygulanan Formül', value: '(Bitiş Endeksi / Başlangıç Endeksi) formülü ile hesaplanmıştır.' },
      { label: 'Hesaplanan Sonuç', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(finalAmount) }
    ],
    infoReference: {
      title: "Veri Kaynağı ve Hesaplama Yöntemi",
      description: "Hesaplama, TÜİK tarafından yayımlanan Tüketici Fiyat Endeksi (TÜFE) 2025=100 resmi tarihsel serisine dayanmaktadır. Belirtilen tarihler arasındaki endeks değişimine göre doğrudan alım gücü (satın alma gücü) karşılığı matematiksel oranlama ile hesaplanmıştır."
    }
  };
}
