// MSU — Milli Savunma Universitesi Sinavi (OSYM)
// Kaynak: OSYM 2026-MSU Kilavuzu (osym.gov.tr)
// Resmi: 2026-MSU → 1 Mart 2026 tarihinde uygulanmistir.
//
// Sinav yapisi (OSYM resmi kilavuzu):
//   Turkcenin Dogru Kullanimi : 40 soru
//   Sosyal Bilimler          : 20 soru
//   Temel Matematik          : 40 soru
//   Fen Bilimleri            : 20 soru
//   Toplam                   : 120 soru
// Her 4 yanlis 1 dogruyu goturur.
//
// Agirliklar (2026 Kilavuzu):
//   SAY   : Turkce %25, Sosyal %10, Mat %50, Fen %15
//   SOZ   : Turkce %50, Sosyal %20, Mat %20, Fen %10
//   EA    : Turkce %35, Sosyal %15, Mat %35, Fen %15
//   GENEL : Turkce %33, Sosyal %17, Mat %33, Fen %17
//
// NOT: Gercek MSU puani OSYM istatistiksel standartlastirmasiyla
// 100-500 araliginda hesaplanir. Asagida 100-500 araligina normalize
// edilmis yaklasik bir standart puan simulasyonu kullanilmistir.

import { calculateNet, validateExamInputs } from "./exams/core";

export type MsuScoreType = "SAY" | "SOZ" | "EA" | "GENEL";

const WEIGHTS: Record<MsuScoreType, { turkce: number; sosyal: number; matematik: number; fen: number }> = {
  SAY:   { turkce: 0.25, sosyal: 0.10, matematik: 0.50, fen: 0.15 },
  SOZ:   { turkce: 0.50, sosyal: 0.20, matematik: 0.20, fen: 0.10 },
  EA:    { turkce: 0.35, sosyal: 0.15, matematik: 0.35, fen: 0.15 },
  GENEL: { turkce: 0.33, sosyal: 0.17, matematik: 0.33, fen: 0.17 }
};

export function calculateMsu(
  scoreType: MsuScoreType,
  turkceC: number, turkceW: number,
  sosyalC: number, sosyalW: number,
  matematikC: number, matematikW: number,
  fenC: number, fenW: number
) {
  validateExamInputs(turkceC, turkceW, 40 - turkceC - turkceW, 40);
  validateExamInputs(sosyalC, sosyalW, 20 - sosyalC - sosyalW, 20);
  validateExamInputs(matematikC, matematikW, 40 - matematikC - matematikW, 40);
  validateExamInputs(fenC, fenW, 20 - fenC - fenW, 20);

  const turkceNet = calculateNet(turkceC, turkceW, 0.25);
  const sosyalNet = calculateNet(sosyalC, sosyalW, 0.25);
  const matematikNet = calculateNet(matematikC, matematikW, 0.25);
  const fenNet = calculateNet(fenC, fenW, 0.25);

  const w = WEIGHTS[scoreType];
  
  // Normalize each test to a 0-1 scale, then apply weights
  const normTurkce    = turkceNet / 40;
  const normSosyal    = sosyalNet / 20;
  const normMatematik = matematikNet / 40;
  const normFen       = fenNet / 20;
  
  const weightedNorm  = (normTurkce * w.turkce) + (normSosyal * w.sosyal) + (normMatematik * w.matematik) + (normFen * w.fen);
  
  // MSÜ puanı genelde 100-500 aralığındadır.
  // 100 taban puan, 400 puan netlerden gelir.
  const approxScore   = 100 + (weightedNorm * 400);

  const scoreLabels: Record<MsuScoreType, string> = {
    SAY:   "MSU-SAY (Sayisal)",
    SOZ:   "MSU-SOZ (Sozel)",
    EA:    "MSU-EA (Esit Agirlik)",
    GENEL: "MSU-GENEL (Genel)"
  };

  return {
    primaryResult: approxScore.toFixed(3),
    secondaryResults: {
      "Turkce Net": turkceNet.toFixed(2) + " / 40",
      "Sosyal Bilimler Net": sosyalNet.toFixed(2) + " / 20",
      "Matematik Net": matematikNet.toFixed(2) + " / 40",
      "Fen Bilimleri Net": fenNet.toFixed(2) + " / 20",
      "Puan Turu": scoreLabels[scoreType]
    },
    notes: [
      "2026-MSU, OSYM tarafindan uygulanmistir. Turkce (40) + Sosyal (20) + Mat (40) + Fen (20) = 120 soru. 4 yanlis 1 dogruyu goturur.",
      "Gosterilen puan 100-500 araliginda yaklasik degerdir. Gercek MSU puani OSYM standart sapma hesaplamalariyla belirlenir.",
      "Harp Okullari ve Astsubay MYO secim surecinde OSYM tarafindan ilan edilen resmi taban puanlar ve puan turleri gecerlidir."
    ]
  };
}
