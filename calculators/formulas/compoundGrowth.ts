export function calculateCompoundGrowth(initialValue: number, growthRate: number, periods: number) {
  const r = growthRate / 100;
  const futureValue = initialValue * Math.pow(1 + r, periods);
  const totalGrowth = futureValue - initialValue;

  const table = [];
  let currentValue = initialValue;
  for (let i = 1; i <= periods; i++) {
    const start = currentValue;
    currentValue = currentValue * (1 + r);
    table.push({
      'Dönem': i,
      'Dönem Başı Değer': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(start),
      'Büyüme': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(currentValue - start),
      'Dönem Sonu Değer': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(currentValue)
    });
  }
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(futureValue),
    secondaryResults: {
      'Başlangıç Değeri': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(initialValue),
      'Büyüme Oranı': '%' + growthRate,
      'Dönem Sayısı': periods,
      'Toplam Büyüme': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(totalGrowth)
    },
    table
  };
}