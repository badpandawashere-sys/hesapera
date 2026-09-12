import { calculateNet, validateExamInputs } from './exams/core';

export function calculateAles(sayC: number, sayW: number, sozC: number, sozW: number) {
  validateExamInputs(sayC, sayW, 50 - sayC - sayW, 50);
  validateExamInputs(sozC, sozW, 50 - sozC - sozW, 50);

  const sayNet = calculateNet(sayC, sayW, 0.25);
  const sozNet = calculateNet(sozC, sozW, 0.25);
  
  // ÖSYM standart puan tahmini yaklaşımı (Geçmiş yıl ortalamaları tabanlı)
  // Base Puan ~ 50
  const sayPuan = 50 + (sayNet * 0.75) + (sozNet * 0.25);
  const sozPuan = 50 + (sayNet * 0.25) + (sozNet * 0.75);
  const eaPuan = 50 + (sayNet * 0.5) + (sozNet * 0.5);

  return {
    primaryResult: eaPuan.toFixed(3),
    secondaryResults: {
      'ALES EA (Eşit Ağırlık)': eaPuan.toFixed(3),
      'ALES SAY (Sayısal)': sayPuan.toFixed(3),
      'ALES SÖZ (Sözel)': sozPuan.toFixed(3),
      'Sayısal Net': sayNet.toFixed(2),
      'Sözel Net': sozNet.toFixed(2)
    },
    notes: [
      'Yukarıdaki sonuçlar ÖSYM standartlarına göre "Yaklaşık Puan" değerleridir.',
      'Sınav zorluk derecesi ve aday standart sapmaları belli olmadığından gerçek sonuçlarda +/- 2 puan sapma görülebilir.'
    ]
  };
}