// Lise Sinif Gecme Hesaplama
// Kaynak: MEB Ortaogretim Kurumlari Yonetmeligi Madde 57 & 58 (2026 Guncel)

import { calculateAgirlikliOrtalama } from "./education/liseHelpers";

export interface LiseSinifGecmeInput {
  ozursuzDevamsizlik: number;
  toplamDevamsizlik: number;
  altSinifBasarisizDersSayisi: number;
  dersler: { dersAdi?: string; puan: number; saat: number; isBaraj: boolean }[];
}

export function calculateLiseSinifGecme(inputs: LiseSinifGecmeInput) {
  if (inputs.ozursuzDevamsizlik < 0 || inputs.toplamDevamsizlik < 0 || inputs.altSinifBasarisizDersSayisi < 0) {
    throw new Error("Devamsizlik sureleri ve başarısız ders sayısı negatif olamaz.");
  }
  
  if (inputs.ozursuzDevamsizlik > inputs.toplamDevamsizlik) {
    throw new Error("Özürsüz devamsızlık toplam devamsızlıktan büyük olamaz.");
  }

  if (!inputs.dersler || inputs.dersler.length === 0) {
    throw new Error("Lutfen en az bir ders giriniz.");
  }

  const { ortalama, toplamSaat } = calculateAgirlikliOrtalama(inputs.dersler);

  if (toplamSaat === 0) {
    throw new Error("Toplam ders saati sifir olamaz.");
  }

  let aktifBasarisizDersSayisi = 0;
  let barajDersiBasarisizMi = false;

  for (const d of inputs.dersler) {
    if (d.puan < 0 || d.puan > 100) throw new Error("Ders puani 0 ile 100 arasinda olmalidir.");
    if (d.puan < 50) {
      aktifBasarisizDersSayisi++;
      if (d.isBaraj) barajDersiBasarisizMi = true;
    }
  }

  const toplamBasarisizDersSayisi = aktifBasarisizDersSayisi + inputs.altSinifBasarisizDersSayisi;

  let sonuc = "";
  let gecmeTuru = "";

  // 1. Devamsizlik Kontrolu (Ozurzuz > 10 veya Toplam > 30 sinif tekrari)
  if (inputs.ozursuzDevamsizlik > 10 || inputs.toplamDevamsizlik > 30) {
    sonuc = "Sınıf Tekrarı";
    gecmeTuru = "Devamsızlık sınırını aştınız.";
  } else {
    // 2. Basarisizlik Toplam Kontrolu (Alt siniflar dahil)
    if (toplamBasarisizDersSayisi > 6) {
      sonuc = "Sınıf Tekrarı";
      gecmeTuru = "Alt sınıflar dâhil toplam başarısız (sorumlu) ders sayınız 6'dan fazla olduğu için sınıf tekrarı yaparsınız.";
    } 
    // 3. Aktif Yil Basarisiz Ders Kontrolu (Eger YBP 50'den kucukse)
    else if (ortalama < 50 && aktifBasarisizDersSayisi > 3) {
      sonuc = "Sınıf Tekrarı";
      gecmeTuru = "Yıl sonu başarı puanınız 50'nin altında ve başarısız olduğunuz ders sayısı 3'ten fazla (4 veya daha fazla).";
    } 
    // 4. Gecme Senaryolari
    else {
      if (ortalama >= 50) {
        if (aktifBasarisizDersSayisi === 0) {
          sonuc = "Doğrudan Geçti";
          gecmeTuru = "Tüm derslerinizden başarılı oldunuz ve doğrudan sınıfı geçtiniz.";
        } else if (aktifBasarisizDersSayisi === 1) {
          if (barajDersiBasarisizMi) {
            sonuc = "Sorumlu Geçti";
            gecmeTuru = "Yıl sonu başarı puanınız en az 50 ve sadece 1 dersten başarısızsınız, ancak bu ders baraj dersi olduğu için sorumlu geçersiniz.";
          } else {
            sonuc = "Doğrudan Geçti";
            gecmeTuru = "Yıl sonu başarı puanınız en az 50 ve başarısız ders sayınız 1 olduğu için baraj dersi olmaması kaydıyla doğrudan sınıf geçersiniz.";
          }
        } else {
          // ortalama >= 50 ama basarisiz ders > 1
          sonuc = "Sorumlu Geçti";
          if (barajDersiBasarisizMi) {
            gecmeTuru = "Yıl sonu başarı puanınız en az 50 ancak birden fazla dersten başarısızsınız. Baraj dersinden de başarısızsınız, sorumlu geçersiniz.";
          } else {
            gecmeTuru = "Yıl sonu başarı puanınız en az 50 ancak birden fazla (2 veya 3) dersten başarısız olduğunuz için sorumlu geçersiniz.";
          }
        }
      } else {
        // ortalama < 50
        // Biz yukarida "aktifBasarisizDersSayisi > 3" sartini eledik. Demek ki <= 3
        sonuc = "Sorumlu Geçti";
        gecmeTuru = "Yıl sonu başarı puanınız 50'nin altında ancak bir sınıfta başarısız ders sayınız en fazla 3 ders olduğu için sorumlu olarak sınıf geçersiniz.";
      }
    }
  }

  return {
    primaryResult: sonuc,
    secondaryResults: {
      "Yıl Sonu Başarı Puanı (YBP)": ortalama.toFixed(4),
      "Bu Yılki Başarısız Ders Sayısı": aktifBasarisizDersSayisi.toString(),
      "Alt Sınıflardan Kalan Başarısız Ders": inputs.altSinifBasarisizDersSayisi.toString(),
      "Toplam Başarısız Ders Sayısı": toplamBasarisizDersSayisi.toString(),
      "Detaylı Durum": gecmeTuru
    },
    notes: [
      "Kaynak: MEB Ortaöğretim Kurumları Yönetmeliği (2026).",
      "Doğrudan sınıf geçme şartı: Tüm derslerden başarılı olmak veya YBP'si en az 50 olup başarısız dersi bulunmamak veya en fazla 1 dersi zayıf olmaktır (baraj dersi hariç).",
      "Sorumlu sınıf geçme şartı: YBP 50'nin altında iken en fazla 3 dersten zayıf getirmektir.",
      "Alt sınıflar dâhil sorumlu olduğu ders sayısı toplam 6'dan fazla olan öğrenciler veya o yıl içinde 4 ve daha fazla zayıfı olup YBP'si 50'nin altında olanlar Sınıf Tekrarı yaparlar."
    ]
  };
}
