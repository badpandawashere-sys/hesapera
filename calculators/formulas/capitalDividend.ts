export function calculateCapitalDividend(capital: number, sharesCount: number, calculationType: 'by_rate' | 'by_amount', dividendRate: number, dividendAmount: number) {
  const nominalValuePerShare = capital / sharesCount;
  
  let totalDividend = 0;
  let computedDividendRate = 0;

  if (calculationType === 'by_rate') {
    totalDividend = capital * (dividendRate / 100);
    computedDividendRate = dividendRate;
  } else {
    totalDividend = dividendAmount;
    computedDividendRate = (dividendAmount / capital) * 100;
  }

  const dividendPerShare = totalDividend / sharesCount;

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(dividendPerShare) + ' / Hisse',
    secondaryResults: {
      'Toplam Temettü Dağıtımı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalDividend),
      'Temettü Oranı': '%' + computedDividendRate.toFixed(4),
      'Hisse Başına Nominal Değer': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(nominalValuePerShare),
      'Toplam Sermaye': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(capital),
      'Hisse Adedi': new Intl.NumberFormat('tr-TR').format(sharesCount)
    },
    notes: ['Hisse Başına Nominal Değer = Toplam Sermaye / Toplam Hisse Adedi. Temettü oranı dağıtılacak toplam sermayeye oranlanarak hesaplanmıştır.']
  };
}