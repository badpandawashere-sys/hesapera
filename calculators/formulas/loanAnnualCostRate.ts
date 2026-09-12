import { calculateIRR } from './finance/irr';

export function calculateLoanAnnualCostRate(principalReceived: number, monthlyPayment: number, termMonths: number, upfrontFees: number) {
  const netReceived = principalReceived - upfrontFees;
  
  if (netReceived <= 0) {
    return {
      success: false,
      errors: ['Net kullanılan tutar (Elinize geçen - Peşin masraf) 0 dan büyük olmalıdır.']
    };
  }
  
  const cashFlows: number[] = [netReceived];
  for (let i = 0; i < termMonths; i++) {
    cashFlows.push(-monthlyPayment);
  }
  
  let annualEffectiveRate = 0;
  try {
    const monthlyIRR = calculateIRR(cashFlows);
    annualEffectiveRate = (Math.pow(1 + monthlyIRR, 12) - 1) * 100;
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message || 'Efektif oran hesaplanamadı (Yakınsama hatası).']
    };
  }
  
  return {
    primaryResult: '%' + annualEffectiveRate.toFixed(4),
    secondaryResults: {
      'Net Kullanılan Tutar': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(netReceived),
      'Aylık Taksit': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(monthlyPayment),
      'Vade': termMonths + ' Ay',
      'Toplam Taksit Ödemesi': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(monthlyPayment * termMonths),
      'Peşin Ücret': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(upfrontFees)
    },
    notes: ['Bu araç nakit akışları (Cash Flow / IRR) üzerinden efektif maliyet oranı simülasyonu yapar. Bankanızın resmi yasal Yıllık Maliyet Oranı ile kuruşsal farklar içerebilir.']
  };
}