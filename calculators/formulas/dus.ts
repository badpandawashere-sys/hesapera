import { calculateNet, validateExamInputs } from './exams/core';

// 2026-DUS Resmi Yapısı (ÖSYM Kılavuzu):
// Temel Bilimler: 80 soru
// Klinik Bilimler: 120 soru
// Toplam: 200 soru — 4 yanlış 1 doğruyu götürür.
// DUS Puanı = (Temel Ağırlık 0.40 * Temel Net) + (Klinik Ağırlık 0.60 * Klinik Net)
// Standart puana dönüşüm ÖSYM istatistiklerine bağlıdır.
export function calculateDus(temelC: number, temelW: number, klinikC: number, klinikW: number) {
  const TEMEL_MAX = 80;
  const KLINIK_MAX = 120;
  validateExamInputs(temelC, temelW, TEMEL_MAX - temelC - temelW, TEMEL_MAX);
  validateExamInputs(klinikC, klinikW, KLINIK_MAX - klinikC - klinikW, KLINIK_MAX);

  const temelNet = calculateNet(temelC, temelW, 0.25);
  const klinikNet = calculateNet(klinikC, klinikW, 0.25);
  
  // Ham puan: ağırlıklı net toplamı 200 üzerinden normalize
  const weightedNet = (temelNet * 0.40) + (klinikNet * 0.60);
  const maxPossibleWeighted = (TEMEL_MAX * 0.40) + (KLINIK_MAX * 0.60);
  const rawScore = (weightedNet / maxPossibleWeighted) * 100;

  return {
    primaryResult: rawScore.toFixed(3),
    secondaryResults: {
      'Temel Bilimler Net': temelNet.toFixed(2),
      'Klinik Bilimler Net': klinikNet.toFixed(2),
      'Ağırlıklı Net': weightedNet.toFixed(2)
    },
    notes: [
      '2026-DUS; Temel Bilimler (80 soru, ağırlık %40) ve Klinik Bilimler (120 soru, ağırlık %60) olmak üzere toplam 200 sorudan oluşmaktadır.',
      'Gösterilen puan, ağırlıklı ham puana dayalı tahmini değerdir. Gerçek DUS puanı ÖSYM istatistiksel standartlaştırması ile hesaplanır.'
    ]
  };
}