import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateHistoricalCurrency } from '../formulas/historicalCurrency';

const schema = z.object({
  amount: z.number().min(0, 'Tutar negatif olamaz'),
  currency: z.string(),
  rateType: z.string(),
  date: z.string()
});

type Input = z.infer<typeof schema>;

export const historicalCurrencyCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_historicalCurrency_001',
  slug: 'gecmis-doviz-kurlari',
  status: 'published',
  name: 'Geçmiş Döviz Kurları Hesaplama',
  shortDescription: 'Belirli bir tarihteki döviz kurlarını kullanarak geçmiş tutarların TL karşılığını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Geçmiş Döviz Kurları Hesaplama Aracı | Hesapera',
    description: 'Belirli bir tarihteki döviz kurlarını kullanarak geçmiş tutarların TL karşılığını hesaplayın.',
    keywords: ["geçmiş döviz kurları","tarihsel kur çeviri","eski dolar kuru","eski euro kuru"],
    canonical: 'https://hesapera.com/gecmis-doviz-kurlari',
    faq: [],
    relatedCalculators: ["doviz","gecmis-altin-fiyatlari","enflasyon"]
  },
  fields: [
    {
      id: "amount",
      label: "Döviz Tutarı",
      type: "number",
      required: true,
      min: 0,
      step: 0.01
    },
    {
      id: "currency",
      label: "Para Birimi",
      type: "select",
      required: true,
      options: [
        { label: "Amerikan Doları (USD)", value: "USD" },
        { label: "Euro (EUR)", value: "EUR" },
        { label: "İngiliz Sterlini (GBP)", value: "GBP" }
      ]
    },
    {
      id: "rateType",
      label: "Kur Tipi",
      type: "select",
      required: true,
      options: [
        { label: "Döviz Alış", value: "forexBuying" },
        { label: "Döviz Satış", value: "forexSelling" },
        { label: "Efektif Alış", value: "banknoteBuying" },
        { label: "Efektif Satış", value: "banknoteSelling" }
      ]
    },
    {
      id: "date",
      label: "Tarih",
      type: "date",
      required: true
    }
  ],
  schema,
  calculate: async (input) => {
    return await calculateHistoricalCurrency(input.amount, input.currency, input.rateType, input.date);
  }
};
