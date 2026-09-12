import { calculateRawBmr } from './bmr';

export interface KaloriIhtiyaciInput {
  cinsiyet: 'Erkek' | 'Kadın';
  yas: number;
  boy: number;
  kilo: number;
  aktiviteFaktoru: number;
}

export function calculateKaloriIhtiyaci(inputs: KaloriIhtiyaciInput) {
  const { cinsiyet, yas, boy, kilo, aktiviteFaktoru } = inputs;

  const bmr = calculateRawBmr(cinsiyet, yas, boy, kilo);
  const tdee = bmr * aktiviteFaktoru;

  let aktiviteSeviyesi = "Bilinmiyor";
  if (aktiviteFaktoru === 1.2) aktiviteSeviyesi = "Sedanter (Hareketsiz)";
  else if (aktiviteFaktoru === 1.375) aktiviteSeviyesi = "Hafif Aktif";
  else if (aktiviteFaktoru === 1.55) aktiviteSeviyesi = "Orta Aktif";
  else if (aktiviteFaktoru === 1.725) aktiviteSeviyesi = "Çok Aktif";
  else if (aktiviteFaktoru === 1.9) aktiviteSeviyesi = "Çok Yoğun Aktif";

  return {
    primaryResult: `${Math.round(tdee)} kcal/gün`,
    secondaryResults: {
      "Bazal Metabolizma (BMR)": `${Math.round(bmr)} kcal`,
      "Aktivite Seviyesi": aktiviteSeviyesi,
      "Kullanılan Yöntem": "Mifflin-St Jeor + PAL (Aktivite Çarpanı)"
    },
    notes: [
      "Bu hesaplama tahmini günlük toplam enerji harcamanızı (TDEE) gösterir.",
      "Kilo kontrolü (zayıflama veya kilo alma) için bu değerin üzerine genel olarak ±300-500 kcal eklenmesi/çıkarılması önerilir, ancak kalori açığı oluştururken tıbbi beslenme uzmanlarına danışılması esastır.",
      "Aktivite çarpanları T.C. Sağlık Bakanlığı ve WHO tarafından referans alınan standart PAL (Physical Activity Level) katsayılarına dayanmaktadır.",
      "Bu araç kesin tıbbi veya diyet önerisi yerine geçmez."
    ]
  };
}
