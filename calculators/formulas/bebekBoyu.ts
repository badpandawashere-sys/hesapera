export interface BebekBoyuInput {
  cinsiyet: 'Erkek' | 'Kız';
  anneBoyu: number;
  babaBoyu: number;
}

export function calculateBebekBoyu(inputs: BebekBoyuInput) {
  const { cinsiyet, anneBoyu, babaBoyu } = inputs;

  if (anneBoyu < 100 || anneBoyu > 220) throw new Error("Lütfen geçerli bir anne boyu (cm) giriniz.");
  if (babaBoyu < 100 || babaBoyu > 220) throw new Error("Lütfen geçerli bir baba boyu (cm) giriniz.");

  let hedefBoy = 0;

  // Mid-Parental Height (Genetik Hedef Boy) Formulü
  if (cinsiyet === 'Erkek') {
    hedefBoy = (anneBoyu + babaBoyu + 13) / 2;
  } else {
    hedefBoy = (anneBoyu + babaBoyu - 13) / 2;
  }

  // Range is usually +/- 5 cm to +/- 8.5 cm depending on the clinic. We'll show +/- 5 cm as a typical standard deviation bracket.
  const altSinir = hedefBoy - 5;
  const ustSinir = hedefBoy + 5;

  return {
    primaryResult: `${hedefBoy.toFixed(1)} cm`,
    secondaryResults: {
      "Beklenen Hedef Boy Aralığı": `${altSinir.toFixed(1)} cm - ${ustSinir.toFixed(1)} cm`,
      "Değerlendirilen Cinsiyet": cinsiyet
    },
    notes: [
      "Mid-Parental Height (Genetik Hedef Boy) yöntemi kullanılmıştır. Bu, ebeveynlerin boylarına dayanarak çocuğun yetişkinlikteki tahmini erişkin boyunu (hedef boy) hesaplayan yaygın bir pediatrik yaklaşımdır.",
      "Bu hesaplama kesin bir tıbbi sonuç veya garanti sunmaz. Çocukların büyümesi genetik potansiyelinin yanı sıra beslenme, çevre, kronik hastalıklar ve hormonal durumlardan etkilenir.",
      "Düzenli büyüme takibi ve kesin değerlendirme için çocuğunuzun gelişimini çocuk sağlığı ve hastalıkları uzmanı gözetiminde, resmi persentil eğrileri (WHO veya Sağlık Bakanlığı normları) üzerinden takip ediniz."
    ]
  };
}
