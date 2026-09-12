export interface ProteinIhtiyaciInput {
  kilo: number;
  aktiviteSeviyesi: 'Sedanter (Hareketsiz)' | 'Düzenli Egzersiz (Hafif/Orta)' | 'Sporcu (Güç/Dayanıklılık)';
}

export function calculateProteinIhtiyaci(inputs: ProteinIhtiyaciInput) {
  const { kilo, aktiviteSeviyesi } = inputs;

  if (kilo <= 20 || kilo > 300) throw new Error("Lütfen geçerli bir kilo (kg) giriniz.");

  let minGpK = 0.83;
  let maxGpK = 1.0;
  let kaynak = "EFSA (Avrupa Gıda Güvenliği Otoritesi - Yetişkinler İçin PRI)";

  if (aktiviteSeviyesi === 'Sedanter (Hareketsiz)') {
    minGpK = 0.83;
    maxGpK = 1.0; // 0.83 is the EFSA standard, 1.0 is a common clinical safety margin
  } else if (aktiviteSeviyesi === 'Düzenli Egzersiz (Hafif/Orta)') {
    minGpK = 1.4;
    maxGpK = 1.7;
    kaynak = "ISSN (Uluslararası Spor Beslenmesi Derneği - 1.4-2.0 g/kg aralığının alt sınırı)";
  } else if (aktiviteSeviyesi === 'Sporcu (Güç/Dayanıklılık)') {
    minGpK = 1.7;
    maxGpK = 2.0;
    kaynak = "ISSN (Uluslararası Spor Beslenmesi Derneği - 1.4-2.0 g/kg aralığının üst sınırı)";
  }

  const minGram = Math.round(kilo * minGpK);
  const maxGram = Math.round(kilo * maxGpK);

  return {
    primaryResult: `${minGram} - ${maxGram} gram/gün`,
    secondaryResults: {
      "Kullanılan Katsayı": `${minGpK} - ${maxGpK} g/kg`,
      "Referans Kaynak": kaynak
    },
    notes: [
      "Avrupa Gıda Güvenliği Otoritesi (EFSA), sağlıklı sedanter yetişkinler için Günlük Referans Alım (PRI) miktarını 0.83 g/kg olarak belirlemiştir.",
      "Uluslararası Spor Beslenmesi Derneği (ISSN), egzersiz yapan ve kas kütlesi inşa etmeyi / korumayı hedefleyen bireyler için genel olarak 1.4 ile 2.0 g/kg/gün aralığını önermektedir.",
      "Bu hesaplama genel bir rehberdir. Böbrek hastalığı veya özel bir klinik durumunuz varsa mutlaka hekiminize veya diyetisyeninize danışınız."
    ]
  };
}
