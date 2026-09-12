import { computeCompoundInterest } from './interest/core';

export function calculateCompoundInterest(principal: number, annualRate: number, termYears: number, compoundingFrequency: string) {
  const n = parseInt(compoundingFrequency, 10);
  const interest = computeCompoundInterest(principal, annualRate, termYears, n);
  const A = principal + interest;
  
  const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

  let frequencyLabel = 'Yıllık (1)';
  if (n === 2) frequencyLabel = '6 Aylık (2)';
  else if (n === 4) frequencyLabel = '3 Aylık (4)';
  else if (n === 12) frequencyLabel = 'Aylık (12)';
  else if (n === 365) frequencyLabel = 'Günlük (365)';

  return {
    primaryResult: formatter.format(A),
    secondaryResults: {
      'Anapara': formatter.format(principal),
      'Kazanılan Faiz': formatter.format(interest),
      'Yıllık Faiz Oranı': '%' + annualRate,
      'Vade': termYears + ' Yıl',
      'Bileşikleşme (n)': frequencyLabel
    },
    notes: [
      "Formül: A = P × (1 + r/n)^(n×t)",
      "Bileşik faizde kazanılan faiz anaparaya eklenir ve sonraki dönemde elde edilen toplam tutar üzerinden yeniden faiz hesaplanır. Bu 'faizin faizi' etkisi yaratır."
    ]
  };
}