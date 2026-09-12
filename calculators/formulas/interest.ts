import { computeSimpleInterest, computeCompoundInterest, normalizeTermToYears } from './interest/core';

export function calculateInterest(
  calculationType: 'simple' | 'compound',
  principal: number,
  annualRate: number,
  term: number,
  termUnit: 'month' | 'year',
  compoundingFrequency?: string
) {
  if (isNaN(principal) || isNaN(annualRate) || isNaN(term) || !isFinite(principal) || !isFinite(annualRate) || !isFinite(term) || principal <= 0 || term <= 0 || annualRate < 0) {
    throw new Error('Geçersiz sayısal değerler (NaN veya Infinity) veya negatif değerler girildi.');
  }

  const termYears = normalizeTermToYears(term, termUnit);
  let interest = 0;
  let freqLabel = '-';
  
  if (calculationType === 'simple') {
    interest = computeSimpleInterest(principal, annualRate, termYears);
  } else {
    const freq = parseInt(compoundingFrequency || '12', 10);
    interest = computeCompoundInterest(principal, annualRate, termYears, freq);
    
    if (freq === 1) freqLabel = 'Yıllık';
    else if (freq === 2) freqLabel = '6 Aylık';
    else if (freq === 4) freqLabel = '3 Aylık';
    else if (freq === 12) freqLabel = 'Aylık';
    else if (freq === 365) freqLabel = 'Günlük';
  }

  const totalAmount = principal + interest;
  const typeLabel = calculationType === 'simple' ? 'Basit Faiz' : 'Bileşik Faiz';
  const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  const termLabel = `${term} ${termUnit === 'month' ? 'Ay' : 'Yıl'}`;

  const secondaryResults: Record<string, string> = {
    'Ana Para': formatCurrency(principal),
    'Faiz Oranı': `%${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(annualRate)}`,
    'Süre': termLabel,
    'Faiz Tutarı': formatCurrency(interest),
    'Faiz Türü': typeLabel
  };

  if (calculationType === 'compound') {
    secondaryResults['Bileşikleşme Sıklığı'] = freqLabel;
  }

  return {
    primaryLabel: 'Toplam Tutar',
    primaryResult: formatCurrency(totalAmount),
    secondaryResults,
    breakdown: [
      { label: 'Ana Para', value: formatCurrency(principal) },
      { label: 'Faiz Tutarı', value: formatCurrency(interest) },
      { label: 'Toplam Tutar', value: formatCurrency(totalAmount) }
    ],
    infoReference: {
      title: "Hesaplama Hakkında",
      description: `Bu araç saf matematiksel ${typeLabel.toLowerCase()} hesabı yapar. Girmiş olduğunuz %${annualRate} oranı güncel banka faiz oranı değil, kullanıcı tarafından belirlenmiş orandır.${calculationType === 'compound' && freqLabel === 'Günlük' ? ' Günlük bileşikleşme için yıl 365 gün kabul edilmiştir.' : ''}`
    }
  };
}
