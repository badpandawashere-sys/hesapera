import { MarketQuote } from '../../lib/market-data/types';

export function calculateGold(transactionType: string, instrumentType: string, quantity: number, cashAmount: number, quote: MarketQuote) {
  if (!quote || isNaN(quote.buyPrice) || isNaN(quote.sellPrice) || quote.buyPrice <= 0 || quote.sellPrice <= 0) {
    throw new Error('Canlı piyasa verisi şu anda alınamıyor.');
  }

  if (transactionType === 'to_cash') {
    const unitPrice = quote.buyPrice;
    const estimatedValue = quantity * unitPrice;
    
    return {
      primaryLabel: 'Toplam Değer (TL)',
      primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(estimatedValue),
      secondaryResults: {
        'İşlem Yönü': 'Altından Paraya',
        'Altın Türü': instrumentType,
        'Miktar': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(quantity),
        'Kullanılan Kur (Alış)': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(unitPrice)
      },
      breakdown: [
        { label: 'Altın Türü', value: instrumentType },
        { label: 'Miktar', value: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(quantity) },
        { label: 'Piyasa Alış Fiyatı', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(unitPrice) },
        { label: 'Toplam Değer', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(estimatedValue) }
      ],
      infoReference: {
        title: "Altın Hesaplaması Nasıl Yapılır?",
        description: `Altın fiyatları ${quote.source} yayınladığı canlı verilerden alınır. "Altından Paraya" işleminde, altınınızı bozdurduğunuz varsayıldığı için piyasa "Alış" fiyatı (${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(unitPrice)}) kullanılmıştır. Kuyumcu komisyonu veya anlık makas farkları dahil değildir.`
      }
    };
  } else {
    const unitPrice = quote.sellPrice;
    const buyableQuantity = cashAmount / unitPrice;
    
    return {
      primaryLabel: 'Alınabilecek Miktar',
      primaryResult: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(buyableQuantity),
      secondaryResults: {
        'İşlem Yönü': 'Paradan Altına',
        'Para Tutarı': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashAmount),
        'Altın Türü': instrumentType,
        'Kullanılan Kur (Satış)': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(unitPrice)
      },
      breakdown: [
        { label: 'Altın Türü', value: instrumentType },
        { label: 'Para Tutarı', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashAmount) },
        { label: 'Piyasa Satış Fiyatı', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(unitPrice) },
        { label: 'Alınabilecek Miktar', value: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(buyableQuantity) }
      ],
      infoReference: {
        title: "Altın Hesaplaması Nasıl Yapılır?",
        description: `Altın fiyatları ${quote.source} yayınladığı canlı verilerden alınır. "Paradan Altına" işleminde, altın satın aldığınız varsayıldığı için piyasa "Satış" fiyatı (${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(unitPrice)}) kullanılmıştır. Kuyumcu komisyonu veya anlık makas farkları dahil değildir.`
      }
    };
  }
}
