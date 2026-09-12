import { calculateNet, validateExamInputs } from './exams/core';

// 2026-EKPSS (19 Nisan 2026, ÖSYM)
// Resmi yapı: Genel Yetenek 40 soru + Genel Kültür 40 soru = 80 soru toplam.
// Her 4 yanlış 1 doğruyu götürür.
// Standart puan eğitim düzeyine göre ÖSYM tablosuyla hesaplanır.
// Aday grubu istatistiği olmadan kesin standart puan hesaplanamaz.
export function calculateEkpss(
  educationLevel: 'ortaogretim' | 'onlisans' | 'lisans',
  gyC: number, gyW: number,
  gkC: number, gkW: number
) {
  const MAX = 40;
  validateExamInputs(gyC, gyW, MAX - gyC - gyW, MAX);
  validateExamInputs(gkC, gkW, MAX - gkC - gkW, MAX);

  const gyNet = calculateNet(gyC, gyW, 0.25);
  const gkNet = calculateNet(gkC, gkW, 0.25);
  const totalNet = gyNet + gkNet;

  // ÖSYM ham puan: toplam net üzerinden 80 soruda normalize, base 50
  const rawScore = 50 + (totalNet / 80) * 50;

  const educationLabels: Record<string, string> = {
    ortaogretim: 'Ortaöğretim',
    onlisans: 'Önlisans',
    lisans: 'Lisans'
  };

  return {
    primaryResult: rawScore.toFixed(3),
    secondaryResults: {
      'Genel Yetenek Net': gyNet.toFixed(2),
      'Genel Kültür Net': gkNet.toFixed(2),
      'Toplam Net': totalNet.toFixed(2),
      'Eğitim Düzeyi': educationLabels[educationLevel]
    },
    notes: [
      '2026-EKPSS, ÖSYM tarafından 19 Nisan 2026 tarihinde uygulanmıştır. (Genel Yetenek: 40 soru + Genel Kültür: 40 soru, 4 yanlış 1 doğruyu götürür.)',
      'Gösterilen puan yaklaşık ham puan değeridir. Gerçek EKPSS puanı ÖSYM istatistiksel standartlaştırması ile hesaplanır ve eğitim düzeyine göre farklılaşır.'
    ]
  };
}