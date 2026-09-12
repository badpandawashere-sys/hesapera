export function calculateSavings(initialDeposit: number, periodicContribution: number, annualInterestRate: number, termMonths: number) {
  const monthlyRate = annualInterestRate / 12 / 100;
  
  let initialFuture = 0;
  let contributionFuture = 0;

  if (monthlyRate === 0) {
    initialFuture = initialDeposit;
    contributionFuture = periodicContribution * termMonths;
  } else {
    initialFuture = initialDeposit * Math.pow(1 + monthlyRate, termMonths);
    contributionFuture = periodicContribution * ((Math.pow(1 + monthlyRate, termMonths) - 1) / monthlyRate);
  }

  const futureValue = initialFuture + contributionFuture;
  const totalContributions = initialDeposit + (periodicContribution * termMonths);
  const totalGrowth = futureValue - totalContributions;

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(futureValue),
    secondaryResults: {
      'Başlangıç Birikimi': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(initialDeposit),
      'Toplam Düzenli Katkı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(periodicContribution * termMonths),
      'Kazanılan Getiri': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalGrowth),
      'Süre': termMonths + ' Ay'
    },
    notes: ['Bu birikim modeli, girilen oranlar üzerinden matematiksel simülasyon yapar. Güncel yatırım ürünlerinin (fon, mevduat, vb.) stopaj, komisyon ve enflasyon etkilerini barındırmaz.']
  };
}