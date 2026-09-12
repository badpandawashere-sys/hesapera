export function calculateVat(amount: number, rate: number) {
  const taxAmount = amount * rate / 100;
  const totalAmount = amount + taxAmount;
  
  return {
    primaryResult: totalAmount,
    secondaryResults: {
      'KDV Tutarı': taxAmount,
      'KDV Hariç Tutar': amount,
      'KDV Oranı': '%' + rate
    }
  };
}