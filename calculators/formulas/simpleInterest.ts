import { computeSimpleInterest } from './interest/core';

export function calculateSimpleInterest(principal: number, annualRate: number, termYears: number) {
  const interest = computeSimpleInterest(principal, annualRate, termYears);
  const totalAmount = principal + interest;
  
  const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

  return {
    primaryResult: formatter.format(totalAmount),
    secondaryResults: {
      'Anapara': formatter.format(principal),
      'Faiz Tutarı': formatter.format(interest),
      'Yıllık Faiz Oranı': '%' + annualRate,
      'Vade': termYears + ' Yıl'
    },
    notes: [
      "Formül: I = P × r × t (Basit Faiz)",
      "Basit faizde kazanç sadece anapara üzerinden hesaplanır. Önceki dönemlerde kazanılan faiz, anaparaya eklenerek tekrar faiz getirisi sağlamaz (Bileşik faizden temel farkı budur)."
    ]
  };
}