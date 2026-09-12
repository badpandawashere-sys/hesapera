import { calculateNet, validateExamInputs } from './exams/core';

// Hâkim ve Savcı Yardımcılığı Yazılı Sınavı (Adalet Bakanlığı)
// Kaynak: Adalet Bakanlığı sınav ilanları / ÖSYM kılavuzu
// Resmi yapı: Genel Yetenek (40 soru) + Hukuk Testi (60 soru) = 100 soru.
// Her 4 yanlış 1 doğruyu götürür.
// Hukuk testi: Anayasa Hukuku, Medenî Hukuk, Borçlar Hukuku, Ticaret Hukuku,
//              Ceza Hukuku, İdare Hukuku, Usul Hukuku konularını kapsar.
// ÖNEMLİ: Test ağırlıkları (GY vs Hukuk) resmi kılavuzda net olarak açıklanmamıştır.
// Bu hesaplamada test ağırlıkları kullanılmadan toplam ham net üzerinden yaklaşık
// bir değerlendirme yapılmaktadır. Resmi puan tablosu için Adalet Bakanlığı kılavuzuna bakın.
export function calculateHakimSavciYardimciligi(
  gyC: number, gyW: number,
  hukukC: number, hukukW: number
) {
  validateExamInputs(gyC, gyW, 40 - gyC - gyW, 40);
  validateExamInputs(hukukC, hukukW, 60 - hukukC - hukukW, 60);

  const gyNet = calculateNet(gyC, gyW, 0.25);
  const hukukNet = calculateNet(hukukC, hukukW, 0.25);

  // Toplam ham net üzerinden yaklaşık puan (ağırlık uygulanmamıştır — resmi kaynak doğrulanamadı)
  const totalNet = gyNet + hukukNet;
  const rawScore = 50 + (totalNet / 100) * 50;

  return {
    primaryResult: rawScore.toFixed(3),
    secondaryResults: {
      'Genel Yetenek Net': gyNet.toFixed(2),
      'Hukuk Net': hukukNet.toFixed(2),
      'Toplam Net': totalNet.toFixed(2)
    },
    notes: [
      'Hâkim ve Savcı Yardımcılığı Yazılı Sınavı Adalet Bakanlığı tarafından düzenlenmektedir. Genel Yetenek (40 soru) + Hukuk (60 soru) = 100 soru formatında uygulanmakta; 4 yanlış 1 doğruyu götürmektedir.',
      'Test bazlı resmi ağırlık katsayıları Adalet Bakanlığı kılavuzundan doğrulanamadığından bu hesaplamada ağırlık uygulanmamıştır. Puan yaklaşık ham değerdir.',
      'Nihai yerleştirme ve mülakata çağırma sıralaması Adalet Bakanlığı kılavuzunda belirlenen koşullara bağlıdır. Kesin bilgi için resmi kılavuzu inceleyiniz.'
    ]
  };
}