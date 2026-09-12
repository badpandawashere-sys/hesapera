export function calculateInflation(startAmount: number, startIndex: number, endIndex: number) {
  if (startIndex <= 0 || isNaN(startIndex) || isNaN(endIndex) || isNaN(startAmount) || !isFinite(startIndex) || !isFinite(endIndex) || !isFinite(startAmount)) {
    throw new Error('Geçersiz değerler (Sıfır, NaN veya Infinity)');
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
      'Enflasyon Oranı': '%' + new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(inflationRate),
      'Fiyat Artışı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(priceIncrease)
    },
    breakdown: [
      { label: 'Başlangıç Endeksi', value: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(startIndex) },
      { label: 'Bitiş Endeksi', value: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(endIndex) },
      { label: 'Uygulanan Formül', value: '(Bitiş Endeksi / Başlangıç Endeksi) formülü ile hesaplanmıştır.' },
      { label: 'Hesaplanan Sonuç', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(finalAmount) }
    ],
    infoReference: {
      title: "Veri Kaynağı ve Hesaplama Yöntemi",
      description: "Hesaplama, girdiğiniz başlangıç ve bitiş endeks değerlerine dayanarak doğrudan matematiksel oranlama ile yapılmaktadır. Doğrulanmış resmi tarihsel TÜİK veri seti (TÜFE/ÜFE) projeye entegre edilmediği için, hesaplama tamamen girdiğiniz referans indeks değerlerini kullanır. Bu nedenle geçmişe dönük resmi TÜİK enflasyon rakamları yerine, belirttiğiniz indeksler baz alınarak pure bir matematiksel hesaplama uygulanmaktadır."
    }
  };
}
