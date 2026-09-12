// PMYO Puan Hesaplama
// Kaynak: Polis Akademisi (PA) 2026 PMYO Giris Yonetmeligi
//
// Basvuru Sarti: TYT'den belirtilen taban puani (ornegin 250 ham puan) almak.
//
// Nihai Basari Puani (Degerlendirme):
// - TYT Puaninin %25'i
// - Fiziki Yeterlilik Puani (100 uzerinden, baraj 60) %25'i
// - Mulakat Puani (100 uzerinden, baraj 70) %50'si
//
// Toplam = Nihai PMYO Basari Puani. 
// Adaylar bu puana gore siralanir.

export interface PmyoResult {
  tytScore: number;
  fizikiScore: number;
  mulakatScore: number;
  nihaiScore: number;
  isBasarili: boolean;
  statusMessage: string;
}

export function calculatePmyo(
  tytScore: number,
  fizikiScore: number,
  mulakatScore: number
): PmyoResult {
  if (tytScore < 100 || tytScore > 500) throw new Error("TYT puani 100-500 araliginda olmalidir.");
  if (fizikiScore < 0 || fizikiScore > 100) throw new Error("Fiziki yeterlilik puani 0-100 araliginda olmalidir.");
  if (mulakatScore < 0 || mulakatScore > 100) throw new Error("Mulakat puani 0-100 araliginda olmalidir.");

  const nihaiScore = (tytScore * 0.25) + (fizikiScore * 0.25) + (mulakatScore * 0.50);
  
  let isBasarili = true;
  let statusMessage = "Basarili (Siralamaya Girebilir)";

  // Guncel kilavuza gore barajlar:
  if (fizikiScore < 60) {
    isBasarili = false;
    statusMessage = "Basarisiz (Fiziki yeterlilik baraji 60'in altinda)";
  } else if (mulakatScore < 70) {
    isBasarili = false;
    statusMessage = "Basarisiz (Mulakat baraji 70'in altinda)";
  }

  return {
    tytScore,
    fizikiScore,
    mulakatScore,
    nihaiScore,
    isBasarili,
    statusMessage
  };
}
