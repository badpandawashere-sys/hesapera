// Takdir / Tesekkur Belgesi Hesaplama
// Kaynak: MEB Ortaogretim Kurumlari Yonetmeligi Madde 160 (Lise) ve Ilkogretim Yonetmeligi

export interface TakdirTesekkurInput {
  egitimSeviyesi: 'Ortaokul' | 'Lise';
  donemOrtalamasi: number;
  basarisizDersVarMi: boolean;
  ozursuzDevamsizlik: number;
  disiplinCezasiVarMi: boolean;
  turkceDersiNotu?: number; // Sadece Ortaokul icin, default 100 kabul edilebilir.
}

export function calculateTakdirTesekkur(inputs: TakdirTesekkurInput) {
  const { egitimSeviyesi, donemOrtalamasi, basarisizDersVarMi, ozursuzDevamsizlik, disiplinCezasiVarMi, turkceDersiNotu = 100 } = inputs;

  if (donemOrtalamasi < 0 || donemOrtalamasi > 100) throw new Error("Dönem ortalaması 0-100 arasında olmalıdır.");
  if (ozursuzDevamsizlik < 0) throw new Error("Devamsızlık süresi negatif olamaz.");
  if (turkceDersiNotu < 0 || turkceDersiNotu > 100) throw new Error("Türkçe notu 0-100 arasında olmalıdır.");

  let sonuc = "";
  let aciklama = "";

  // 1. Ortak Engel Durumlar (Basarisiz ders, disiplin cezasi)
  if (basarisizDersVarMi) {
    sonuc = "Belge Alamaz";
    aciklama = "Zayıf (başarısız) dersiniz bulunduğu için ortalamanız yüksek olsa dahi belge alamazsınız.";
  } else if (disiplinCezasiVarMi) {
    sonuc = "Belge Alamaz";
    aciklama = "Disiplin cezası aldığınız (veya kınama gibi durumlar olduğu) için yönetmelik gereği takdir veya teşekkür belgesi alamazsınız.";
  } 
  // 2. Lise Devamsizlik Engeli (Lisede 5 gun ozursuz devamsizlik asilirsa belge verilmez)
  else if (egitimSeviyesi === 'Lise' && ozursuzDevamsizlik > 5) {
    sonuc = "Belge Alamaz";
    aciklama = "Lise yönetmeliğine göre özürsüz devamsızlığınız 5 günü aştığı için belge alamazsınız.";
  } 
  // 3. Ortaokul Turkce Dersi Engeli (Turkce 55'in altindaysa belge alinamaz)
  else if (egitimSeviyesi === 'Ortaokul' && turkceDersiNotu < 55) {
    sonuc = "Belge Alamaz";
    aciklama = "Ortaokulda Türkçe dersi notu 55.00'in altında olan öğrenciler takdir veya teşekkür belgesi alamazlar.";
  } 
  // 4. Puan Kontrolu
  else {
    if (donemOrtalamasi >= 85.00) {
      sonuc = "Takdir Belgesi";
      aciklama = "Tüm koşulları sağladınız ve dönem ortalamanız 85.00'in üzerinde olduğu için Takdir Belgesi almaya hak kazandınız.";
    } else if (donemOrtalamasi >= 70.00) {
      sonuc = "Teşekkür Belgesi";
      aciklama = "Tüm koşulları sağladınız ve dönem ortalamanız 70.00 ile 84.99 arasında olduğu için Teşekkür Belgesi almaya hak kazandınız.";
    } else {
      sonuc = "Belge Alamaz";
      aciklama = "Ortalamanız 70.00'in altında olduğu için (tüm dersleri geçseniz dahi) belge koşulunu sağlayamadınız.";
    }
  }

  return {
    primaryResult: sonuc,
    secondaryResults: {
      "Eğitim Seviyesi": egitimSeviyesi,
      "Dönem Ortalaması": donemOrtalamasi.toFixed(2),
      "Değerlendirme Nedeni": aciklama
    },
    notes: [
      "Lise düzeyi: MEB Ortaöğretim Kurumları Yönetmeliği (özürsüz devamsızlık 5 gün sınırı vb. kurallar).",
      "Ortaokul düzeyi: MEB İlköğretim Kurumları Yönetmeliği (Türkçe 55 barajı vb. kurallar)."
    ]
  };
}
