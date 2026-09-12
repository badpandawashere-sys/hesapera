// YDUS Puan Hesaplama
// Kaynak: OSYM 2026 YDUS Kilavuzu
//
// Sinav Yapisi:
// Yan Dal Uzmanlik Egitimi Giris Sinavi (YDUS)
// - Coktan secmeli sorulardan olusan testlerde 80 soru bulunur.
// - 4 Yanlis 1 Dogruyu Goturur.
//
// Standart Puanlama:
// - Adaylarin netleri standart puana (T-Skor) donusturulur.
// - Ortalama 50, Standart Sapma 10 olarak alinir.
// - Puanlama sirasinda adaylarin istatistikleri onemli oldugundan gercek hesaplama tam yapilamaz.
// 
// Yaklasik Formul:
// Temel bir yaklasimla Puan = (Net * 1.25). 
// TUS benzeri bir yapida ise (Örn. Puan = 20 + Net * 1.0) olabilir, ancak
// OSYM YDUS neticesi 100 uzerinden degerlendirilir. Bu aracta 100'e uyarlanmis 
// dogrusal bir yaklasim sunulmaktadir.

import { calculateNet, validateExamInputs } from "./exams/core";

export function calculateYdus(dogru: number, yanlis: number) {
  const MAX_Q = 80;
  validateExamInputs(dogru, yanlis, MAX_Q - dogru - yanlis, MAX_Q);

  // 4 yanlis 1 dogru
  const penalty = 0.25;
  const net = calculateNet(dogru, yanlis, penalty);

  // Yaklasik Puan = Net * 1.25 (100 uzerinden)
  // Gercek standart puan ortalamaya gore 100'u asabilir veya netler cok dusukse sifirda kalmayabilir.
  let approxScore = net * 1.25;
  if (approxScore < 0) approxScore = 0;

  return {
    primaryResult: approxScore.toFixed(3),
    secondaryResults: {
      "Doğru Sayısı": dogru.toString(),
      "Yanlış Sayısı": yanlis.toString(),
      "Net Sayısı": net.toFixed(2),
    },
    notes: [
      "OSYM tarafindan YDUS puanlari, sinava giren adaylarin net ortalamalari ve standart sapmalari kullanilarak hesaplanir.",
      "Yukaridaki sonuc tamamen YAKLASIK bir degerdir (Net x 1.25 formulu).",
      "Gercek sonuc, OSYM standartlastirmasina bagli olarak arti/eksi yonde degisebilir."
    ]
  };
}
