import { calculateNet, validateExamInputs } from './exams/core';

// 2026-EUS — Eczacılıkta Uzmanlık Eğitimi Giriş Sınavı (ÖSYM tarafından uygulanmaktadır)
// Resmi: 2026-EUS → 7 Kasım 2026 tarihinde uygulanacaktır
// Kaynak: ÖSYM 2026-EUS Kılavuzu (osym.gov.tr)
// Resmi yapı: Temel Eczacılık (60 soru) + Klinik/Uygulamalı Eczacılık (60 soru) = 120 soru
// Her 4 yanlış 1 doğruyu götürür. Standart puan ÖSYM istatistiksel standartlaştırmasına dayanır.
export function calculateEus(
  temelC: number, temelW: number,
  klinikC: number, klinikW: number
) {
  const TEMEL_MAX = 60;
  const KLINIK_MAX = 60;
  validateExamInputs(temelC, temelW, TEMEL_MAX - temelC - temelW, TEMEL_MAX);
  validateExamInputs(klinikC, klinikW, KLINIK_MAX - klinikC - klinikW, KLINIK_MAX);

  const temelNet = calculateNet(temelC, temelW, 0.25);
  const klinikNet = calculateNet(klinikC, klinikW, 0.25);
  
  // Ağırlıklı ham puan (Temel:%50, Klinik:%50 — eşit ağırlık)
  const weightedNet = (temelNet + klinikNet);
  const rawScore = 50 + (weightedNet / 120) * 50;

  return {
    primaryResult: rawScore.toFixed(3),
    secondaryResults: {
      'Temel Eczacılık Net': temelNet.toFixed(2),
      'Klinik/Uygulamalı Net': klinikNet.toFixed(2),
      'Toplam Net': weightedNet.toFixed(2)
    },
    notes: [
      '2026-EUS (Eczacılıkta Uzmanlık Eğitimi Giriş Sınavı), ÖSYM tarafından 7 Kasım 2026 tarihinde uygulanacaktır. Temel Eczacılık (60 soru) + Klinik/Uygulamalı Eczacılık (60 soru) = 120 soru formatındadır. Her 4 yanlış 1 doğruyu götürmektedir.',
      'Gösterilen puan yaklaşık değerdir. Gerçek EUS puanı ÖSYM istatistiksel standartlaştırması ile belirlenmekte olup resmi sonuç farklılık gösterebilir.'
    ]
  };
}