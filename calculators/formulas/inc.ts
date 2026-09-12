const CM_PER_INCH = 2.54;

export function calculateInc(input: { miktar: number; kaynakBirim: 'inch' | 'cm'; hedefBirim: 'inch' | 'cm' }) {
  const { miktar, kaynakBirim, hedefBirim } = input;

  if (miktar < 0) {
    throw new Error("Değer negatif olamaz.");
  }

  let sonuc: number;
  let birimLabel: string;

  if (kaynakBirim === hedefBirim) {
    sonuc = miktar;
    birimLabel = kaynakBirim;
  } else if (kaynakBirim === 'inch' && hedefBirim === 'cm') {
    sonuc = miktar * CM_PER_INCH;
    birimLabel = 'cm';
  } else {
    // cm → inch
    sonuc = miktar / CM_PER_INCH;
    birimLabel = 'inch';
  }

  const formattedSonuc = Number.isInteger(sonuc) ? sonuc.toString() : sonuc.toFixed(6).replace(/\.?0+$/, '');
  const sourceBirimLabel = kaynakBirim === 'inch' ? 'İnç (inch)' : 'Santimetre (cm)';
  const targetBirimLabel = hedefBirim === 'inch' ? 'İnç (inch)' : 'Santimetre (cm)';

  return {
    primaryResult: `${formattedSonuc} ${birimLabel}`,
    secondaryResults: {
      'Girilen Değer': `${miktar} ${kaynakBirim}`,
      'Kaynak Birim': sourceBirimLabel,
      'Hedef Birim': targetBirimLabel,
      'Dönüşüm Sabiti': '1 inch = 2.54 cm'
    }
  };
}
