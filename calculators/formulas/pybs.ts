// PYBS / IOKBS Puan Hesaplama
// Kaynak: MEB 2026 Ilkogretim ve Ortaogretim Kurumlari Bursluluk Sinavi Kilavuzu
//
// 5, 6, 7, 8, Hazirlik, 9, 10, 11. Siniflar icin 100 soru sorulur.
// Testler (Genel Dağılım - 25'er soru):
// - Turkce / Turk Dili ve Edebiyati: 25
// - Matematik: 25
// - Fen Bilimleri: 25
// - Sosyal Bilgiler (Inkilap Tarihi / Din Kultur): 25
// Toplam 100 Soru. 3 yanlis 1 dogruyu goturur.
//
// Standart Puan (TASP) Hesaplamasi aday grubunun ortalama ve standart
// sapma degerlerine gore hesaplanarak 100-500 arasina donusturulur.
// Asagidaki hesaplama tahmini bir agirlikli net -> 500 donusumudur.

import { calculateNet, validateExamInputs } from "./exams/core";

export function calculatePybs(
  turkceC: number, turkceW: number,
  matematikC: number, matematikW: number,
  fenC: number, fenW: number,
  sosyalC: number, sosyalW: number
) {
  validateExamInputs(turkceC, turkceW, 25 - turkceC - turkceW, 25);
  validateExamInputs(matematikC, matematikW, 25 - matematikC - matematikW, 25);
  validateExamInputs(fenC, fenW, 25 - fenC - fenW, 25);
  validateExamInputs(sosyalC, sosyalW, 25 - sosyalC - sosyalW, 25);

  // 3 yanlis 1 dogruyu goturur (0.333...) -> MEB kuralidir.
  // We use 1/3 penalty.
  const penalty = 1 / 3;
  const turkceNet = calculateNet(turkceC, turkceW, penalty);
  const matematikNet = calculateNet(matematikC, matematikW, penalty);
  const fenNet = calculateNet(fenC, fenW, penalty);
  const sosyalNet = calculateNet(sosyalC, sosyalW, penalty);

  const totalNet = turkceNet + matematikNet + fenNet + sosyalNet;
  
  // Yaklasik Puan: (Toplam Net / 100) * 400 + 100 = 100-500 araligi.
  // Bazi hesaplamalarda taban puan 100 uzerine katsayilarla eklenir. 
  // MEB IOKBS'de butun testlerin TASP agirligi esittir (Katsayi = 3 kullanilirdi eskiden).
  // Total Net * 5 is also a common approximation. Let's use (totalNet / 100) * 400 + 100 to ensure 100-500 bounds.
  // Actually, full correct is 100 net -> (100/100)*400 + 100 = 500.
  // Zero net -> (0/100)*400 + 100 = 100.
  let approxScore = 100 + (totalNet * 4);
  if (approxScore < 100) approxScore = 100;
  if (approxScore > 500) approxScore = 500;

  return {
    primaryResult: approxScore.toFixed(3),
    secondaryResults: {
      "Turkce / TDE Net": turkceNet.toFixed(2) + " / 25",
      "Matematik Net": matematikNet.toFixed(2) + " / 25",
      "Fen Bilimleri Net": fenNet.toFixed(2) + " / 25",
      "Sosyal Bilgiler Net": sosyalNet.toFixed(2) + " / 25",
      "Toplam Net": totalNet.toFixed(2) + " / 100"
    },
    notes: [
      "MEB 2026 IOKBS (Bursluluk) sinav yapisina gore hesaplanmistir. Her testten 25 olmak uzere toplam 100 soru sorulur. 3 yanlis 1 dogruyu goturur.",
      "Gosterilen puan 100-500 araliginda yaklasik bir degerdir. Gercek IOKBS (PYBS) puani MEB'in istatistiksel standart sapma hesaplamalari ile (TASP) belirlenir.",
      "Soru katsayilari ve test agirliklari sinava giren ogrenci grubunun genel basarisina gore yildan yila degisiklik gostermektedir."
    ]
  };
}
