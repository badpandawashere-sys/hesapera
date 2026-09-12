export interface IdealKiloInput {
  cinsiyet: 'Erkek' | 'Kadın';
  boy: number;
}

export function calculateIdealKilo(inputs: IdealKiloInput) {
  const { cinsiyet, boy } = inputs;

  // Devine formula is usually valid for adult heights above 152 cm (5 feet)
  // Let's allow slightly lower just in case, but restrict totally weird values
  if (boy <= 130 || boy > 250) throw new Error("Lütfen geçerli bir yetişkin boyu (cm) giriniz (130-250 cm arası).");

  // Devine Formülü (En yaygın klinik ideal kilo tahmini):
  // Erkek: 50.0 kg + 2.3 kg per inch over 5 feet
  // Kadın: 45.5 kg + 2.3 kg per inch over 5 feet
  // 5 feet = 60 inches = 152.4 cm

  const boyInches = boy / 2.54;
  const over5Feet = boyInches > 60 ? boyInches - 60 : 0; // If under 5 feet, base value applies or formula is an approximation

  let ideal = 0;
  if (cinsiyet === 'Erkek') {
    ideal = 50.0 + (2.3 * over5Feet);
  } else {
    ideal = 45.5 + (2.3 * over5Feet);
  }

  // Handle under 5 feet scenario smoothly to prevent flatlining
  if (boyInches < 60) {
    const under5Feet = 60 - boyInches;
    if (cinsiyet === 'Erkek') {
      ideal = 50.0 - (2.3 * under5Feet);
    } else {
      ideal = 45.5 - (2.3 * under5Feet);
    }
  }

  return {
    primaryResult: `${ideal.toFixed(1)} kg`,
    secondaryResults: {
      "Kullanılan Formül": "Devine Formülü (1974)",
      "Cinsiyet / Boy": `${cinsiyet} / ${boy} cm`
    },
    notes: [
      "'İdeal kilo' kavramı tıbbi olarak tek bir kesin rakam değildir. Sağlıklı vücut ağırlığı; yaşınıza, kas kütlenize (vücut kompozisyonu), kemik yapınıza ve genetiğinize göre geniş bir aralığı kapsar.",
      "Bu araç, tıp alanında ilaç dozajları hesaplanırken (klinik/ilaç dozlaması literatüründe) kullanılan tarihsel Devine (1974) matematiksel formülünü kullanır.",
      "Hesapera'da bu sonuç yalnızca tahmini bilgilendirme amaçlıdır. Bu değer tıbbi olarak tek doğru kilo DEĞİLDİR.",
      "Bu sonuç 18 yaş altı çocuklar veya ergenler için geçerli DEĞİLDİR.",
      "Obezite teşhisi veya zayıflama hedefi için mutlaka bir hekime veya diyetisyene başvurunuz."
    ]
  };
}
