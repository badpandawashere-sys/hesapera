// Lise Ders Puani Hesaplama
// Kaynak: MEB Ortaogretim Kurumlari Yonetmeligi

import { calculateAritmetikOrtalama } from "./education/liseHelpers";

export interface LiseDersPuaniInput {
  notlar: { tur: string; not: number }[];
}

export function calculateLiseDersPuani(inputs: LiseDersPuaniInput) {
  if (!inputs.notlar || inputs.notlar.length === 0) {
    throw new Error("Lutfen en az bir not giriniz.");
  }

  const gecerliNotlar = inputs.notlar.map(n => n.not).filter(n => n >= 0 && n <= 100);
  
  if (gecerliNotlar.length === 0) {
    throw new Error("Gecerli bir not bulunamadi. Notlar 0 ile 100 arasinda olmalidir.");
  }

  const dersPuani = calculateAritmetikOrtalama(gecerliNotlar);
  const gecmeDurumu = dersPuani >= 50 ? "Başarılı" : "Başarısız";

  return {
    primaryResult: dersPuani.toFixed(2),
    secondaryResults: {
      "Hesaba Katılan Not Sayısı": gecerliNotlar.length.toString(),
      "Ders Başarı Durumu": gecmeDurumu
    },
    notes: [
      "MEB Ortaöğretim Kurumları Yönetmeliği gereği, bir dersin puanı; sınav, performans ve proje notlarının aritmetik ortalaması alınarak belirlenir.",
      "Lisede bir dersten başarılı sayılmak için ders puanının en az 50 olması gerekmektedir."
    ]
  };
}
