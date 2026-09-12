import { validateExamInputs } from './exams/core';

// MEB Motorlu Taşıt Sürücü Kursu Teorik Sınavı (e-Sınav):
// Resmi: 50 soru, her doğru 2 puan, toplam 100 üzerinden değerlendirme.
// Geçme notu: 70 ve üzeri (Kaynak: MEB Sürücü Kursu Yönetmeliği).
// YANLIŞLAR DOĞRUYU GÖTÜRMEZ (birden fazla konuda ders bazlı sınır yoktur tek sınav uygulamasında).
export function calculateEhliyetSinavi(correct: number) {
  if (correct < 0 || correct > 50 || !Number.isInteger(correct)) {
    throw new Error('Doğru sayısı 0 ile 50 arasında tam sayı olmalıdır.');
  }
  
  const score = correct * 2; // Her doğru 2 puan
  const PASSING_SCORE = 70;
  const status = score >= PASSING_SCORE ? 'Başarılı ✓' : 'Başarısız ✗';

  return {
    primaryResult: score.toFixed(2),
    secondaryResults: {
      'Değerlendirme': status,
      'Doğru Sayısı': correct.toString(),
      'Yanlış / Boş': (50 - correct).toString(),
      'Geçme Puanı': PASSING_SCORE + ' / 100'
    },
    notes: [
      'MEB Motorlu Taşıt Sürücü Kursu teorik e-sınavı 50 sorulu olup her doğru yanıt 2 puan değerindedir.',
      'Yanlış cevaplar doğru cevapları etkilemez.',
      '70 ve üzeri puan alan adaylar başarılı sayılır. (Kaynak: MEB Sürücü Kursu Yönetmeliği)'
    ]
  };
}