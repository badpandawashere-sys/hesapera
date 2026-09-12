import { historicalCurrencyRateProvider } from '../../lib/data/sources/mock-historical-currency-rates';

export function calculateHistoricalCurrency(amount: number, fromCurrency: string, toCurrency: string, date: string) {
  const rateData = historicalCurrencyRateProvider.getRate(fromCurrency, toCurrency, date);
  
  if (!rateData) {
    throw new Error('Bu tarih için veri bulunamadı.');
  }

  const convertedAmount = amount * rateData.rate;

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(convertedAmount) + ' ' + toCurrency,
    secondaryResults: {
      'Kaynak Para Birimi': fromCurrency,
      'Hedef Para Birimi': toCurrency,
      'Tarih': new Date(date).toLocaleDateString('tr-TR'),
      'Kullanılan Kur': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 4 }).format(rateData.rate)
    },
    notes: [`Veri Kaynağı: ${rateData.source} (${rateData.isMock ? 'Mock/Demo' : 'Gerçek Zamanlı'})`]
  };
}