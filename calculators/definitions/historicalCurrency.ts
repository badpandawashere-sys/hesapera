import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateHistoricalCurrency } from '../formulas/historicalCurrency';

const schema = z.object({
  amount: z.number().min(0, 'Tutar negatif olamaz'),
  fromCurrency: z.string(),
  toCurrency: z.string(),
  date: z.string()
});

type Input = z.infer<typeof schema>;

export const historicalCurrencyCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_historicalCurrency_001',
  slug: 'gecmis-doviz-kurlari',
  status: 'published',
  name: 'Geçmiş Döviz Kurları Hesaplama',
  shortDescription: 'Belirli bir tarihteki döviz kurlarını kullanarak geçmiş tutarları güncel veya karşılıklı döviz cinslerine çevirin.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Geçmiş Döviz Kurları Hesaplama Aracı | Hesapera',
    description: 'Belirli bir tarihteki döviz kurlarını kullanarak geçmiş tutarları güncel veya karşılıklı döviz cinslerine çevirin.',
    keywords: ["geçmiş döviz kurları","tarihsel kur çeviri","eski dolar kuru","eski euro kuru"],
    canonical: 'https://hesapera.com/gecmis-doviz-kurlari',
    faq: [],
    relatedCalculators: ["doviz","gecmis-altin-fiyatlari","enflasyon"]
  },
  fields: [
  {
    "id": "amount",
    "label": "Tutar",
    "type": "number",
    "required": true,
    "min": 0
  },
  {
    "id": "fromCurrency",
    "label": "Kaynak Para Birimi",
    "type": "select",
    "required": true,
    "options": [
      {
        "label": "Türk Lirası (TRY)",
        "value": "TRY"
      },
      {
        "label": "Amerikan Doları (USD)",
        "value": "USD"
      },
      {
        "label": "Euro (EUR)",
        "value": "EUR"
      }
    ]
  },
  {
    "id": "toCurrency",
    "label": "Hedef Para Birimi",
    "type": "select",
    "required": true,
    "options": [
      {
        "label": "Türk Lirası (TRY)",
        "value": "TRY"
      },
      {
        "label": "Amerikan Doları (USD)",
        "value": "USD"
      },
      {
        "label": "Euro (EUR)",
        "value": "EUR"
      }
    ]
  },
  {
    "id": "date",
    "label": "Tarih",
    "type": "date",
    "required": true
  }
],
  schema,
  calculate: (input) => {
    return calculateHistoricalCurrency(input.amount, input.fromCurrency, input.toCurrency, input.date);
  }
};

