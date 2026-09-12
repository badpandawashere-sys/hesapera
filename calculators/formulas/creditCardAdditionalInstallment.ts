export function calculateCreditCardAdditionalInstallment(transactionAmount: number, currentInstallments: number, additionalInstallments: number) {
  const totalInstallments = currentInstallments + additionalInstallments;
  const installmentAmount = transactionAmount / totalInstallments;
  
  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(installmentAmount),
    secondaryResults: {
      'İşlem Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(transactionAmount),
      'Mevcut Taksit': currentInstallments,
      'Ek Taksit': additionalInstallments,
      'Toplam Taksit': totalInstallments
    }
  };
}