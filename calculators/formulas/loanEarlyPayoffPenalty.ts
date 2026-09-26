export const HOUSING_EARLY_PAYMENT_CAP_UP_TO_36_MONTHS = 0.01;
export const HOUSING_EARLY_PAYMENT_CAP_OVER_36_MONTHS = 0.02;
export const HOUSING_TERM_THRESHOLD_MONTHS = 36;

export function calculateLoanEarlyPayoffPenalty(
  loanType: 'consumer' | 'housing',
  remainingPrincipal: number,
  remainingMonths: number,
  interestType?: 'fixed' | 'variable',
  hasCompensationClause?: boolean
) {
  let compensationRate = 0;
  let note = '';

  if (loanType === 'consumer') {
    compensationRate = 0;
    note = 'İhtiyaç/tüketici ve taşıt kredilerinde konut finansmanındaki erken ödeme tazminatı uygulanmaz. Tüketiciden erken kapama cezası talep edilemez.';
  } else if (loanType === 'housing') {
    if (interestType === 'variable') {
      compensationRate = 0;
      note = 'Değişken faizli konut finansmanında erken ödeme tazminatı talep edilemez.';
    } else if (interestType === 'fixed' && !hasCompensationClause) {
      compensationRate = 0;
      note = 'Sözleşmede açıkça erken ödeme tazminatı alınabileceğine dair hüküm yoksa bu tazminat uygulanamaz.';
    } else if (interestType === 'fixed' && hasCompensationClause) {
      if (remainingMonths <= HOUSING_TERM_THRESHOLD_MONTHS) {
        compensationRate = HOUSING_EARLY_PAYMENT_CAP_UP_TO_36_MONTHS;
      } else {
        compensationRate = HOUSING_EARLY_PAYMENT_CAP_OVER_36_MONTHS;
      }
      note = 'Bu değer 6502 sayılı Kanuna göre oran bazlı yasal üst sınırdır. Gerçek tazminat tutarı, erken ödeme sebebiyle tüketiciye yapılacak toplam indirim tutarını kesinlikle aşamaz.';
    }
  }

  const rateBasedMaximum = remainingPrincipal * compensationRate;
  const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

  return {
    primaryResult: formatter.format(rateBasedMaximum),
    primaryLabel: 'Oran Bazlı Azami Erken Ödeme Tazminatı',
    secondaryResults: {
      'Uygulanan Oran': '%' + (compensationRate * 100),
      'Kalan Anapara': formatter.format(remainingPrincipal),
      'Kalan Vade': `${remainingMonths} Ay`,
      'Kredi Türü': loanType === 'consumer' ? 'İhtiyaç Kredisi' : 'Konut Kredisi'
    },
    notes: [
      note,
      'ÖNEMLİ: Bu araç bankanızın bugün vereceği kesin kredi kapama tutarını hesaplamaz. Kesin kapama tutarına, kalan anaparaya ek olarak son ödemenizden kapama gününe kadar oluşan faiz ve yasal vergiler (BSMV/KKDF) dahil edilebilir.'
    ]
  };
}
