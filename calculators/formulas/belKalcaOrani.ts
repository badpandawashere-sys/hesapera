export interface BelKalcaInput {
  cinsiyet: 'Erkek' | 'Kadın';
  bel: number;
  kalca: number;
}

export function calculateBelKalcaOrani(inputs: BelKalcaInput) {
  const { cinsiyet, bel, kalca } = inputs;

  if (bel <= 30 || bel > 300) throw new Error("Geçersiz bel ölçüsü.");
  if (kalca <= 30 || kalca > 300) throw new Error("Geçersiz kalça ölçüsü.");

  const oran = bel / kalca;
  let riskKategorisi = "";

  // WHO referansina gore abdominal obezite sinirlari
  if (cinsiyet === 'Erkek') {
    if (oran >= 0.90) riskKategorisi = "Abdominal obezite riski (WHO referansına göre ≥ 0.90)";
    else riskKategorisi = "Düşük/Normal risk";
  } else {
    if (oran >= 0.85) riskKategorisi = "Abdominal obezite riski (WHO referansına göre ≥ 0.85)";
    else riskKategorisi = "Düşük/Normal risk";
  }

  return {
    primaryResult: oran.toFixed(2),
    secondaryResults: {
      "Bel Çevresi": `${bel} cm`,
      "Kalça Çevresi": `${kalca} cm`,
      "Genel Risk Referansı": riskKategorisi
    },
    notes: [
      "Bel/Kalça oranı, vücuttaki yağ dağılımını ve olası metabolik riskleri değerlendirmek için Dünya Sağlık Örgütü (WHO) tarafından da önerilen matematiksel bir yöntemdir.",
      "Cinsiyete göre WHO sınırları: Erkekler için 0.90, kadınlar için 0.85 ve üzeridir.",
      "Bu hesaplama genel bir referans olup tıbbi tanı (teşhis) koymaz. Sağlık risklerinizin kesin olarak değerlendirilmesi için lütfen bir hekime danışınız."
    ]
  };
}
