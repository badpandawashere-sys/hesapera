export function calculateFuturesPrice(spotPrice: number, interestRate: number, daysToMaturity: number, dividendType: 'none' | 'rate' | 'amount', dividendRate: number, dividendAmount: number) {
  const costOfCarry = spotPrice * (interestRate / 100) * (daysToMaturity / 365);
  
  let dividendEffect = 0;
  if (dividendType === 'rate') {
    dividendEffect = spotPrice * (dividendRate / 100) * (daysToMaturity / 365);
  } else if (dividendType === 'amount') {
    // Assumes the dividend amount is present value or simplified adjustment
    dividendEffect = dividendAmount;
  }
  
  const futuresPrice = spotPrice + costOfCarry - dividendEffect;

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 4 }).format(futuresPrice),
    secondaryResults: {
      'Spot Fiyat': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 4 }).format(spotPrice),
      'Taşıma Maliyeti (Faiz)': '+' + new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 4 }).format(costOfCarry),
      'Temettü / Gelir Etkisi': '-' + new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 4 }).format(dividendEffect),
      'Vade': daysToMaturity + ' Gün'
    },
    notes: ['Bulunan sonuç "Teorik Vadeli İşlem Fiyatıdır". Gerçek borsa kotasyonları (piyasa fiyatı), arz/talep ve beklentilere göre teorik fiyattan sapma gösterebilir. Basit faiz taşıma modeli ve 365 gün esası kullanılmıştır.']
  };
}