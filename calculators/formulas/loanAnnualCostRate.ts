import { calculateIRR } from './finance/irr';
import { generateAmortizationSchedule } from './loan/amortization';

export interface LoanCostParams {
  loanType: 'ihtiyac' | 'tasit' | 'konut';
  principal: number;
  monthlyInterestRate: number;
  termMonths: number;
  allocationFee: number;
  insuranceFee: number;
  appraisalFee: number;
  mortgageFee: number;
  otherFees: number;
}

export function calculateLoanAnnualCostRate(params: LoanCostParams) {
  let kkdfRate = 0;
  let bsmvRate = 0;

  if (params.loanType === 'ihtiyac' || params.loanType === 'tasit') {
    kkdfRate = 15;
    bsmvRate = 15;
  }

  const amortization = generateAmortizationSchedule({
    principal: params.principal,
    monthlyInterestRate: params.monthlyInterestRate,
    termMonths: params.termMonths,
    kkdfRate,
    bsmvRate
  });

  const totalUpfrontFees = 
    params.allocationFee + 
    params.insuranceFee + 
    params.appraisalFee + 
    params.mortgageFee + 
    params.otherFees;

  const netReceived = params.principal - totalUpfrontFees;
  
  if (netReceived <= 0) {
    return {
      success: false,
      errors: ['Net kullanılan tutar (Kredi Tutarı - Peşin Masraflar) 0 dan büyük olmalıdır.']
    };
  }

  const cashFlows: number[] = [netReceived];
  for (const row of amortization.schedule) {
    cashFlows.push(-row.payment);
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
  
  const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

  return {
    primaryResult: '%' + annualEffectiveRate.toFixed(4),
    secondaryResults: {
      'Aylık Taksit': formatter.format(amortization.monthlyPayment),
      'Net Kullanılan Kredi': formatter.format(netReceived),
      'Toplam Geri Ödeme': formatter.format(amortization.totalPayment),
      'Toplam Faiz': formatter.format(amortization.totalInterest),
      'Toplam Vergi (BSMV+KKDF)': formatter.format((amortization.totalBSMV || 0) + (amortization.totalKKDF || 0)),
      'Toplam Peşin Ek Maliyet': formatter.format(totalUpfrontFees)
    },
    notes: [
      'Bu hesaplama Ticaret Bakanlığı Tüketici Kredisi Sözleşmeleri Yönetmeliği Ek-1 nakit akışı mantığına uygun olarak hazırlanmıştır.',
      'Sonuçlar bilgi amaçlıdır, bankanızın sözleşme öncesi bilgi formundaki resmî oran esastır.',
      params.loanType !== 'konut' ? 'Hesaplamaya %15 KKDF ve %15 BSMV dâhil edilmiştir.' : 'Konut kredilerinde BSMV ve KKDF muafiyeti uygulanmıştır.'
    ]
  };
}
