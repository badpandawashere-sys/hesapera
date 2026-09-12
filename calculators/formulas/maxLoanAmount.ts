export function calculateMaxLoanAmount(maxMonthlyPayment: number, monthlyInterestRate: number, termMonths: number, existingMonthlyDebt: number) {
  const availablePayment = maxMonthlyPayment - existingMonthlyDebt;
  
  if (availablePayment <= 0) {
    return {
      primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(0),
      secondaryResults: {
        'Kullanılabilir Aylık Ödeme': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(0),
        'Aylık Faiz': '%' + monthlyInterestRate,
        'Vade': termMonths + ' Ay',
        'Mevcut Borç': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(existingMonthlyDebt)
      },
      warnings: [{ message: 'Mevcut aylık borcunuz, ödeyebileceğiniz maksimum tutarı aştığı veya eşit olduğu için yeni kredi kapasiteniz bulunmamaktadır.' }]
    };
  }

  const r = monthlyInterestRate / 100;
  const n = termMonths;
  let maxLoan = 0;

  if (r === 0) {
    maxLoan = availablePayment * n;
  } else {
    // Reverse Annuity Formula: P = payment * ((1+r)^n - 1) / (r*(1+r)^n)
    const factor = Math.pow(1 + r, n);
    maxLoan = availablePayment * (factor - 1) / (r * factor);
  }
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(maxLoan),
    secondaryResults: {
      'Kullanılabilir Aylık Ödeme': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(availablePayment),
      'Aylık Faiz': '%' + monthlyInterestRate,
      'Vade': termMonths + ' Ay',
      'Mevcut Borç': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(existingMonthlyDebt)
    },
    notes: ['Bu hesaplama gelir ve yasal oran limitlerinden (örn: DTI) bağımsız tamamen teorik anüite ters-matematiğidir. Bankanın size sunacağı gerçek limitler farklılık gösterebilir.']
  };
}