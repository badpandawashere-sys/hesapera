import { historicalPreciousMetalProvider } from '../../lib/data/sources/mock-historical-precious-metals';

export function calculateHistoricalGold(transactionType: string, instrumentId: string, date: string, quantity: number, cashAmount: number) {
  const price = historicalPreciousMetalProvider.getPrice(instrumentId, date);
  if (!price) {
    throw new Error('Bu tarih için veri bulunamadı.');
  }

  if (transactionType === 'to_cash') {
    const estimatedValue = quantity * price.buy;
    return {
      primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(estimatedValue),
      secondaryResults: {
        'İşlem Yönü': 'Altından Paraya (Bozdurma)',
        'Altın Türü': instrumentId === 'gram' ? 'Gram Altın' : instrumentId,
        'Tarih': new Date(date).toLocaleDateString('tr-TR'),
        'Miktar': quantity,
        'Kullanılan Fiyat (Alış)': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price.buy)
      },
      notes: [`Veri Kaynağı: ${price.source} (${price.isMock ? 'Mock/Demo' : 'Gerçek Zamanlı'})`]
    };
  } else {
    const buyableQuantity = cashAmount / price.sell;
    return {
      primaryResult: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(buyableQuantity),
      secondaryResults: {
        'İşlem Yönü': 'Paradan Altına (Alım)',
        'Para Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashAmount),
        'Altın Türü': instrumentId === 'gram' ? 'Gram Altın' : instrumentId,
        'Tarih': new Date(date).toLocaleDateString('tr-TR'),
        'Kullanılan Fiyat (Satış)': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price.sell)
      },
      notes: [`Veri Kaynağı: ${price.source} (${price.isMock ? 'Mock/Demo' : 'Gerçek Zamanlı'})`]
    };
  }
}