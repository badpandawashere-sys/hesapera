export function calculateMetrekare(uzunluk: number, genislik: number, birim: 'm' | 'cm' = 'm') {
  if (isNaN(uzunluk) || isNaN(genislik) || !isFinite(uzunluk) || !isFinite(genislik) || uzunluk <= 0 || genislik <= 0) {
    throw new Error("Geçersiz veya negatif değer girildi.");
  }

  // Convert to meters
  const lengthInMeters = birim === 'cm' ? uzunluk / 100 : uzunluk;
  const widthInMeters = birim === 'cm' ? genislik / 100 : genislik;

  const areaSqMeters = lengthInMeters * widthInMeters;

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 4 }).format(val);
  };

  return {
    primaryLabel: 'Alan',
    primaryResult: `${formatNumber(areaSqMeters)} m²`,
    secondaryResults: {
      'Uzunluk': `${formatNumber(lengthInMeters)} m`,
      'Genişlik': `${formatNumber(widthInMeters)} m`,
      'İşlem': `${formatNumber(lengthInMeters)} m × ${formatNumber(widthInMeters)} m`
    },
    breakdown: [
      { label: 'Formül', value: 'Uzunluk × Genişlik' },
      { label: 'İşlem', value: `${formatNumber(lengthInMeters)} m × ${formatNumber(widthInMeters)} m` },
      { label: 'Sonuç', value: `${formatNumber(areaSqMeters)} m²` }
    ],
    infoReference: {
      title: 'Metrekare (m²) Nasıl Hesaplanır?',
      description: 'Dikdörtgen veya kare şeklindeki bir alanın metrekaresini bulmak için uzunluk ve genişlik ölçüleri birbiriyle çarpılır. Hesaplanan alan daima m² (metrekare) birimiyle ifade edilir.'
    }
  };
}
