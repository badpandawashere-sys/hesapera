export interface BmrInput {
  cinsiyet: 'Erkek' | 'Kadın';
  yas: number;
  boy: number;
  kilo: number;
}

export function calculateRawBmr(cinsiyet: 'Erkek' | 'Kadın', yas: number, boy: number, kilo: number): number {
  if (yas <= 0 || yas > 120) throw new Error("Lütfen geçerli bir yaş giriniz.");
  if (boy <= 50 || boy > 250) throw new Error("Lütfen geçerli bir boy (cm) giriniz.");
  if (kilo <= 20 || kilo > 300) throw new Error("Lütfen geçerli bir kilo (kg) giriniz.");

  // Mifflin-St Jeor Formulü
  if (cinsiyet === 'Erkek') {
    return 10 * kilo + 6.25 * boy - 5 * yas + 5;
  } else {
    return 10 * kilo + 6.25 * boy - 5 * yas - 161;
  }
}

export function calculateBmr(inputs: BmrInput) {
  const { cinsiyet, yas, boy, kilo } = inputs;
  const bmr = calculateRawBmr(cinsiyet, yas, boy, kilo);

  return {
    primaryResult: `${Math.round(bmr)} kcal/gün`,
    secondaryResults: {
      "Kullanılan Formül": "Mifflin-St Jeor",
      "Değerlendirilen Cinsiyet": cinsiyet
    },
    notes: [
      "Bazal Metabolizma Hızı (BMR), vücudunuzun tam dinlenme halinde hayati fonksiyonlarını sürdürebilmesi için harcadığı tahmini minimum enerjidir.",
      "Mifflin-St Jeor denklemi, günümüzde genel popülasyon için en güvenilir ve yaygın kullanılan BMR hesaplama formüllerinden biridir.",
      "Bu değer sizin 'kesin günlük kalori ihtiyacınız (TDEE)' değildir. Günlük enerji ihtiyacı; aktivite seviyenize, sağlık durumunuza ve metabolik farklılıklarınıza göre BMR değerinin üzerine eklenerek bulunur."
    ]
  };
}
