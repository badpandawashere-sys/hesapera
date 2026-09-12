import { calculateDynamicNPV, DynamicCashFlow } from './finance/npv';

export function calculateNpv(discountRate: number, cashFlows: DynamicCashFlow[]) {
  if (cashFlows.length < 1) {
    throw new Error('En az 1 nakit akışı girmelisiniz.');
  }

  // Check duplicate periods
  const periods = cashFlows.map(cf => cf.period);
  if (new Set(periods).size !== periods.length) {
    throw new Error('Aynı döneme ait birden fazla nakit akışı girilemez.');
  }

  const npv = calculateDynamicNPV(discountRate / 100, cashFlows);
  
  let initial = 0;
  let totalPos = 0;
  let totalNeg = 0;
  cashFlows.forEach(cf => {
    if (cf.period === 0) initial += cf.amount;
    if (cf.amount > 0) totalPos += cf.amount;
    else if (cf.amount < 0) totalNeg += Math.abs(cf.amount);
  });

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(npv),
    secondaryResults: {
      'İskonto Oranı': '%' + discountRate,
      'Başlangıç Nakit Akışı (Dönem 0)': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(initial),
      'Toplam Pozitif Nakit Akışı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalPos),
      'Toplam Negatif Nakit Akışı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalNeg)
    },
    notes: ['NBD (NPV) formülü = Toplam [ CF_t / (1 + r)^t ] yöntemine göre hesaplanmaktadır. Eğer nakit akışı 0. dönemde gerçekleşiyorsa, iskonto uygulanmaz.']
  };
}