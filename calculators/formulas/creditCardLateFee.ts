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

  // Günlük faiz hesaplaması: TCMB ve bankacılık sistemi standart basit faiz modeli.
  // Günlük Faiz Oranı = Aylık Faiz Oranı / 30
  const dailyRate = (monthlyDelayRate / 100) / 30;
  const rawInterest = overdueAmount * dailyRate * delayDays;
  const roundedRawInterest = Math.round(rawInterest * 100) / 100;
  
  // Vergiler (Bireysel kredi kartı faizlerine %15 KKDF ve %15 BSMV uygulanır)
  const kkdfRate = 0.15;
  const bsmvRate = 0.15;
  
  // Bankacılık muhasebesi gereği her bir vergi kalemi kuruş bazında yuvarlanır
  const kkdfAmount = Math.round(roundedRawInterest * kkdfRate * 100) / 100;
  const bsmvAmount = Math.round(roundedRawInterest * bsmvRate * 100) / 100;
  
  // Toplam gecikme maliyeti, yuvarlanmış saf faiz ve vergi kalemlerinin tam toplamıdır
  const totalLateFee = roundedRawInterest + kkdfAmount + bsmvAmount;
  const totalAmount = overdueAmount + totalLateFee;
  
  const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

  return {
    primaryResult: formatter.format(totalLateFee), // Vergili Toplam Gecikme Faizi
    secondaryResults: {
      'Gecikmeye Giren Tutar': formatter.format(overdueAmount),
      'Aylık Gecikme Faiz Oranı': '%' + monthlyDelayRate.toFixed(2),
      'Gecikme Gün Sayısı': delayDays.toString(),
      'Saf Gecikme Faizi': formatter.format(roundedRawInterest),
      'KKDF (%15)': formatter.format(kkdfAmount),
      'BSMV (%15)': formatter.format(bsmvAmount),
      'Toplam Gecikme Maliyeti': formatter.format(totalLateFee),
      'Toplam Ödenecek Tutar': formatter.format(totalAmount)
    },
    notes: [
      'Bankanızın ekstrenizde uyguladığı gerçek gecikme faiz oranını giriniz. TCMB tarafından yayımlanan oranlar bankaların aşamayacağı azami tavan oranlardır.',
      'TCMB azami faiz oranları dönem borcu aralıklarına (TCMB resmî tablosunda 30.000 TL altı, 30.000 TL - 180.000 TL arası ve 180.000 TL üzeri baremler) göre kademelendirilmektedir. Güncel tavan oranlar TCMB resmî web sitesinden kontrol edilmelidir.',
      'Hesaplama yöntemi: Günlük basit faiz modeli (Aylık Oran / 30 × Gün) üzerinden net faiz bulunur. Hesapera standart modelinde bireysel kartlar için yasal %15 KKDF ve %15 BSMV bağımsız olarak kuruşa yuvarlanıp eklenir. Bankaların vergileri kümülatif (%30) yuvarlaması durumunda yarım kuruş sınırlarında 1 kuruşluk teknik yuvarlama farkı oluşabilir.'
    ]
  };
}
