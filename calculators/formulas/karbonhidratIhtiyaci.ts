export interface KarbonhidratInput {
  kilo: number;
  aktiviteSeviyesi: 'Düşük' | 'Orta' | 'Yüksek' | 'Çok Yüksek (Dayanıklılık Sporcusu)';
}

export function calculateKarbonhidratIhtiyaci(inputs: KarbonhidratInput) {
  const { kilo, aktiviteSeviyesi } = inputs;

  if (kilo <= 20 || kilo > 300) throw new Error("Lütfen geçerli bir kilo (kg) giriniz.");

  let minGpK = 0;
  let maxGpK = 0;

  // EFSA / Spor Beslenmesi Kılavuzları genel referansları:
  if (aktiviteSeviyesi === 'Düşük') {
    minGpK = 3;
    maxGpK = 5;
  } else if (aktiviteSeviyesi === 'Orta') {
    minGpK = 5;
    maxGpK = 7;
  } else if (aktiviteSeviyesi === 'Yüksek') {
    minGpK = 6;
    maxGpK = 10;
  } else {
    minGpK = 8;
    maxGpK = 12;
  }

  const minGram = Math.round(kilo * minGpK);
  const maxGram = Math.round(kilo * maxGpK);

  const minKcal = minGram * 4;
  const maxKcal = maxGram * 4;

  return {
    primaryResult: `${minGram} - ${maxGram} gram/gün`,
    secondaryResults: {
      "Kullanılan Katsayı (g/kg)": `${minGpK} - ${maxGpK} g/kg`,
      "Kalori Karşılığı": `${minKcal} - ${maxKcal} kcal/gün`
    },
    notes: [
      "Karbonhidrat ihtiyacı, vücut ağırlığına (kg) ve günlük fiziksel aktivite yoğunluğuna göre belirlenir.",
      "Kullanılan katsayılar, spor beslenmesi kurumları (örn. ISSN) ve uluslararası sağlık standartlarının önerdiği genel aralıklardır.",
      "1 gram karbonhidrat yaklaşık 4 kcal enerji sağlar.",
      "Diyabetik durumlar, özel klinik veya ketojenik beslenme gibi durumlarda bu referanslar geçerli değildir. Kesin bir diyet programı için doktor veya diyetisyene başvurunuz."
    ]
  };
}
