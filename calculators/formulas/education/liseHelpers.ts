// MEB Ortaogretim Kurumlari Yonetmeligi Ortak Fonksiyonlari (2026)

export function calculateAritmetikOrtalama(notlar: number[]): number {
  const gecerliNotlar = notlar.filter(n => n >= 0 && n <= 100);
  if (gecerliNotlar.length === 0) return 0;
  const toplam = gecerliNotlar.reduce((a, b) => a + b, 0);
  return toplam / gecerliNotlar.length;
}

export function calculateAgirlikliOrtalama(dersler: { puan: number, saat: number }[]): { ortalama: number, toplamSaat: number } {
  let toplamPuan = 0;
  let toplamSaat = 0;
  
  for (const ders of dersler) {
    if (ders.saat <= 0) continue;
    toplamPuan += ders.puan * ders.saat;
    toplamSaat += ders.saat;
  }
  
  if (toplamSaat === 0) return { ortalama: 0, toplamSaat: 0 };
  
  return {
    ortalama: toplamPuan / toplamSaat,
    toplamSaat
  };
}
