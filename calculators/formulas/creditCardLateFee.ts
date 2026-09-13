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
  const rawInterest = overdueAmount * dailyRate * delayDays;
  
  // Vergiler (Standart ihtiyaç kredisi ve bireysel kredi kartlarında geçerli %15 KKDF, %15 BSMV)
  const kkdfRate = 0.15;
  const bsmvRate = 0.15;
  
  const kkdfAmount = rawInterest * kkdfRate;
  const bsmvAmount = rawInterest * bsmvRate;
  
  const totalLateFee = rawInterest + kkdfAmount + bsmvAmount;
  const totalAmount = overdueAmount + totalLateFee;
  
  const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

  return {
    primaryResult: formatter.format(totalLateFee), // Vergili Toplam Gecikme Faizi
    secondaryResults: {
      'Gecikmeye Giren Tutar': formatter.format(overdueAmount),
      'Aylık Gecikme Faiz Oranı': '%' + monthlyDelayRate.toFixed(2),
      'Gecikme Gün Sayısı': delayDays.toString(),
      'Saf Gecikme Faizi': formatter.format(rawInterest),
      'KKDF (%15)': formatter.format(kkdfAmount),
      'BSMV (%15)': formatter.format(bsmvAmount),
      'Toplam Gecikme Maliyeti': formatter.format(totalLateFee),
      'Toplam Ödenecek Tutar': formatter.format(totalAmount)
    },
    notes: [
      'Bankanızın uyguladığı gerçek gecikme faiz oranını kullanın. TCMB tarafından ilan edilen oranlar azami oranlardır; bankalar bu oranları aşmamak kaydıyla kendi oranlarını belirleyebilir.',
      'Bilgi: 1 Eylül 2026 itibarıyla TCMB aylık azami gecikme faiz oranları: 30.000 TL altı için %3,55; 30.000-180.000 TL için %4,25; 180.000 TL üzeri ve nakit çekim için %4,55; YP için %3,28\'dir.',
      'Kullanılan yöntem, bankacılık sistemi standart günlük basit faiz modeli (Aylık Oran / 30 * Gün) olup, bireysel kartlar için geçerli %15 KKDF ve %15 BSMV eklenerek nihai maliyet bulunmuştur.'
    ]
  };
}
