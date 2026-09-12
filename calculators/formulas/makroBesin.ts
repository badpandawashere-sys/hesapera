export interface MakroBesinInput {
  kaloriHedefi: number;
  proteinYuzdesi: number;
  karbonhidratYuzdesi: number;
  yagYuzdesi: number;
}

export function calculateMakroBesin(inputs: MakroBesinInput) {
  const { kaloriHedefi, proteinYuzdesi, karbonhidratYuzdesi, yagYuzdesi } = inputs;

  if (kaloriHedefi <= 500 || kaloriHedefi > 10000) throw new Error("Lütfen geçerli bir kalori hedefi giriniz (500 - 10000 kcal).");

  const totalPercent = proteinYuzdesi + karbonhidratYuzdesi + yagYuzdesi;
  if (Math.round(totalPercent) !== 100) {
    throw new Error(`Makro yüzdelerinin toplamı tam 100 olmalıdır. (Şu anki toplam: ${totalPercent})`);
  }

  // Protein = 4 kcal/g
  // Carb = 4 kcal/g
  // Fat = 9 kcal/g

  const proteinKcal = (kaloriHedefi * proteinYuzdesi) / 100;
  const carbKcal = (kaloriHedefi * karbonhidratYuzdesi) / 100;
  const fatKcal = (kaloriHedefi * yagYuzdesi) / 100;

  const proteinGram = Math.round(proteinKcal / 4);
  const carbGram = Math.round(carbKcal / 4);
  const fatGram = Math.round(fatKcal / 9);

  return {
    primaryResult: `${kaloriHedefi} kcal/gün`,
    secondaryResults: {
      "Protein (g)": `${proteinGram} g (%${proteinYuzdesi})`,
      "Karbonhidrat (g)": `${carbGram} g (%${karbonhidratYuzdesi})`,
      "Yağ (g)": `${fatGram} g (%${yagYuzdesi})`
    },
    notes: [
      "Hesaplamalarda evrensel enerji dönüşüm standartları olan Protein: 4 kcal/g, Karbonhidrat: 4 kcal/g ve Yağ: 9 kcal/g kullanılmıştır.",
      "Bu dağılım, kullanıcının seçtiği yüzdelik oranlara göre matematiksel olarak hesaplanmış olup, tıbbi bir diyet önerisi değildir.",
      "İdeal makro dağılımı kişinin sağlık durumuna, spor hedefine ve vücut kompozisyonuna göre değişiklik gösterir."
    ]
  };
}
