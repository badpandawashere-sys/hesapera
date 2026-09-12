export interface AltinOranInput {
  uzunKenar: number;
  kisaKenar: number;
}

export function calculateAltinOran(inputs: AltinOranInput) {
  const { uzunKenar, kisaKenar } = inputs;

  if (uzunKenar <= 0 || kisaKenar <= 0) {
    throw new Error("Uzunluk değerleri sıfırdan büyük olmalıdır.");
  }
  if (kisaKenar > uzunKenar) {
    throw new Error("Kısa kenar değeri, uzun kenar değerinden büyük olamaz.");
  }

  const ratio = uzunKenar / kisaKenar;
  const PHI = (1 + Math.sqrt(5)) / 2; // ~1.618033988749895
  
  const difference = Math.abs(ratio - PHI);
  const diffPercent = (difference / PHI) * 100;

  let yakinlikDurumu = "";
  if (diffPercent <= 1) yakinlikDurumu = "Altın orana kusursuz uyum (Mükemmel)";
  else if (diffPercent <= 5) yakinlikDurumu = "Altın orana çok yakın (İyi)";
  else if (diffPercent <= 15) yakinlikDurumu = "Altın orana uzak (Kabul edilebilir)";
  else yakinlikDurumu = "Altın orana uyumlu değil";

  return {
    primaryResult: ratio.toFixed(4),
    secondaryResults: {
      "Altın Oran (φ) Sabiti": PHI.toFixed(4),
      "Hesaplanan Oran": ratio.toFixed(4),
      "Uyumluluk": yakinlikDurumu
    },
    notes: [
      "Altın oran (φ / Phi), matematikte (1 + √5) / 2 formülüyle ifade edilen ve yaklaşık 1.618 değerine denk gelen irrasyonel bir sabittir.",
      "Bu hesaplayıcı, girdiğiniz uzun ve kısa kenar değerlerini birbirine bölerek oranın altın orana ne kadar yakın olduğunu test eder."
    ]
  };
}
