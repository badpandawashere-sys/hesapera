import { MarketQuote } from '../../lib/market-data/types';

export function calculateCurrency(transactionType: string, currencyCode: string, quantity: number, cashAmount: number, quote: MarketQuote) {
  if (!quote || isNaN(quote.buyPrice) || isNaN(quote.sellPrice) || quote.buyPrice <= 0 || quote.sellPrice <= 0) {
    throw new Error(`Canlı piyasa verisi şu anda alınamıyor.`);
  }

  if (transactionType === 'to_try') {
    // Döviz satıp TL almak: Alış Kuru
    const rate = quote.buyPrice;
    const estimatedValue = quantity * rate;
    
    return {
      primaryLabel: 'Alınacak Tutar (TL)',
      primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(estimatedValue),
      secondaryResults: {
        'İşlem Yönü': `${currencyCode} → TRY`,
        'Miktar': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(quantity) + ` ${currencyCode}`,
        'Piyasa Kuru (Alış)': new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(rate)
      },
      breakdown: [
        { label: 'Döviz Türü', value: currencyCode },
        { label: 'Bozdurulacak Miktar', value: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(quantity) + ` ${currencyCode}` },
        { label: 'Kullanılan Kur', value: new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(rate) },
        { label: 'Elinize Geçecek Tutar', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(estimatedValue) }
      ],
      infoReference: {
        title: "Döviz Hesaplaması Nasıl Yapılır?",
        description: `Döviz kurları ${quote.source} üzerinden alınır. "Döviz → TL" işleminde, dövizinizi bankaya sattığınız varsayıldığı için piyasa "Alış" kuru kullanılmıştır. Banka makasları ve komisyonlar hariçtir.`
      }
    };
  } else {
    // TL verip Döviz almak: Satış Kuru
    const rate = quote.sellPrice;
    const buyableQuantity = cashAmount / rate;
    
    return {
      primaryLabel: `Alınacak Tutar (${currencyCode})`,
      primaryResult: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(buyableQuantity),
      secondaryResults: {
        'İşlem Yönü': `TRY → ${currencyCode}`,
        'Verilecek Tutar': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashAmount),
        'Piyasa Kuru (Satış)': new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(rate)
      },
      breakdown: [
        { label: 'Döviz Türü', value: currencyCode },
        { label: 'Ödenecek Tutar', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashAmount) },
        { label: 'Kullanılan Kur', value: new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(rate) },
        { label: 'Elinize Geçecek Döviz', value: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(buyableQuantity) + ` ${currencyCode}` }
      ],
      infoReference: {
        title: "Döviz Hesaplaması Nasıl Yapılır?",
        description: `Döviz kurları ${quote.source} üzerinden alınır. "TL → Döviz" işleminde, bankadan döviz satın aldığınız varsayıldığı için piyasa "Satış" kuru kullanılmıştır. Banka makasları ve komisyonlar hariçtir.`
      }
    };
  }
}
