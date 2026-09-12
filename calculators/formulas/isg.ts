import { calculateNet, validateExamInputs } from './exams/core';

// İSG Uzmanlık Sınavı — Çalışma ve Sosyal Güvenlik Bakanlığı (ÇSGB)
// Kaynak: 6331 sayılı İş Sağlığı ve Güvenliği Kanunu ve
//         İSG Uzman ve İşyeri Hekimlerinin Görev, Yetki, Sorumluluk ve Eğitimleri
//         Hakkında Yönetmelik (Resmi Gazete: 29.12.2012 / 28512)
// Sınav yapısı: 100 soru, her 3 yanlış 1 doğruyu götürür.
// Geçme notu: C ve B sınıfı için 70, A sınıfı için 75.
// Sınıf A: En yüksek tehlikeli işyeri (min 75 puan geçer)
// Sınıf B: Tehlikeli işyeri (min 70 puan)
// Sınıf C: Az tehlikeli işyeri (min 70 puan)
export function calculateIsg(
  correct: number,
  wrong: number,
  examClass: 'A' | 'B' | 'C'
) {
  const MAX_QUESTIONS = 100;
  validateExamInputs(correct, wrong, MAX_QUESTIONS - correct - wrong, MAX_QUESTIONS);

  // İSG: 3 yanlış 1 doğruyu götürür
  const net = Math.max(0, correct - wrong / 3);
  const score = parseFloat(net.toFixed(3));

  const passingScores: Record<string, number> = { A: 75, B: 70, C: 70 };
  const passing = passingScores[examClass];
  const status = score >= passing ? 'Başarılı ✓' : 'Başarısız ✗';

  return {
    primaryResult: score.toFixed(3),
    secondaryResults: {
      'Net Puan': score.toFixed(3),
      'Doğru Sayısı': correct.toString(),
      'Yanlış Sayısı': wrong.toString(),
      'Boş Sayısı': (MAX_QUESTIONS - correct - wrong).toString(),
      'Sınıf': 'Sınıf ' + examClass,
      'Başarı Eşiği': passing + ' / 100',
      'Değerlendirme': status
    },
    notes: [
      'İSG Uzmanlık Sınavı ÇSGB tarafından düzenlenmektedir. 100 soruluk sınavda her 3 yanlış 1 doğruyu götürmektedir.',
      'Başarı eşiği: Sınıf A için 75, Sınıf B ve C için 70 puandır.',
      'Kaynak: 6331 sayılı İSG Kanunu ve ilgili Yönetmelik (Resmi Gazete 29.12.2012/28512)'
    ]
  };
}