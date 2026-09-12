import { getWhoMedianWeight } from '../data-providers/babyWeight';

export interface BebekKilosuInput {
  cinsiyet: 'Erkek' | 'Kız';
  yasAy: number;
  mevcutKilo: number;
}

export function calculateBebekKilosu(inputs: BebekKilosuInput) {
  const { cinsiyet, yasAy, mevcutKilo } = inputs;

  if (yasAy < 0 || yasAy > 24) throw new Error("Bu araç 0-24 ay arası bebekler içindir.");
  if (mevcutKilo <= 0 || mevcutKilo > 30) throw new Error("Geçersiz kilo değeri.");

  const median = getWhoMedianWeight(yasAy, cinsiyet);
  let farkMetni = "Referans tablosu dışı (24 aydan büyük)";

  if (median !== null) {
    const fark = mevcutKilo - median;
    if (Math.abs(fark) < 0.3) {
      farkMetni = "WHO medyan değerine çok yakın.";
    } else if (fark > 0) {
      farkMetni = `WHO medyan değerinin yaklaşık ${fark.toFixed(1)} kg üzerinde.`;
    } else {
      farkMetni = `WHO medyan değerinin yaklaşık ${Math.abs(fark).toFixed(1)} kg altında.`;
    }
  }

  return {
    primaryResult: `${mevcutKilo.toFixed(1)} kg`,
    secondaryResults: {
      "Bebeğin Yaşı": `${yasAy} Aylık`,
      "Değerlendirilen Cinsiyet": cinsiyet,
      "WHO Referans Medyanı (50. Persentil)": median !== null ? `${median.toFixed(1)} kg` : "Bilinmiyor"
    },
    notes: [
      farkMetni,
      "ÖNEMLİ: Gerçek WHO (Dünya Sağlık Örgütü) Çocuk Büyüme Standartları 50. Persentil (Medyan) verileri referans alınmıştır.",
      "Kilonun tam olarak medyan değerinde olması şart değildir. Normal gelişim geniş bir persentil aralığını kapsar (örneğin 3. ile 97. persentil arası).",
      "Bu araç kesin bir tıbbi teşhis koymaz. Referans karşılaştırması ve gelişim takibi için yaş/cinsiyet büyüme eğrileri kullanılarak doktor değerlendirmesi yapılmalıdır."
    ]
  };
}
