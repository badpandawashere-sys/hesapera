import { validateExamInputs } from './exams/core';

// KPSS — Kamu Personeli Seçme Sınavı (ÖSYM)
// Kaynak: ÖSYM 2026-KPSS Kılavuzu (osym.gov.tr)
//
// Tüm seviyeler için:
// GY 60 soru + GK 60 soru = 120 soru
// Her 4 yanlış 1 doğruyu götürür (negatif nete düşülebilir).
//
// Puan türleri ve ağırlıkları:
//   KPSSP3 (Lisans)       : GY %50, GK %50
//   KPSSP1 (Lisans)       : GY %70, GK %30
//   KPSSP93 (Önlisans)    : GY %50, GK %50
//   KPSSP94 (Ortaöğretim) : GY %50, GK %50
//
// ÖNEMLİ KURAL: Bir testten en az 1 ham puanı (neti) bulunmayan adayların KPSS puanı hesaplanmaz.
// Puanlama, standart sapma (S) ve dağılım ortalaması (X) gerektirdiğinden yalnızca net değerleri hesaplanır.

export type KpssLevel = 'lisans' | 'onlisans' | 'ortaogretim';
export type KpssScoreType = 'KPSSP1' | 'KPSSP3' | 'KPSSP93' | 'KPSSP94';

export function calculateKpss(
  level: KpssLevel,
  scoreTypeRaw: string,
  gyC: number, gyW: number,
  gkC: number, gkW: number
) {
  // Override score type based on level
  let scoreType: KpssScoreType = 'KPSSP3';
  if (level === 'lisans') {
    scoreType = scoreTypeRaw === 'KPSSP1' ? 'KPSSP1' : 'KPSSP3';
  } else if (level === 'onlisans') {
    scoreType = 'KPSSP93';
  } else if (level === 'ortaogretim') {
    scoreType = 'KPSSP94';
  }

  // All levels have 60/60
  const maxQ = 60;
  validateExamInputs(gyC, gyW, maxQ - gyC - gyW, maxQ);
  validateExamInputs(gkC, gkW, maxQ - gkC - gkW, maxQ);

  // Exact net calculation without negative clamping
  const gyNet = gyC - (gyW * 0.25);
  const gkNet = gkC - (gkW * 0.25);
  const totalNet = gyNet + gkNet;

  // Eligibility check
  const isEligible = gyNet >= 1 && gkNet >= 1;

  // Determine weights
  let gyWeight = 50;
  let gkWeight = 50;
  if (scoreType === 'KPSSP1') {
    gyWeight = 70;
    gkWeight = 30;
  }

  const levelLabels: Record<string, string> = {
    lisans: 'Lisans',
    onlisans: 'Önlisans',
    ortaogretim: 'Ortaöğretim'
  };

  const notes = [
    'KPSS (Kamu Personel Seçme Sınavı) ÖSYM tarafından uygulanmaktadır. Her 4 yanlış 1 doğruyu götürmektedir.',
    `${scoreType}: GY %${gyWeight} + GK %${gkWeight} ağırlığı test standart puanlarına (ASP) uygulanır.`,
    'KPSS puanı yalnız doğru ve yanlış sayılarından hesaplanmaz. ÖSYM, her testin ham puanlarını adayların ortalama ve standart sapmalarına göre standart puana dönüştürür; ardından ilgili puan türünün test ağırlıklarıyla Ağırlıklı Standart Puan (ASP) oluşturur. Nihai puan ASP dağılımının ortalama, standart sapma ve en yüksek değerine göre hesaplanır. Bu istatistikler bilinmeden kesin KPSS puanı hesaplanamaz.'
  ];

  if (!isEligible) {
    notes.push('DİKKAT: ÖSYM kurallarına göre Genel Yetenek ve Genel Kültür testlerinin her ikisinden de en az 1 ham puanı (net) bulunmayan adayların KPSS puanı hesaplanmaz.');
  }

  return {
    primaryResult: totalNet.toFixed(2), // Total Net
    secondaryResults: {
      'Genel Yetenek Neti': gyNet.toFixed(2),
      'Genel Kültür Neti': gkNet.toFixed(2),
      'Toplam Net': totalNet.toFixed(2),
      'Puan Türü': scoreType,
      'Eğitim Düzeyi': levelLabels[level],
      'GY Ağırlığı': '%' + gyWeight,
      'GK Ağırlığı': '%' + gkWeight,
      'Uygunluk': isEligible ? 'Uygun' : 'Geçersiz (Her testten en az 1 net kuralı)'
    },
    notes,
    isEligible,
    gyNet,
    gkNet
  };
}
