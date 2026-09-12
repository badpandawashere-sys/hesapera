// Okula Baslama Yasi Hesaplama
// Kaynak: MEB Ilkogretim Kurumlari Yonetmeligi (2026 Guncel Yas Kayit Kriterleri)
// Referans Tarihi: Egitim yilinin Eylul ayi sonu (30 Eylul).

export interface OkulaBaslamaYasiInput {
  dogumAy: number;
  dogumYil: number;
  egitimYili: number; // e.g. 2026 for 2026-2027 school year
}

export function calculateOkulaBaslamaYasi(inputs: OkulaBaslamaYasiInput) {
  const { dogumAy, dogumYil, egitimYili } = inputs;
  
  if (dogumAy < 1 || dogumAy > 12) throw new Error("Doğum ayı 1 ile 12 arasında olmalıdır.");
  if (dogumYil > egitimYili) throw new Error("Doğum yılı eğitim yılından büyük olamaz.");

  // Ay hesabi: Kayit yapilacak egitim yilinin Eylul ayi (9. ay) baz alinir.
  const referansAy = 9;
  
  let yasAyOlarak = (egitimYili - dogumYil) * 12 + (referansAy - dogumAy);

  if (yasAyOlarak < 0) throw new Error("Gelecekteki bir tarih için kayıt yaşı hesaplanamaz.");

  let sonuc = "";
  let aciklama = "";

  if (yasAyOlarak >= 72) {
    sonuc = "İlkokul 1. Sınıfa Kayıt Zorunlu";
    aciklama = "72 ay ve üzeri çocuklar için ilkokula kayıt zorunludur. Erteleme veya anaokuluna yönlendirme yapılamaz.";
  } else if (yasAyOlarak >= 69 && yasAyOlarak <= 71) {
    sonuc = "İlkokul 1. Sınıfa Kayıt Zorunlu (Erteleme Hakkı Var)";
    aciklama = "İlkokula kaydı zorunludur ancak veli dilekçesi (veya sağlık raporu) ile kaydı 1 yıl ertelenerek okul öncesi eğitime (anasınıfına) yönlendirilebilir.";
  } else if (yasAyOlarak >= 66 && yasAyOlarak <= 68) {
    sonuc = "Anaokuluna Kayıtlı (İsteğe Bağlı İlkokul)";
    aciklama = "Normal şartlarda anaokuluna yönlendirilir. Ancak velinin yazılı talebi ile ilkokul 1. sınıfa erken kayıt yaptırılabilir.";
  } else if (yasAyOlarak >= 57 && yasAyOlarak <= 65) {
    sonuc = "Okul Öncesi Eğitim (Anaokulu/Anasınıfı)";
    aciklama = "Çocuğunuz ilkokul için gerekli ayı doldurmamıştır. Anaokulu veya anasınıfına kayıt yaptırabilir.";
  } else {
    sonuc = "Okul Öncesi Kreş / Oyun Grubu";
    aciklama = "Çocuğunuz ilkokul veya zorunlu anasınıfı için yeterli aylık yaşta değildir.";
  }

  const yasYil = Math.floor(yasAyOlarak / 12);
  const yasKalanAy = yasAyOlarak % 12;

  return {
    primaryResult: sonuc,
    secondaryResults: {
      "Eylül Sonu İtibarıyla Yaşı": `${yasAyOlarak} Aylık (${yasYil} Yaş ${yasKalanAy} Ay)`,
      "Değerlendirilen Eğitim Yılı": `${egitimYili}-${egitimYili + 1}`
    },
    notes: [
      "Hesaplama, MEB İlköğretim Kurumları Yönetmeliği uyarınca eğitim yılının başladığı Eylül ayının sonu baz alınarak (ay üzerinden) yapılmıştır.",
      aciklama,
      "Bu araç mevzuata göre genel bir değerlendirme sunar; kesin kayıt işlemleri için okul yönetimi ve güncel MEB takvimini esas alınız."
    ]
  };
}
