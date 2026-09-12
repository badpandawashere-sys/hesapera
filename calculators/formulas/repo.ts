export function calculateRepo(principal: number, repoRate: number, days: number, taxRate: number) {
  const grossReturn = principal * (repoRate / 100) * (days / 365);
  const taxAmount = grossReturn * (taxRate / 100);
  const netReturn = grossReturn - taxAmount;
  const totalAmount = principal + netReturn;

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(netReturn),
    secondaryResults: {
      'Vade Sonu Toplam Tutar': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalAmount),
      'Brüt Repo Getirisi': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(grossReturn),
      'Kesilen Stopaj Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(taxAmount),
      'Anapara': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(principal),
      'Vade': days + ' Gün'
    },
    notes: ['Repo hesaplamasında ticari pratikteki 365 gün varsayımı kullanılmıştır. Yasal stopaj oranları değişebileceğinden formdaki stopaj oranının güncel olduğundan emin olun.']
  };
}