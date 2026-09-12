import { calculateNet, validateExamInputs } from './exams/core';

// 2026-HMGS — Hukuk Mesleklerine Giriş Sınavı (ÖSYM tarafından uygulanmaktadır)
// Resmi: 2026-HMGS/1 → 26 Nisan 2026; 2026-HMGS/2 → 27 Eylül 2026
// Kaynak: ÖSYM 2026-HMGS Kılavuzu (osym.gov.tr)
//
// Resmi sınav yapısı (ÖSYM kılavuzu esas alınmıştır):
//   Medeni Hukuk ve Borçlar Hukuku  : 40 soru
//   Ticaret Hukuku ve Usul Hukuku   : 40 soru
//   Toplam                          : 80 soru
// Her 4 yanlış 1 doğruyu götürür.
// Nihai HMGS puanı ÖSYM istatistiksel standartlaştırması ile belirlenir;
// aday grubu verileri olmadan kesin standart puan üretilemez.
export function calculateHmgs(
  medeniBorclarC: number, medeniBorclarW: number,
  ticaretUsulC: number, ticaretUsulW: number
) {
  const MEDENI_MAX = 40;
  const TICARET_MAX = 40;
  validateExamInputs(medeniBorclarC, medeniBorclarW, MEDENI_MAX - medeniBorclarC - medeniBorclarW, MEDENI_MAX);
  validateExamInputs(ticaretUsulC, ticaretUsulW, TICARET_MAX - ticaretUsulC - ticaretUsulW, TICARET_MAX);

  const medeniBorclarNet = calculateNet(medeniBorclarC, medeniBorclarW, 0.25);
  const ticaretUsulNet = calculateNet(ticaretUsulC, ticaretUsulW, 0.25);
  const totalNet = medeniBorclarNet + ticaretUsulNet;

  // Ham puan: toplam net 80 soruda normalize, base 50
  const rawScore = 50 + (totalNet / 80) * 50;

  return {
    primaryResult: rawScore.toFixed(3),
    secondaryResults: {
      'Medeni Hukuk ve Borçlar Net': medeniBorclarNet.toFixed(2),
      'Ticaret Hukuku ve Usul Net': ticaretUsulNet.toFixed(2),
      'Toplam Net': totalNet.toFixed(2)
    },
    notes: [
      '2026-HMGS (Hukuk Mesleklerine Giriş Sınavı), ÖSYM tarafından uygulanmaktadır. 2026-HMGS/1: 26 Nisan 2026, 2026-HMGS/2: 27 Eylül 2026 tarihlerinde gerçekleştirilmiştir.',
      'Sınav Medeni Hukuk ve Borçlar Hukuku (40 soru) ile Ticaret Hukuku ve Usul Hukuku (40 soru) olmak üzere toplam 80 sorudan oluşmaktadır. Her 4 yanlış 1 doğruyu götürmektedir.',
      'Gösterilen sonuç yaklaşık ham puan değeridir. Gerçek HMGS puanı ÖSYM istatistiksel standartlaştırmasıyla belirlenir ve resmi sınav sonucundan farklılık gösterebilir.'
    ]
  };
}