import { validateExamInputs } from './exams/core';

export function calculateAks(correct: number, wrong: number) {
  validateExamInputs(correct, wrong, 100 - correct - wrong, 100);

  // AKS'de genellikle yanlışlar doğruları götürmez. Her soru 1 puan.
  const score = correct;
  const status = score >= 60 ? 'Başarılı' : 'Başarısız';

  return {
    primaryResult: score.toFixed(2),
    secondaryResults: {
      'Değerlendirme': status,
      'Doğru Sayısı': correct.toString(),
      'Yanlış Sayısı': wrong.toString(),
      'Boş Sayısı': (100 - correct - wrong).toString()
    },
    notes: [
      'AKS (Adaylık Kaldırma Sınavı) değerlendirmelerinde yanlış cevaplar doğru cevapları etkilememektedir.',
      'Sınav 100 puan üzerinden değerlendirilir ve 60 ve üzerinde puan alan adaylar başarılı sayılır.'
    ]
  };
}