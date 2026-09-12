export interface VkiInput {
  boy: number;
  kilo: number;
}

export function calculateVki(inputs: VkiInput) {
  const { boy, kilo } = inputs;

  if (boy < 50 || boy > 250) throw new Error("Lütfen geçerli bir boy (50-250 cm) giriniz.");
  if (kilo < 20 || kilo > 400) throw new Error("Lütfen geçerli bir kilo (20-400 kg) giriniz.");

  const boyM = boy / 100;
  const vki = kilo / (boyM * boyM);
  const formattedVki = vki.toFixed(2);

  let sinif = "";
  let statusColor = "green";
  let statusMessage = "Sağlıklı bir aralıktasınız!";

  if (vki < 18.5) {
    sinif = "Zayıf";
    statusColor = "blue";
    statusMessage = "İdeal kilonuzun altındasınız.";
  } else if (vki < 24.9) {
    sinif = "Normal";
    statusColor = "green";
    statusMessage = "Sağlıklı bir aralıktasınız!";
  } else if (vki < 29.9) {
    sinif = "Fazla Kilolu";
    statusColor = "yellow";
    statusMessage = "İdeal kilonuzun üzerindesiniz.";
  } else if (vki < 34.9) {
    sinif = "Obez";
    statusColor = "orange";
    statusMessage = "Obezite risk grubundasınız.";
  } else {
    sinif = "Şiddetli Obez";
    statusColor = "red";
    statusMessage = "Yüksek obezite risk grubundasınız.";
  }

  // Calculate ideal weight range (BMI 18.5 - 24.9)
  const minIdeal = (18.5 * boyM * boyM).toFixed(1);
  const maxIdeal = (24.9 * boyM * boyM).toFixed(1);

  return {
    primaryLabel: "Vücut Kitle Endeksi (VKİ)",
    primaryResult: formattedVki,
    secondaryResults: {
      "Sınıflandırma": sinif,
      "Referans": "Dünya Sağlık Örgütü (WHO)"
    },
    breakdown: [
      { label: "Kilo", value: `${kilo} kg` },
      { label: "Boy", value: `${boy} cm` },
      { label: "VKİ", value: formattedVki },
      { label: "Kategori", value: sinif },
      { label: "İdeal Kilo Aralığı", value: `${minIdeal} - ${maxIdeal} kg` }
    ],
    categoryIndicator: {
      currentValue: vki,
      statusMessage: statusMessage,
      statusColor: statusColor,
      ranges: [
        { label: "Zayıf", max: 18.5, color: "blue" },
        { label: "Normal", min: 18.5, max: 24.9, color: "green" },
        { label: "Fazla Kilolu", min: 25, max: 29.9, color: "yellow" },
        { label: "Obez", min: 30, max: 34.9, color: "orange" },
        { label: "Şiddetli Obez", min: 35, color: "red" }
      ]
    },
    infoReference: {
      title: "Vücut Kitle Endeksi Nedir?",
      description: "Vücut kitle endeksi (VKİ), boy ve kilo değerleri kullanılarak hesaplanan ve vücut ağırlığının boya oranını gösteren bir değerdir. Yetişkinlerde genel sağlık durumunu değerlendirmede kullanılan pratik bir yöntemdir."
    },
    notes: [
      "Vücut Kitle Endeksi (VKI), Dünya Sağlık Örgütü'nün (WHO) yetişkinler için belirlediği standart formüle (kg/m²) göre hesaplanmıştır.",
      "VKI genel bir tarama ölçüsüdür; vücut yağ oranını doğrudan ölçmez. Kas kütlesi yüksek sporcularda veya yaşlılarda yanıltıcı olabilir.",
      "Bu hesaplama 18 yaş ve üzeri yetişkinler içindir. Çocuklar ve ergenler için WHO büyüme eğrileri (persentil) kullanılmalıdır.",
      "Bu değer tek başına tıbbi değerlendirme veya kesin bir sağlık teşhisi DEĞİLDİR."
    ]
  };
}
