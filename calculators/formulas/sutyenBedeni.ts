export interface SutyenBedeniInput {
  gogusAltiCevresi: number;
  gogusCevresi: number;
}

export function calculateSutyenBedeni(inputs: SutyenBedeniInput) {
  const { gogusAltiCevresi, gogusCevresi } = inputs;

  if (gogusAltiCevresi < 50 || gogusAltiCevresi > 150) {
    throw new Error("Lütfen geçerli bir göğüs altı çevresi giriniz (50-150 cm).");
  }
  if (gogusCevresi < 60 || gogusCevresi > 200) {
    throw new Error("Lütfen geçerli bir göğüs çevresi giriniz (60-200 cm).");
  }
  if (gogusCevresi <= gogusAltiCevresi) {
    throw new Error("Göğüs çevresi ölçüsü, göğüs altı çevresinden büyük olmalıdır.");
  }

  // EU/TR Bant (Band) Ölçüsü Hesaplama (EN 13402 standartlarına göre en yakın 5'in katı)
  const bandBase = Math.round(gogusAltiCevresi / 5) * 5;

  // Cup (Kup) Hesaplama: Göğüs Çevresi - Göğüs Altı Çevresi
  const diff = gogusCevresi - gogusAltiCevresi;
  let cup = "";

  if (diff < 12) cup = "AA";
  else if (diff < 14) cup = "A";
  else if (diff < 16) cup = "B";
  else if (diff < 18) cup = "C";
  else if (diff < 20) cup = "D";
  else if (diff < 22) cup = "E";
  else if (diff < 24) cup = "F";
  else if (diff < 26) cup = "G";
  else cup = "H+";

  return {
    primaryResult: `${bandBase}${cup}`,
    secondaryResults: {
      "Sırt (Bant) Ölçüsü": `${bandBase}`,
      "Kup (Fincan) Ölçüsü": cup,
      "Fark": `${diff.toFixed(1)} cm`
    },
    notes: [
      "Bu hesaplama Avrupa (EU) ve Türkiye (TR) standart ölçü sistemi olan EN 13402'ye dayanmaktadır.",
      "Çıkan sonuç bir 'tahmini sütyen bedeni'dir. Beden kalıpları, ölçüm teknikleri ve markaların tasarımlarına göre (esneme payı, destek seviyesi) değişiklik gösterebilir.",
      "Sınır ölçülerinde (örneğin 14 cm fark) hem A hem B kup denenebilir (sister size / kardeş beden kavramı).",
      "Bu araç tıbbi veya anatomik bir değerlendirme sunmaz."
    ]
  };
}
