export function calculateLoanFee(loanAmount: number, feeRate: number) {
  const fee = loanAmount * feeRate / 100;
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(fee),
    secondaryResults: {
      'Kredi Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(loanAmount),
      'Masraf Oranı': '%' + feeRate
    }
  };
}