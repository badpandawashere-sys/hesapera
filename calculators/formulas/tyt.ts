// TYT Puan Hesaplama
// Kaynak: OSYM 2026 YKS Kilavuzu
//
// Sinav Yapisi (TYT):
// - Turkce: 40 soru
// - Sosyal Bilimler: 20 soru
// - Temel Matematik: 40 soru
// - Fen Bilimleri: 20 soru
// Toplam: 120 Soru. 4 yanlis 1 dogruyu goturur.
//
// Puan Hesabi:
// Adaylarin netleri standart puana (T-Skor) donusturulur.
// Yaklasik sabit katsayilar: Turkce (3.3), Sosyal (3.4), Matematik (3.3), Fen (3.4).
// Taban Puan: 100
// Puan = 100 + (TurkceNet*3.3) + (SosyalNet*3.4) + (MatNet*3.3) + (FenNet*3.4)

import { calculateNet, validateExamInputs } from "./exams/core";

export function calculateTyt(
  turkceC: number, turkceW: number,
  sosyalC: number, sosyalW: number,
  matematikC: number, matematikW: number,
  fenC: number, fenW: number
) {
  validateExamInputs(turkceC, turkceW, 40 - turkceC - turkceW, 40);
  validateExamInputs(sosyalC, sosyalW, 20 - sosyalC - sosyalW, 20);
  validateExamInputs(matematikC, matematikW, 40 - matematikC - matematikW, 40);
  validateExamInputs(fenC, fenW, 20 - fenC - fenW, 20);

  const penalty = 0.25;
  const turkceNet = calculateNet(turkceC, turkceW, penalty);
  const sosyalNet = calculateNet(sosyalC, sosyalW, penalty);
  const matematikNet = calculateNet(matematikC, matematikW, penalty);
  const fenNet = calculateNet(fenC, fenW, penalty);

  const totalNet = turkceNet + sosyalNet + matematikNet + fenNet;

  // Yaklasik Puan Hesabi (OSYM standartlastirmasi oncesi tahmini)
  const approxScore = 100 + (turkceNet * 3.3) + (sosyalNet * 3.4) + (matematikNet * 3.3) + (fenNet * 3.4);

  return {
    primaryResult: Math.max(100, approxScore).toFixed(3),
    secondaryResults: {
      "Turkce Net": turkceNet.toFixed(2) + " / 40",
      "Sosyal Bilimler Net": sosyalNet.toFixed(2) + " / 20",
      "Matematik Net": matematikNet.toFixed(2) + " / 40",
      "Fen Bilimleri Net": fenNet.toFixed(2) + " / 20",
      "Toplam Net": totalNet.toFixed(2) + " / 120"
    },
    notes: [
      "OSYM 2026-YKS (Yuksekogretim Kurumlari Sinavi) TYT kural ve test yapisina gore hesaplanmistir.",
      "Gosterilen deger Yaklasik TYT Sinav Puanidir. OSYM, Turkiye geneli sinav istatistiklerine (ortanca ve standart sapma) gore puanlari standartlastirir.",
      "OBP (Ortaogretim Basari Puani) bu sonuca dahil degildir. OBP katkisi icin OBP Hesaplama aracini kullanabilirsiniz."
    ]
  };
}
