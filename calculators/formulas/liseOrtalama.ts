// Lise Ortalama Hesaplama (Donem / Yil Sonu Agirlikli Ortalama)
// Kaynak: MEB Ortaogretim Kurumlari Yonetmeligi

import { calculateAgirlikliOrtalama } from "./education/liseHelpers";

export interface LiseOrtalamaInput {
  dersler: { dersAdi?: string; puan: number; saat: number }[];
}

export function calculateLiseOrtalama(inputs: LiseOrtalamaInput) {
  if (!inputs.dersler || inputs.dersler.length === 0) {
    throw new Error("Lutfen en az bir ders giriniz.");
  }

  const dersler = inputs.dersler.map(d => ({ puan: d.puan, saat: d.saat }));

  for (const d of dersler) {
    if (d.puan < 0 || d.puan > 100) throw new Error("Ders puani 0 ile 100 arasinda olmalidir.");
    if (d.saat < 0) throw new Error("Ders saati negatif olamaz.");
  }

  const { ortalama, toplamSaat } = calculateAgirlikliOrtalama(dersler);

  if (toplamSaat === 0) {
    throw new Error("Gecerli hesaplanabilir saat/kredi bulunamadi.");
  }

  let belge = "Belge Alamaz";
  if (ortalama >= 85) belge = "Takdir Belgesi (Devamsızlık ve zayıf şartı yoksa)";
  else if (ortalama >= 70) belge = "Teşekkür Belgesi (Devamsızlık ve zayıf şartı yoksa)";

  return {
    primaryResult: ortalama.toFixed(4),
    secondaryResults: {
      "Toplam Ders Saati": toplamSaat.toString(),
      "Tahmini Belge Durumu": belge
    },
    notes: [
      "Dönem veya yıl sonu ağırlıklı ortalamanız; her dersin başarı puanının, o dersin haftalık ders saati ile çarpılıp toplam ders saatine bölünmesiyle hesaplanır.",
      "Lisede Takdir/Teşekkür belgesi alabilmek için özürsüz devamsızlığın 5 günü aşmaması ve tüm ders puanlarının en az 50 olması gerekmektedir."
    ]
  };
}
