export interface YagIhtiyaciInput {
  kaloriHedefi: number;
  yagYuzdesi: number;
}

export function calculateYagIhtiyaci(inputs: YagIhtiyaciInput) {
  const { kaloriHedefi, yagYuzdesi } = inputs;

  if (kaloriHedefi <= 500 || kaloriHedefi > 10000) throw new Error("Lütfen geçerli bir kalori hedefi giriniz (500 - 10000 kcal).");
  if (yagYuzdesi < 0 || yagYuzdesi > 100) throw new Error("Lütfen geçerli bir yağ yüzdesi (%0-100) giriniz.");

  // Yağ = 9 kcal/g
  const yagKcal = (kaloriHedefi * yagYuzdesi) / 100;
  const yagGram = Math.round(yagKcal / 9);

  let warning = "";
  if (yagYuzdesi > 30) {
    warning = `DİKKAT: Seçtiğiniz oran (%${yagYuzdesi}), WHO'nun sağlıklı yetişkinler için önerdiği toplam enerjinin en fazla %30'u olması kuralının üzerindedir.`;
  }

  return {
    primaryResult: `${yagGram} gram / gün`,
    secondaryResults: {
      "Yağdan Gelen Enerji": `${Math.round(yagKcal)} kcal`,
      "Günlük Toplam Kalori": `${kaloriHedefi} kcal`,
      "Hedef Yüzde": `%${yagYuzdesi}`
    },
    notes: [
      warning,
      "Bu hesaplama, uluslararası enerji dönüşüm standardı olan '1 gram Yağ = 9 kcal' formülüne (Atwater faktörleri) göre yapılmıştır.",
      "Dünya Sağlık Örgütü (WHO), sağlıksız kilo alımını önlemek amacıyla yetişkinler için toplam yağ alımının toplam enerji alımının %30'unu aşmamasını, ancak yağın aşırı derecede kısıtlanmamasını önermektedir.",
      "Bu araç bir diyet reçetesi değildir. Belirli hastalıklar veya ketojenik diyet gibi özel beslenme tiplerinde ihtiyaçlar değişebilir."
    ].filter(n => n !== "")
  };
}
