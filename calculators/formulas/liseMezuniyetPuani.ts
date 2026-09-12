// Lise Mezuniyet Puani (Diploma Puani) Hesaplama
// Kaynak: MEB Ortaogretim Kurumlari Yonetmeligi

import { calculateAritmetikOrtalama } from "./education/liseHelpers";
import { calculateObp } from "./obp";

export interface LiseMezuniyetPuaniInput {
  yillar: { yil: string; puan: number }[];
}

export function calculateLiseMezuniyetPuani(inputs: LiseMezuniyetPuaniInput) {
  if (!inputs.yillar || inputs.yillar.length === 0) {
    throw new Error("Lutfen en az bir yil sonu basari puani giriniz.");
  }

  const puanlar = inputs.yillar.map(y => y.puan);
  
  for (const p of puanlar) {
    if (p < 0 || p > 100) {
      throw new Error("Puanlar 0 ile 100 arasinda olmalidir.");
    }
  }

  // Mezuniyet puani (Diploma puani), yil sonu basari puanlarinin aritmetik ortalamasidir.
  const mezuniyetPuani = calculateAritmetikOrtalama(puanlar);

  let obpDegeri = 0;
  if (mezuniyetPuani >= 50) {
    obpDegeri = calculateObp(mezuniyetPuani).obp;
  } else {
    // 50'nin altindaki diploma notu icin de 50 uzerinden hesaplanir OSYM kuralinca, ama MEB liseden mezun etmez.
    obpDegeri = calculateObp(50).obp;
  }

  return {
    primaryResult: mezuniyetPuani.toFixed(4),
    secondaryResults: {
      "Hesaba Katılan Yıl Sayısı": puanlar.length.toString(),
      "Tahmini OBP (Ortaöğretim Başarı Puanı)": obpDegeri.toFixed(2)
    },
    notes: [
      "Lise mezuniyet puanı (diploma puanı), öğrencim süresince (9, 10, 11 ve 12. sınıflar) alınan yıl sonu başarı puanlarının aritmetik ortalamasıdır.",
      "Yükseköğretime geçişte kullanılan OBP, diploma puanınızın 5 ile çarpılmasıyla elde edilir (Maksimum 500).",
      "Mezun olabilmek için gerekli asgari şartlar bu hesaplayıcıda değerlendirilmemiştir."
    ]
  };
}
