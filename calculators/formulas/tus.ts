// TUS Puan Hesaplama
// Kaynak: OSYM 2026 TUS Kilavuzu
//
// Sinav Yapisi:
// Temel Tip Bilimleri Testi (TTBT): 100 soru (Son yillarda 100, oncesinde 120)
// Klinik Tip Bilimleri Testi (KTBT): 100 soru
// 4 Yanlis 1 Dogruyu Goturur.
//
// Tip mezunlari icin K, T, A puanlari gibi puan turleri hesaplanir. Tip disi meslekler icin Temel Tip Puani hesaplanir.
//
// Standart Puan (Aday Istatistikleri):
// TUS puanlari adaylarin netlerinin ortalamasi (50) ve standart sapmasi (10) alinarak
// T-skoruna (Standart Puana) donusturulur.
//
// Yaklasik Formul (Guncel Tahmini):
// Temel Tip Puani = 25 + (TTBT Neti * 0.35) + (KTBT Neti * 0.35) - kabaca
// Veya standart puan uzerinden bir tahmini katsayi (Orn: 0.25 TTBT, 0.25 KTBT).
// Asagidaki formul yaklasik bir hesaplama modelidir.

import { calculateNet, validateExamInputs } from "./exams/core";

export function calculateTus(
  ttbtC: number, ttbtW: number,
  ktbtC: number, ktbtW: number,
  mezuniyet: "tip" | "tip_disi"
) {
  // Guncel yillarda (2024 sonrasi) TUS soru sayisi genellikle 100 TTBT + 100 KTBT = 200 sorudur.
  // Gecmiste 120 idi, bu yuzden max 120 verelim validation'da patlamasin.
  const MAX_Q = 120;
  validateExamInputs(ttbtC, ttbtW, MAX_Q - ttbtC - ttbtW, MAX_Q);
  validateExamInputs(ktbtC, ktbtW, MAX_Q - ktbtC - ktbtW, MAX_Q);

  const penalty = 0.25;
  const ttbtNet = calculateNet(ttbtC, ttbtW, penalty);
  const ktbtNet = calculateNet(ktbtC, ktbtW, penalty);

  // Yaklasik TUS Puani Hesabi (T Puan ve K Puan genelde benzer cikar)
  // Ortalama bir sinavda 1 netin degeri yaklasik 0.25 - 0.35 puan arasidir. 
  // Taban puan + (Net * Katsayi)
  // Sabit TUS formulleri cogunlukla K Puani (Klinik) icin:
  // K Puani = 25 + (TTBT Neti * 0.25) + (KTBT Neti * 0.25) -- bu eski.
  // Modern tahmini = 25 + (TTBT Neti * 0.24) + (KTBT Neti * 0.26)
  // Tip disi icin Temel Tip Puani: (TTBT Net * 0.40) + taban.
  
  let approxKlinik = 0;
  let approxTemel = 0;
  
  if (mezuniyet === "tip") {
    // Tip mezunlari icin K ve T puanlari yaklasik olarak
    approxKlinik = 25 + (ttbtNet * 0.24) + (ktbtNet * 0.26);
    approxTemel = 25 + (ttbtNet * 0.26) + (ktbtNet * 0.24);
  } else {
    // Tip disi (veteriner, eczaci, vs) sadece Temel Tip Puani hesaplanir ve TTBT agirliklidir
    approxTemel = 25 + (ttbtNet * 0.35) + (ktbtNet * 0.15); // Tahmini
  }

  // 0 altini sifirla, maks genelde 80-85 civaridir
  approxKlinik = Math.max(0, approxKlinik);
  approxTemel = Math.max(0, approxTemel);

  return {
    primaryResult: mezuniyet === "tip" ? approxKlinik.toFixed(3) : approxTemel.toFixed(3),
    secondaryResults: {
      "Temel Tip Neti": ttbtNet.toFixed(2),
      "Klinik Tip Neti": ktbtNet.toFixed(2),
      "Yaklasik K-Puani (Klinik)": mezuniyet === "tip" ? approxKlinik.toFixed(3) : "Hesaplanmaz",
      "Yaklasik T-Puani (Temel)": approxTemel.toFixed(3)
    },
    notes: [
      "OSYM tarafindan TUS puanlari, sinava giren adaylarin net ortalamalari ve standart sapmalari kullanilarak hesaplanir.",
      "Yukaridaki sonuc yaklasik bir degerdir (Sabit katsayi yaklasimi kullanilmistir).",
      "Gercek sonuc, OSYM standartlastirmasina bagli olarak arti/eksi yonde degisebilir."
    ]
  };
}
