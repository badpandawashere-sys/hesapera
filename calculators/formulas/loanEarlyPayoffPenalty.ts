export function calculateLoanEarlyPayoffPenalty(remainingPrincipal: number, penaltyRate: number) {
  const penalty = remainingPrincipal * penaltyRate / 100;
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(penalty),
    secondaryResults: {
      'Kalan Anapara': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(remainingPrincipal),
      'Uygulanan Oran': '%' + penaltyRate
    }
  };
}