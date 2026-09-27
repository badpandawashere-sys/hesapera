import { validateExamInputs } from './exams/core';

export const EKPSS_GY_QUESTION_COUNT = 30;
export const EKPSS_GK_QUESTION_COUNT = 30;
export const EKPSS_WRONG_ANSWER_PENALTY = 4;

function calculateEkpssNet(correct: number, wrong: number): number {
  return correct - (wrong / EKPSS_WRONG_ANSWER_PENALTY);
}

export function calculateEkpss(
  educationLevel: 'secondary' | 'associate' | 'bachelor',
  gyC: number, gyW: number,
  gkC: number, gkW: number
) {
  validateExamInputs(gyC, gyW, EKPSS_GY_QUESTION_COUNT - gyC - gyW, EKPSS_GY_QUESTION_COUNT);
  validateExamInputs(gkC, gkW, EKPSS_GK_QUESTION_COUNT - gkC - gkW, EKPSS_GK_QUESTION_COUNT);

  const gyNet = calculateEkpssNet(gyC, gyW);
  const gkNet = calculateEkpssNet(gkC, gkW);
  const totalNet = gyNet + gkNet;

  const educationLabels: Record<string, string> = {
    secondary: 'Ortaöğretim',
    associate: 'Ön Lisans',
    bachelor: 'Lisans'
  };

  const scoreTypeMapping: Record<string, string> = {
    secondary: 'EKPSSP1',
    associate: 'EKPSSP2',
    bachelor: 'EKPSSP3'
  };

  const formatter = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return {
    primaryResult: formatter.format(totalNet) + ' Net',
    primaryLabel: 'Toplam Net',
    secondaryResults: {
      'Genel Yetenek Neti': formatter.format(gyNet),
      'Genel Kültür Neti': formatter.format(gkNet),
      'Puan Türü': scoreTypeMapping[educationLevel],
      'Öğrenim Düzeyi': educationLabels[educationLevel]
    },
    notes: [
      'EKPSS değerlendirmesi 60 soru (30 Genel Yetenek, 30 Genel Kültür) üzerinden yapılır. Her test için 4 yanlış 1 doğruyu götürür.',
      'ÖNEMLİ BİLGİLENDİRME: Kesin EKPSS puanı, o yıl sınava giren tüm adayların net ortalamaları ve standart sapmaları kullanılarak bağıl değerlendirme sistemiyle hesaplanır. İlgili istatistikler açıklanmadan salt doğrular ve yanlışlarla kesin puan matematiksel olarak hesaplanamaz.'
    ]
  };
}
