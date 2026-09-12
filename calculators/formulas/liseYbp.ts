// Lise Yil Sonu Basari Puani (YBP) Hesaplama
// Kaynak: MEB Ortaogretim Kurumlari Yonetmeligi

import { calculateAgirlikliOrtalama } from "./education/liseHelpers";

export interface LiseYbpInput {
  dersler: { dersAdi?: string; puan: number; saat: number }[];
}

export function calculateLiseYbp(inputs: LiseYbpInput) {
  if (!inputs.dersler || inputs.dersler.length === 0) {
    throw new Error("Lutfen en az bir ders giriniz.");
  }

  for (const d of inputs.dersler) {
    if (d.puan < 0 || d.puan > 100) throw new Error("Ders puani 0 ile 100 arasinda olmalidir.");
    if (d.saat <= 0) throw new Error("Ders saati sifirdan buyuk olmalidir.");
  }

  const { ortalama, toplamSaat } = calculateAgirlikliOrtalama(inputs.dersler);

  if (toplamSaat === 0) {
    throw new Error("Toplam ders saati sifir olamaz.");
  }

  return {
    primaryResult: ortalama.toFixed(4),
    secondaryResults: {
      "Toplam Ders Saati": toplamSaat.toString(),
      "Girilen Ders Sayısı": inputs.dersler.length.toString()
    },
    notes: [
      "Lise Yıl Sonu Başarı Puanı (YBP); MEB yönetmeliği gereği, öğrencinin her bir dersten aldığı başarı puanının, o dersin haftalık ders saati ile çarpılıp toplam haftalık ders saatine bölünmesiyle elde edilen ağırlıklı ortalamadır.",
      "Lise Ortalama Hesaplama (ID 77) ve YBP mantığı matematiksel olarak aynı ağırlıklı ortalama formülünü (Σ(Puan × Saat) / Σ(Saat)) kullanmaktadır."
    ]
  };
}
