import { calculateNet, validateExamInputs } from './exams/core';

// 2026-DİB-MBSTS: 29 Mart 2026, ÖSYM tarafından uygulandı.
// Resmi kılavuza göre: 100 soru, 4 yanlış 1 doğruyu götürür.
// Ham puan = Net / MaxNet * 100
export function calculateDibMbsts(correct: number, wrong: number) {
  const MAX_QUESTIONS = 100;
  validateExamInputs(correct, wrong, MAX_QUESTIONS - correct - wrong, MAX_QUESTIONS);
  
  const net = calculateNet(correct, wrong, 0.25);
  // Ham puan 100 üzerinden
  const rawScore = (net / MAX_QUESTIONS) * 100;

  return {
    primaryResult: rawScore.toFixed(3),
    secondaryResults: {
      'Net': net.toFixed(2),
      'Doğru Sayısı': correct.toString(),
      'Yanlış Sayısı': wrong.toString(),
      'Boş Sayısı': (MAX_QUESTIONS - correct - wrong).toString()
    },
    notes: [
      '2026-DİB-MBSTS, ÖSYM tarafından 29 Mart 2026 tarihinde uygulanmıştır.',
      'Resmi kılavuza göre 100 soruluk sınavda 4 yanlış 1 doğruyu götürmektedir.',
      'Gösterilen puan ham puana dayalıdır. Nihai yerleştirme puanı ÖSYM istatistiksel standartlaştırması ile değişebilir.'
    ]
  };
}