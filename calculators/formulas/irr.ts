import { calculateDynamicIRR } from './finance/irr';
import { calculateDynamicNPV as npvDyn, DynamicCashFlow } from './finance/npv';

export function calculateIrr(cashFlows: DynamicCashFlow[]) {
  if (cashFlows.length < 2) {
    throw new Error('En az 2 nakit akışı girmelisiniz.');
  }
  
  const hasPositive = cashFlows.some(cf => cf.amount > 0);
  const hasNegative = cashFlows.some(cf => cf.amount < 0);
  if (!hasPositive || !hasNegative) {
    throw new Error('IRR hesaplanabilmesi için nakit akışlarında en az bir pozitif ve en az bir negatif tutar (yatırım vs.) bulunmalıdır.');
  }

  // Sort by period in case they entered out of order
  const sortedCashFlows = [...cashFlows].sort((a, b) => a.period - b.period);
  
  // Check duplicates
  const periods = sortedCashFlows.map(cf => cf.period);
  if (new Set(periods).size !== periods.length) {
    throw new Error('Aynı döneme ait birden fazla nakit akışı girilemez. Lütfen tutarları toplayıp tek dönemde girin.');
  }

  const irr = calculateDynamicIRR(sortedCashFlows);
  
  let totalPositive = 0;
  let initialInvestment = 0;
  sortedCashFlows.forEach(cf => {
    if (cf.amount > 0) totalPositive += cf.amount;
    if (cf.period === 0 && cf.amount < 0) initialInvestment = Math.abs(cf.amount);
  });
  
  // NPV at IRR should be very close to 0
  const npvAtIrr = npvDyn(irr, sortedCashFlows);

  return {
    primaryResult: '%' + (irr * 100).toFixed(4),
    secondaryResults: {
      'İlk Yatırım (Period 0)': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(initialInvestment),
      'Toplam Pozitif Nakit Akışı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalPositive),
      'Dönem Sayısı': cashFlows.length,
      'IRR ile Net Bugünkü Değer': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 6 }).format(npvAtIrr)
    },
    notes: ['Bulunan IRR, girilen nakit akışlarını sıfıra eşitleyen iskontolama oranıdır. Eğer nakit akışı işaretleri birden fazla kez değişiyorsa, birden fazla IRR sonucu olabileceği (Multiple IRR problemi) unutulmamalıdır.']
  };
}