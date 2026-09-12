export function calculateIncrease(originalValue: number, increasePercentage: number) {
  const increaseAmount = originalValue * increasePercentage / 100;
  const finalValue = originalValue + increaseAmount;
  
  return {
    primaryResult: finalValue,
    secondaryResults: {
      'Zam Tutarı': increaseAmount,
      'Eski Tutar': originalValue,
      'Zam Oranı': '%' + increasePercentage
    }
  };
}