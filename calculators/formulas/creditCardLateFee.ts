export function calculateCreditCardLateFee(overdueAmount: number, monthlyDelayRate: number, delayDays: number) {
  if (overdueAmount <= 0) {
    return { success: false, errors: ['Gecikmeye giren tutar 0 dan büyük olmalıdır.'] };
  }
  if (delayDays < 0) {
    return { success: false, errors: ['Gecikme gün sayısı negatif olamaz.'] };
  }
  if (monthlyDelayRate < 0) {
    return { success: false, errors: ['Aylık gecikme faiz oranı negatif olamaz.'] };
  }

  // Günlük faiz hesaplaması: Hesapera tahmini günlük basit faiz modeli.
  // Günlük Faiz = Aylık Faiz / 30
  const dailyRate = (monthlyDelayRate / 100) / 30;
  const interestAmount = overdueAmount * dailyRate * delayDays;
  
  const totalAmount = overdueAmount + interestAmount;
  
  const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

  return {
    primaryResult: formatter.format(interestAmount), // Gecikme Faizi
    secondaryResults: {
      'Gecikmeye Giren Tutar': formatter.format(overdueAmount),
      'Aylık Gecikme Faiz Oranı': '%' + monthlyDelayRate.toFixed(2),
      'Gecikme Gün Sayısı': delayDays.toString(),
      'Günlük Yaklaşık Oran': '%' + (dailyRate * 100).toFixed(4),
      'Tahmini Gecikme Faizi': formatter.format(interestAmount),
      'Toplam Tutar': formatter.format(totalAmount)
    },
    notes: [
      'Bankanızın uyguladığı gerçek gecikme faiz oranını kullanın. TCMB tarafından ilan edilen oranlar azami oranlardır; bankalar bu oranları aşmamak kaydıyla kendi oranlarını belirleyebilir.',
      'Bilgi: 1 Eylül 2026 itibarıyla TCMB aylık azami gecikme faiz oranları: 30.000 TL altı için %3,55; 30.000-180.000 TL için %4,25; 180.000 TL üzeri ve nakit çekim için %4,55; YP için %3,28\'dir.',
      'Kullanılan yöntem, Hesapera\'nın tahmini günlük basit faiz modeli (Aylık Oran / 30 * Gün) olup bankaların iç hesaplama yöntemlerine göre ufak farklılıklar gösterebilir.',
      'Vergi ve ek yükümlülükler (BSMV, KKDF vb.) bankanın ekstre hesaplamasına ve işlem türüne göre değişebileceği için hesaba dâhil edilmemiştir; nihai sonuçta bankanızın ekstre tahakkuku esastır.'
    ]
  };
}
