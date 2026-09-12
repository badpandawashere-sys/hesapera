export function calculateRatio(firstValue: number, secondValue: number) {
  const ratio = firstValue / secondValue;
  const percentage = ratio * 100;
  
  return {
    primaryResult: ratio,
    secondaryResults: {
      'Yüzde Karşılığı': '%' + percentage.toFixed(2).replace('.00', '')
    }
  };
}