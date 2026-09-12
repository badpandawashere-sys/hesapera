export interface KreatinInput {
  kilo: number;
  yasGrup: 'Yetişkin' | '18 Yaş Altı';
  protokol: 'Yükleme (Loading)' | 'Koruma (Maintenance)';
}

export function calculateKreatinDozu(inputs: KreatinInput) {
  const { kilo, yasGrup, protokol } = inputs;

  if (kilo <= 30 || kilo > 250) throw new Error("Lütfen geçerli bir vücut ağırlığı giriniz.");

  let sonucGram = 0;
  let formulyontemi = "";

  if (protokol === 'Yükleme (Loading)') {
    // ISSN: 0.3 g/kg for 5-7 days
    sonucGram = kilo * 0.3;
    formulyontemi = "0.3 g / kg / gün";
  } else {
    // ISSN: 3-5 g fixed or ~0.03 g/kg. We will output standard 5g for simplicity and mention body weight dependency if heavy.
    // Let's use body weight specific: 0.03 - 0.05 g/kg but 3-5g is standard. We'll show a fixed standard 3-5g unless weight is very high, but let's just stick to the 0.05 g/kg or fixed.
    sonucGram = Math.max(3, Math.min(5, kilo * 0.05)); // roughly 3-5g
    // Actually, ISSN says 3-5 g/day for maintenance, or 0.03-0.05 for larger athletes.
    // Let's just output "3 - 5 gram" for maintenance as standard.
  }

  let warning = "";
  if (yasGrup === '18 Yaş Altı') {
    warning = "DİKKAT: Bu hesaplama çocuklar ve ergenler için doz önerisi DEĞİLDİR. 18 yaş altındakilerin kreatin kullanımı tıbbi uzmanlık gerektirir.";
  }

  const resultStr = protokol === 'Koruma (Maintenance)' 
    ? (kilo > 100 ? "5 - 8 gram/gün" : "3 - 5 gram/gün") 
    : `${sonucGram.toFixed(1)} gram/gün`;

  const protokolMetni = protokol === 'Yükleme (Loading)' ? "5-7 gün boyunca yükleme" : "Sürekli günlük koruma";

  return {
    primaryResult: resultStr,
    secondaryResults: {
      "Protokol Tipi": protokolMetni,
      "Hesap Yöntemi": protokol === 'Yükleme (Loading)' ? formulyontemi : "Standart Günlük Doz (Vücut ağırlığına göre uyarlanmış)"
    },
    notes: [
      warning,
      "Hesaplama, Uluslararası Spor Beslenmesi Derneği (ISSN) kreatin takviyesi kılavuz referanslarına dayanır.",
      "Yükleme (loading) evresi şart değildir, ancak kas doyumuna daha hızlı (5-7 gün) ulaşmayı sağlar. Yükleme yapılmadan sadece koruma dozu kullanılarak da yaklaşık 3-4 haftada aynı kas doygunluğuna ulaşılabilir.",
      "Yükleme dozunun gün içinde 4 eşit parçaya bölünerek alınması tavsiye edilir.",
      "Bu hesaplama genel bilgilendirme amaçlıdır. Böbrek rahatsızlığı veya herhangi bir klinik durumu olan kişilerin kreatin kullanmadan önce mutlaka hekimlerine danışmaları gereklidir."
    ].filter(n => n !== "")
  };
}
