import { generateAmortizationSchedule } from './loan/amortization';

export function calculateCreditCardCashAdvance(cashAdvanceAmount: number, monthlyInterestRate: number, installmentCount: number, feeRate: number) {
  const fee = cashAdvanceAmount * (feeRate / 100);
  const principalForInstallment = cashAdvanceAmount + fee;
  
  const result = generateAmortizationSchedule({
    principal: principalForInstallment,
    monthlyInterestRate: monthlyInterestRate,
    termMonths: installmentCount
  });
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.monthlyPayment),
    secondaryResults: {
      'Nakit Avans Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashAdvanceAmount),
      'İşlem Ücreti': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(fee),
      'Toplam Faiz': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalInterest),
      'Toplam Geri Ödeme': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(result.totalPayment),
      'Taksit Sayısı': installmentCount
    },
    notes: ['Bankanız güncel kanunlara göre nakit avans faiz/ücret oranlarını değiştirebilir. Kullanıcının girdiği oran üzerinden hesaplanmıştır.']
  };
}