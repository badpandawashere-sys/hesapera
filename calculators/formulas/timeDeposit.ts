export function calculateTimeDeposit(principal: number, interestRate: number, maturityType: 'days' | 'months', maturity: number, taxRate: number) {
  // Commercial convention: 1 month = 30 days generally, but some banks use exact. We will use 30 days for month conversion for simplicity.
  const days = maturityType === 'months' ? maturity * 30 : maturity;
  
  const grossInterest = principal * (interestRate / 100) * (days / 365);
  const taxAmount = grossInterest * (taxRate / 100);
  const netInterest = grossInterest - taxAmount;
  const totalAmount = principal + netInterest;
  
  let effectiveNetYield = 0;
  if (principal > 0) {
    effectiveNetYield = (netInterest / principal) * 100;
  }

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(netInterest),
    secondaryResults: {
      'Vade Sonu Toplam Bakiye': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalAmount),
      'Brüt Faiz Getirisi': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(grossInterest),
      'Kesilen Stopaj': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(taxAmount),
      'Efektif Net Dönem Getirisi': '%' + effectiveNetYield.toFixed(4),
      'Hesaplamaya Esas Gün': days + ' Gün'
    },
    notes: ['Bankacılık sisteminde genellikle bir yıl 365 gün kabul edilerek basit faiz uygulanır. Ay bazlı seçimlerde ticari pratik olan 1 Ay = 30 Gün yaklaşımı kullanılmıştır. Varsayılan stopaj oranı "örnek" değerdir.']
  };
}