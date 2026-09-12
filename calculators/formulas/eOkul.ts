// E-Okul Not Hesaplama
// Kaynak: MEB Ortaogretim Kurumlari Yonetmeligi / Ilk ve Ortaokul Yonetmeligi (2026 Guncel)
// 
// MEB Guncel Kuralina gore (Lise ve Ortaokul):
// Ogrenecinin ders/donem puani; sinavlardan, performans calismasindan ve varsa projeden
// aldiklari puanlarin 'aritmetik ortalamasi' alinarak belirlenir.
// Ornek: 2 Sinav, 2 Performans, 1 Proje -> Hepsini topla 5'e bol. (Dogrudan aritmetik ortalama)
// Donem Ortalama = Sum(DersOrtalamasi * DersSaati) / Toplam Ders Saati

export interface EOkulDers {
  dersAdi?: string;
  haftalikSaat: number;
  sinav1?: number;
  sinav2?: number;
  performans1?: number;
  performans2?: number;
  proje?: number;
}

export function calculateEOkul(dersler: EOkulDers[], egitimSeviyesi: 'ilkogretim' | 'ortaogretim') {
  if (!dersler || dersler.length === 0) {
    throw new Error("Lutfen en az bir ders girin.");
  }

  let totalAgirlikliPuan = 0;
  let totalDersSaati = 0;
  const dersDetaylari: string[] = [];

  for (const ders of dersler) {
    if (!ders.haftalikSaat || ders.haftalikSaat <= 0) continue; // skip empty
    
    let notlar: number[] = [];
    if (ders.sinav1 !== undefined && ders.sinav1 >= 0) notlar.push(ders.sinav1);
    if (ders.sinav2 !== undefined && ders.sinav2 >= 0) notlar.push(ders.sinav2);
    if (ders.performans1 !== undefined && ders.performans1 >= 0) notlar.push(ders.performans1);
    if (ders.performans2 !== undefined && ders.performans2 >= 0) notlar.push(ders.performans2);
    if (ders.proje !== undefined && ders.proje >= 0) notlar.push(ders.proje);

    if (notlar.length === 0) continue;

    for (let n of notlar) {
      if (n > 100) throw new Error("Notlar 100'den buyuk olamaz.");
    }

    // MEB kurali: Sınav, performans ve proje puanlarının doğrudan aritmetik ortalamasi
    const dersOrtalamasi = notlar.reduce((a, b) => a + b, 0) / notlar.length;
    
    totalAgirlikliPuan += (dersOrtalamasi * ders.haftalikSaat);
    totalDersSaati += ders.haftalikSaat;

    dersDetaylari.push(`${ders.dersAdi || 'Ders'} Ortalamasi: ${dersOrtalamasi.toFixed(2)}`);
  }

  if (totalDersSaati === 0) {
    throw new Error("Gecerli hesaplanabilir bir not bulunamadi. Haftalik saati ve en az bir notu girilmis ders olmalidir.");
  }

  const donemOrtalamasi = totalAgirlikliPuan / totalDersSaati;

  let belge = "Belge Alamaz (Not Kriterlerine Gore)";
  if (donemOrtalamasi >= 85) belge = "Takdir Belgesi (Ozursez devamsizlik 5 gunu asmamasi ve tum derslerin >50 sarti vs vardir)";
  else if (donemOrtalamasi >= 70) belge = "Tesekkur Belgesi (Sartlari sagliyorsa)";

  return {
    primaryResult: donemOrtalamasi.toFixed(4), // E-Okul virgulden sonra 4 hane hesaplar
    secondaryResults: {
      "Toplam Ders Saati": totalDersSaati.toString(),
      "Tahmini Belge Durumu": belge
    },
    notes: [
      "2026 MEB Eğitim Kurumları Yönetmeliği esas alınarak; sınav, performans ve proje notlarının DOĞRUDAN aritmetik ortalamasıyla ders notu hesaplanmıştır.",
      "Dönem ağırlıklı ortalamanız (E-Okul Dönem Puanı), her dersin puanının haftalık ders saati ile çarpılıp toplam ders saatine bölünmesiyle bulunur.",
      "Belge alabilmek için gerekli olan devamsızlık ve alttan ders olmaması gibi şartlar bu hesaplamaya dahil değildir. Sonuçlar tahmini E-Okul verisidir."
    ]
  };
}
