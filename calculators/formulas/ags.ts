import { calculateNet, validateExamInputs } from './exams/core';

export function calculateAgs(gkgyC: number, gkgyW: number, ebC: number, ebW: number) {
  validateExamInputs(gkgyC, gkgyW, 40 - gkgyC - gkgyW, 40);
  validateExamInputs(ebC, ebW, 40 - ebC - ebW, 40);

  const gkgyNet = calculateNet(gkgyC, gkgyW, 0.25);
  const ebNet = calculateNet(ebC, ebW, 0.25);
  
  const totalNet = gkgyNet + ebNet;
  
  // ÖSYM standart sapma verileri olmadan kesin sonuç üretilemez.
  // Yaklaşık puan formülü: Base 40 + (GKGY Net * 0.75) + (EB Net * 0.75) -> 80 Net = 100 Puan.
  const estimatedScore = 40 + (gkgyNet * 0.75) + (ebNet * 0.75);

  return {
    primaryResult: estimatedScore.toFixed(3),
    secondaryResults: {
      'Toplam Net': totalNet.toFixed(2),
      'GKGY Net': gkgyNet.toFixed(2),
      'Eğitim Bilimleri Net': ebNet.toFixed(2)
    },
    notes: [
      'MEB-AGS (Akademi Giriş Sınavı) hesaplaması tahmini değerlerdir.',
      'ÖSYM resmi sonuçları, o yılki adayların Türkiye geneli standart sapma ve ortalamalarına göre hesaplandığı için bu sonuçla birebir aynı olmayabilir.',
      '4 yanlış 1 doğruyu götürmektedir kuralı uygulanmıştır.'
    ]
  };
}