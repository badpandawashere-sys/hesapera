// POMEM Puan Hesaplama
// Kaynak: Polis Akademisi (PA) 2026 POMEM Giris Yonetmeligi
//
// Basvuru Sarti: KPSS P3 (Lisans) veya P93 (Onlisans) taban puani.
//
// Nihai Basari Puani (Degerlendirme):
// - KPSS Puaninin %25'i
// - Fiziki Yeterlilik Puani (100 uzerinden, baraj 60) %25'i
// - Mulakat Puani (100 uzerinden, baraj 70) %50'si
//
// Toplam = Nihai POMEM Basari Puani. Adaylar bu puana gore siralanir.

export interface PomemResult {
  kpssScore: number;
  fizikiScore: number;
  mulakatScore: number;
  nihaiScore: number;
  isBasarili: boolean;
  statusMessage: string;
}

export function calculatePomem(
  kpssScore: number,
  fizikiScore: number,
  mulakatScore: number
): PomemResult {
  if (kpssScore < 0 || kpssScore > 100) throw new Error("KPSS puani 0-100 araliginda olmalidir.");
  if (fizikiScore < 0 || fizikiScore > 100) throw new Error("Fiziki yeterlilik puani 0-100 araliginda olmalidir.");
  if (mulakatScore < 0 || mulakatScore > 100) throw new Error("Mulakat puani 0-100 araliginda olmalidir.");

  const nihaiScore = (kpssScore * 0.25) + (fizikiScore * 0.25) + (mulakatScore * 0.50);
  
  let isBasarili = true;
  let statusMessage = "Basarili (Siralamaya Girebilir)";

  if (fizikiScore < 60) {
    isBasarili = false;
    statusMessage = "Basarisiz (Fiziki yeterlilik baraji 60'in altinda)";
  } else if (mulakatScore < 70) {
    isBasarili = false;
    statusMessage = "Basarisiz (Mulakat baraji 70'in altinda)";
  }

  return {
    kpssScore,
    fizikiScore,
    mulakatScore,
    nihaiScore,
    isBasarili,
    statusMessage
  };
}
