import { calculateNet, validateExamInputs } from './exams/core';

export function calculateDgs(sayC: number, sayW: number, sozC: number, sozW: number, obp: number) {
  validateExamInputs(sayC, sayW, 50 - sayC - sayW, 50);
  validateExamInputs(sozC, sozW, 50 - sozC - sozW, 50);
  
  if (obp < 40 || obp > 80) {
    throw new Error('ÖBP (Önlisans Başarı Puanı) 40 ile 80 arasında olmalıdır.');
  }

  const sayNet = calculateNet(sayC, sayW, 0.25);
  const sozNet = calculateNet(sozC, sozW, 0.25);
  
  // ÖSYM DGS Standart Sapma Yaklaşımı
  const obpContribution = obp * 0.6;
  const basePoint = 105; 
  
  // DGS Sayısal katsayılar (Örnek ortalamalara göre)
  const saySay = sayNet * 3.15;
  const saySoz = sozNet * 0.55;
  
  // DGS Sözel
  const sozSay = sayNet * 0.55;
  const sozSoz = sozNet * 3.15;
  
  // DGS EA
  const eaSay = sayNet * 1.85;
  const eaSoz = sozNet * 1.85;

  const dgsSay = basePoint + saySay + saySoz + obpContribution;
  const dgsSoz = basePoint + sozSay + sozSoz + obpContribution;
  const dgsEa = basePoint + eaSay + eaSoz + obpContribution;

  return {
    primaryResult: dgsEa.toFixed(3),
    secondaryResults: {
      'DGS EA': dgsEa.toFixed(3),
      'DGS SAY': dgsSay.toFixed(3),
      'DGS SÖZ': dgsSoz.toFixed(3),
      'ÖBP Katkısı': '+' + obpContribution.toFixed(1),
      'Sayısal Net': sayNet.toFixed(2),
      'Sözel Net': sozNet.toFixed(2)
    },
    notes: [
      'ÖSYM 2026 kılavuzu gereği, testlerin birinden bile 1 ham puan (net) almayan adayların puanı hesaplanmamaktadır.',
      'Gösterilen puanlar geçmiş yıl standart sapmaları kullanılarak üretilmiş tahmini (örnek) standartlaştırma puanlarıdır. Gerçek sınav sonucunuz standart sapmaya göre değişebilir.'
    ]
  };
}