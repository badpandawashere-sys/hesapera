export interface YumurtlamaDonemiInput {
  sonAdetTarihi: string;
  donguSuresi: number;
}

export function calculateYumurtlamaDonemi(inputs: YumurtlamaDonemiInput) {
  const { sonAdetTarihi, donguSuresi } = inputs;

  if (donguSuresi < 20 || donguSuresi > 45) {
    throw new Error("Lütfen 20 ile 45 gün arasında bir döngü süresi giriniz.");
  }

  // Use absolute UTC to avoid timezone/DST shifting issues
  const baseDate = new Date(`${sonAdetTarihi}T12:00:00Z`);
  if (isNaN(baseDate.getTime())) throw new Error("Geçersiz tarih formatı.");

  // Ovülasyon tahmini: Döngü süresinden 14 gün öncesi (Standart tıp kabulü)
  const lutealPhase = 14;
  const ovulationDaysAfterPeriod = donguSuresi - lutealPhase;

  const ovulationDate = new Date(baseDate.getTime() + ovulationDaysAfterPeriod * 24 * 60 * 60 * 1000);
  
  // Verimli dönem: Ovülasyondan 5 gün öncesi ile 1 gün sonrası (ACOG)
  const fertileStart = new Date(ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000);
  const fertileEnd = new Date(ovulationDate.getTime() + 1 * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  };

  return {
    primaryResult: formatDate(ovulationDate),
    secondaryResults: {
      "Tahmini Ovülasyon": formatDate(ovulationDate),
      "Verimli Dönem Başlangıcı": formatDate(fertileStart),
      "Verimli Dönem Bitişi": formatDate(fertileEnd)
    },
    notes: [
      "Bu hesaplama, standart takvim yöntemine ve luteal fazın ortalama 14 gün sürdüğü varsayımına dayanmaktadır (Kaynak: ACOG - American College of Obstetricians and Gynecologists).",
      "Çıkan sonuçlar yalnızca istatistiksel bir tahmindir. Düzensiz adet döngülerinde bu formülün doğruluğu düşüktür.",
      "DİKKAT: Bu araç kesin bir tıbbi teşhis sağlamaz ve gebelikten korunma (doğum kontrolü) amacıyla güvenilir bir yöntem olarak kullanılmamalıdır."
    ]
  };
}
