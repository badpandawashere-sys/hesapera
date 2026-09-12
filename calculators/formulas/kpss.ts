import { calculateNet, validateExamInputs } from './exams/core';

// KPSS — Kamu Personeli Seçme Sınavı (ÖSYM)
// Kaynak: ÖSYM 2026-KPSS Kılavuzu (osym.gov.tr)
//
// KPSS Lisans: GY 60 soru + GK 60 soru = 120 soru
// KPSS Önlisans: GY 40 soru + GK 40 soru = 80 soru
// KPSS Ortaöğretim: GY 40 soru + GK 40 soru = 80 soru
// Her 4 yanlış 1 doğruyu götürür.
//
// Puan türleri (Lisans için):
//   KPSSP1 = GY ağırlığı: %30, GK ağırlığı: %70  (örnek: teknik kadro)
//   KPSSP3 = GY ağırlığı: %50, GK ağırlığı: %50  (örnek: genel idare)
//
// NOT: ÖSYM standardizasyon puanı aday grubu istatistiklerine bağlıdır.
// Burada yaklaşık ağırlıklı ham puan hesaplanmaktadır.

const STRUCTURE = {
  lisans:       { gy: 60, gk: 60 },
  onlisans:     { gy: 40, gk: 40 },
  ortaogretim:  { gy: 40, gk: 40 }
};

type Level = 'lisans' | 'onlisans' | 'ortaogretim';
type ScoreType = 'KPSSP1' | 'KPSSP3';

const WEIGHTS: Record<ScoreType, { gy: number; gk: number }> = {
  KPSSP1: { gy: 0.30, gk: 0.70 },
  KPSSP3: { gy: 0.50, gk: 0.50 }
};

export function calculateKpss(
  level: Level,
  scoreType: ScoreType,
  gyC: number, gyW: number,
  gkC: number, gkW: number
) {
  const struct = STRUCTURE[level];
  validateExamInputs(gyC, gyW, struct.gy - gyC - gyW, struct.gy);
  validateExamInputs(gkC, gkW, struct.gk - gkC - gkW, struct.gk);

  const gyNet = calculateNet(gyC, gyW, 0.25);
  const gkNet = calculateNet(gkC, gkW, 0.25);

  const w = WEIGHTS[scoreType];
  // Normalize each test net to 0-1, apply weights
  const weightedNorm = (gyNet / struct.gy) * w.gy + (gkNet / struct.gk) * w.gk;
  const rawScore = 50 + weightedNorm * 50;

  const levelLabels: Record<string, string> = {
    lisans: 'Lisans',
    onlisans: 'Önlisans',
    ortaogretim: 'Ortaöğretim'
  };

  return {
    primaryResult: rawScore.toFixed(3),
    secondaryResults: {
      'Genel Yetenek Net': gyNet.toFixed(2) + ' / ' + struct.gy,
      'Genel Kültür Net': gkNet.toFixed(2) + ' / ' + struct.gk,
      'Puan Türü': scoreType,
      'Eğitim Düzeyi': levelLabels[level],
      'GY Ağırlığı': '%' + (w.gy * 100),
      'GK Ağırlığı': '%' + (w.gk * 100)
    },
    notes: [
      'KPSS (Kamu Personeli Seçme Sınavı) ÖSYM tarafından uygulanmaktadır. Her 4 yanlış 1 doğruyu götürmektedir.',
      scoreType === 'KPSSP1'
        ? 'KPSSP1: GY %30 + GK %70 ağırlığı uygulanmıştır.'
        : 'KPSSP3: GY %50 + GK %50 ağırlığı uygulanmıştır.',
      'Gösterilen puan yaklaşık ağırlıklı ham puan değeridir. Gerçek KPSS puanı ÖSYM istatistiksel standartlaştırması ile hesaplanır.'
    ]
  };
}