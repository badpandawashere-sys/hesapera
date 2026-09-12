// YDS Puan Hesaplama
// Kaynak: OSYM 2026 YDS/e-YDS Kilavuzu
//
// Sinav Yapisi:
// YDS'de coktan secmeli 80 soru sorulmaktadir.
// Degerlendirmede yalnizca dogru cevaplar dikkate alinir, YANLIS CEVAPLAR DOGRU CEVAPLARI GOTURMEZ.
// Her sorunun degeri 1.25 puandir. (80 x 1.25 = 100)
//
// Puanlama:
// 90 - 100 -> A Seviyesi
// 80 - 89  -> B Seviyesi
// 70 - 79  -> C Seviyesi
// 60 - 69  -> D Seviyesi
// 50 - 59  -> E Seviyesi

export function calculateYds(dogru: number, yanlis: number) {
  const bos = 80 - dogru - yanlis;
  
  if (dogru < 0 || yanlis < 0 || bos < 0 || dogru + yanlis > 80) {
    throw new Error("YDS'de toplam soru sayisi 80'dir. Lutfen girdilerinizi kontrol edin.");
  }

  // YDS'de yanlis dogruyu goturmez
  const puan = dogru * 1.25;
  
  let seviye = "Gecersiz/Puanlanmaz";
  if (puan >= 90) seviye = "A Seviyesi";
  else if (puan >= 80) seviye = "B Seviyesi";
  else if (puan >= 70) seviye = "C Seviyesi";
  else if (puan >= 60) seviye = "D Seviyesi";
  else if (puan >= 50) seviye = "E Seviyesi";
  else seviye = "Seviyesiz (<50 Puan)";

  return {
    primaryResult: puan.toFixed(2),
    secondaryResults: {
      "Doğru Sayısı": dogru.toString(),
      "Yanlış Sayısı": yanlis.toString(),
      "Boş Sayısı": bos.toString(),
      "Yabancı Dil Seviyesi": seviye
    },
    notes: [
      "OSYM YDS (Yabanci Dil Bilgisi Seviye Tespit Sinavi) ve e-YDS'de yanlis cevaplar dogrulari goturmez.",
      "Toplam 80 soru sorulur ve her dogru cevap 1.25 puan degerindedir.",
      "Yabanci dil tazminati veya ozel/resmi kurumlara basvuru sartlari (minimum C, B vb.) kuruma gore degiskenlik gosterebilir."
    ]
  };
}
