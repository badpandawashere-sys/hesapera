export function calculateRealReturn(nominalRate: number, inflationRate: number) {
  // Real Return = ((1 + nominal) / (1 + inflation) - 1) * 100
  const n = nominalRate / 100;
  const i = inflationRate / 100;
  
  const realRate = ((1 + n) / (1 + i) - 1) * 100;
  
  return {
    primaryResult: '%' + realRate.toFixed(4),
    secondaryResults: {
      'Nominal Getiri': '%' + nominalRate,
      'Enflasyon Oranı': '%' + inflationRate
    },
    notes: ['Reel Getiri = ((1 + Nominal Getiri) / (1 + Enflasyon) - 1) formülü ile hesaplanmıştır.']
  };
}