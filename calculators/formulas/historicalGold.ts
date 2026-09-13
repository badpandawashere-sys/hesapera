import { altinveriProvider } from '../../lib/data/providers/altinveri-historical-provider';

export function calculateHistoricalGold(transactionType: string, instrumentId: string, date: string, quantity: number, cashAmount: number) {
  const price = altinveriProvider.getPrice(instrumentId, date);
  
  if (!price) {
    throw new Error('Bu tarih için veri bulunamadı.');
  }

  const requestedDateStr = new Date(date).toLocaleDateString('tr-TR');
  const usedDateStr = new Date(price.effectiveAt).toLocaleDateString('tr-TR');
  
  const dateInfo = requestedDateStr === usedDateStr 
    ? requestedDateStr 
    : `İstenen tarih: ${requestedDateStr} — Bu tarihte veri yok. Sonraki ilk piyasa kaydı: ${usedDateStr} kullanıldı.`;

  const fmtCurrency = (val: number | undefined) => 
    val ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val) : '-';

  const fmtGram = (val: number) =>
    new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 4 }).format(val) + ' Gram';

  let primaryResult = '';
  let primaryLabel = '';
  let secondaryResults: Record<string, string> = {};

  if (transactionType === 'to_cash') {
    primaryResult = fmtCurrency(quantity * price.buy); // Varsayılan bozdurma
    primaryLabel = 'Alışa Göre Değer';
    secondaryResults = {
      'İşlem Yönü': 'Altından Paraya',
      'Altın Türü': instrumentId === 'gram' ? 'Gram Altın' : instrumentId,
      'Kullanılan Tarih': dateInfo,
      'Alış Fiyatı': fmtCurrency(price.buy),
      'Satış Fiyatı': fmtCurrency(price.sell),
      'Alışa Göre Değer': fmtCurrency(quantity * price.buy),
      'Satışa Göre Değer': fmtCurrency(quantity * price.sell)
    };
  } else {
    primaryResult = fmtGram(cashAmount / price.sell); // Varsayılan alım
    primaryLabel = 'Satışa Göre Miktar';
    secondaryResults = {
      'İşlem Yönü': 'Paradan Altına',
      'Altın Türü': instrumentId === 'gram' ? 'Gram Altın' : instrumentId,
      'Kullanılan Tarih': dateInfo,
      'Alış Fiyatı': fmtCurrency(price.buy),
      'Satış Fiyatı': fmtCurrency(price.sell),
      'Alışa Göre Miktar': fmtGram(cashAmount / price.buy),
      'Satışa Göre Miktar': fmtGram(cashAmount / price.sell)
    };
  }

  return {
    primaryLabel,
    primaryResult,
    secondaryResults,
    breakdown: [
      { label: 'Tarihsel Alış', value: fmtCurrency(price.buy) },
      { label: 'Tarihsel Satış', value: fmtCurrency(price.sell) },
      { label: 'Tarihsel En Düşük', value: fmtCurrency(price.low) },
      { label: 'Tarihsel En Yüksek', value: fmtCurrency(price.high) }
    ],
    notes: [`Geçmiş Veri Kaynağı: ${price.source}`]
  };
}