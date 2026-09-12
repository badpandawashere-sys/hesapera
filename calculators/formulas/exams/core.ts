export function calculateNet(correct: number, wrong: number, penaltyRatio = 0.25): number {
  const net = correct - (wrong * penaltyRatio);
  return net > 0 ? net : 0;
}

export function validateExamInputs(correct: number, wrong: number, blank: number, maxQuestions: number) {
  if (correct < 0 || wrong < 0 || blank < 0) {
    throw new Error('Doğru, yanlış veya boş soru sayısı negatif olamaz.');
  }
  if (!Number.isInteger(correct) || !Number.isInteger(wrong) || !Number.isInteger(blank)) {
    throw new Error('Soru sayıları tam sayı olmalıdır.');
  }
  const total = correct + wrong + blank;
  if (total > maxQuestions) {
    throw new Error(`Toplam soru sayısı (${total}), sınavın maksimum soru sayısını (${maxQuestions}) aşamaz.`);
  }
}
export function calculateWeightedScore(
  nets: number[],
  weights: number[],
  maxNets: number[],
  baseScore = 50
): number {
  if (nets.length !== weights.length || nets.length !== maxNets.length) {
    throw new Error('Parametre dizileri eşit uzunlukta olmalıdır.');
  }
  const totalMax = maxNets.reduce((a, b) => a + b, 0);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let weighted = 0;
  for (let i = 0; i < nets.length; i++) {
    weighted += (nets[i] / maxNets[i]) * (weights[i] / totalWeight);
  }
  return baseScore + (weighted * (100 - baseScore));
}