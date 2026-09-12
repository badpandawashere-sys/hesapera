import { tcmbHistoricalProvider } from '../../lib/data/sources/tcmb-historical-currency';

function getPreviousDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

const rateTypeNames: Record<string, string> = {
  forexBuying: 'Döviz Alış',
  forexSelling: 'Döviz Satış',
  banknoteBuying: 'Efektif Alış',
  banknoteSelling: 'Efektif Satış'
};

export async function calculateHistoricalCurrency(amount: number, currency: string, rateType: string, date: string) {
  let rateData = null;
  let currentDate = date;
  let attempts = 0;
  
  while (attempts < 7) {
    rateData = await tcmbHistoricalProvider.getRateForDate(currency, currentDate);
    if (rateData) break;
    
    attempts++;
    currentDate = getPreviousDate(date, attempts);
  }
  
  if (!rateData) {
    throw new Error('Geçerli TCMB verisi bulunamadı.');
  }

  const rate = rateData[rateType as keyof typeof rateData] as number;
  if (!rate) {
    throw new Error('Seçilen kur tipi için veri bulunamadı.');
  }

  const convertedAmount = amount * rate;

  const notes = ['Veri Kaynağı: TCMB'];
  if (currentDate !== date) {
    const dt = new Date(currentDate).toLocaleDateString('tr-TR');
    notes.push('Seçilen tarihte veri bulunmadığı için en yakın önceki iş günü (' + dt + ') baz alınmıştır.');
  }

  return {
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(convertedAmount),
    secondaryResults: {
      'Tutar': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(amount) + ' ' + currency,
      'Para Birimi': currency,
      'Kur Tipi': rateTypeNames[rateType] || rateType,
      'Tarih': new Date(currentDate).toLocaleDateString('tr-TR'),
      'Kullanılan Kur': new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 4 }).format(rate)
    },
    notes
  };
}
