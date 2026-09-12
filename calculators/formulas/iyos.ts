import { calculateNet, validateExamInputs } from './exams/core';

// 2026-İYÖS — İdari Yargı Ön Sınavı (ÖSYM)
// Resmi: 2026-İYÖS → 27 Eylül 2026 tarihinde uygulanacaktır
// Kaynak: ÖSYM 2026-İYÖS Kılavuzu (osym.gov.tr)
// Sınav yapısı (resmi kılavuz): 
//   Genel Yetenek: 50 soru
//   Hukuk (Anayasa, İdare, İdari Yargılama Usulü): 50 soru
//   Toplam: 100 soru — Her 4 yanlış 1 doğruyu götürür.
// Nihai puan ÖSYM istatistiksel standartlaştırmasına bağlıdır.
export function calculateIyos(
  gyC: number, gyW: number,
  hukukC: number, hukukW: number
) {
  const GY_MAX = 50;
  const HUKUK_MAX = 50;
  validateExamInputs(gyC, gyW, GY_MAX - gyC - gyW, GY_MAX);
  validateExamInputs(hukukC, hukukW, HUKUK_MAX - hukukC - hukukW, HUKUK_MAX);

  const gyNet = calculateNet(gyC, gyW, 0.25);
  const hukukNet = calculateNet(hukukC, hukukW, 0.25);
  const totalNet = gyNet + hukukNet;

  // Ham puan: base 50 + normalize
  const rawScore = 50 + (totalNet / 100) * 50;

  return {
    primaryResult: rawScore.toFixed(3),
    secondaryResults: {
      'Genel Yetenek Net': gyNet.toFixed(2),
      'Hukuk Net': hukukNet.toFixed(2),
      'Toplam Net': totalNet.toFixed(2)
    },
    notes: [
      '2026-İYÖS (İdari Yargı Ön Sınavı), ÖSYM tarafından 27 Eylül 2026 tarihinde uygulanacaktır. Genel Yetenek (50 soru) + Hukuk (50 soru) = 100 soru. Her 4 yanlış 1 doğruyu götürmektedir.',
      'Gösterilen puan yaklaşık ham puan değeridir. Gerçek İYÖS puanı ÖSYM istatistiksel standartlaştırması ile hesaplanır ve resmi sonuçtan farklılık gösterebilir.'
    ]
  };
}