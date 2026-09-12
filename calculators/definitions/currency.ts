import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCurrency } from '../formulas/currency';
import { marketDataService } from '../../lib/market-data/market-data-service';

const schema = z.object({
  transactionType: z.string(),
  currencyCode: z.string(),
  quantity: z.number().min(0, 'Negatif miktar olamaz').optional().default(0),
  cashAmount: z.number().min(0, 'Negatif tutar olamaz').optional().default(0)
}).superRefine((data, ctx) => {
  if (data.transactionType === 'to_try' && data.quantity <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Miktar 0 dan büyük olmalıdır', path: ['quantity'] });
  }
  if (data.transactionType === 'to_currency' && data.cashAmount <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tutar 0 dan büyük olmalıdır', path: ['cashAmount'] });
  }
});

type Input = z.infer<typeof schema>;

export const currencyCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_currency_001',
  slug: 'doviz',
  status: 'published',
  name: 'Döviz Hesaplama',
  shortDescription: 'Canlı döviz kurları ile farklı para birimleri arasında değer çevrimi yapın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Canlı Döviz Kuru Hesaplama ve Çevirici | Hesapera',
    description: 'Güncel Amerikan Doları, Euro, Sterlin ve diğer para birimlerinin kurlarını takip ederek anında TL çevrimi yapın.',
    keywords: ["döviz hesaplama", "dolar hesapla", "euro hesapla", "kur çevirici", "canlı döviz"],
    canonical: 'https://hesapera.com.tr/hesaplama/doviz',
    icon: 'Banknote',
    faq: [],
    features: [
      { label: 'Canlı Döviz Kurları', icon: 'LineChart' },
      { label: 'Alış/Satış Farkı Hesaplama', icon: 'ArrowRightLeft' },
      { label: 'Güncel Veriler', icon: 'Clock' }
    ],
    infoBox: {
      title: 'Döviz Piyasası Verileri',
      text: 'Serbest piyasa güncel kurları üzerinden matematiksel dönüşüm yapılır. Banka komisyonları ve anlık makas farkları değişiklik gösterebilir.',
      icon: 'Info'
    },
    relatedCalculators: ["altin", "ihtiyac-kredisi"]
  },
  fields: [
    {
      id: "currencyCode",
      label: "Döviz Türü",
      type: "select",
      required: true,
      options: [
        { label: "USD - Amerikan Doları", value: "USD" },
        { label: "EUR - Euro", value: "EUR" },
        { label: "GBP - İngiliz Sterlini", value: "GBP" },
        { label: "CHF - İsviçre Frangı", value: "CHF" },
        { label: "CAD - Kanada Doları", value: "CAD" },
        { label: "RUB - Rus Rublesi", value: "RUB" },
        { label: "AED - BAE Dirhemi", value: "AED" },
        { label: "AUD - Avustralya Doları", value: "AUD" },
        { label: "DKK - Danimarka Kronu", value: "DKK" },
        { label: "SEK - İsveç Kronu", value: "SEK" },
        { label: "NOK - Norveç Kronu", value: "NOK" },
        { label: "JPY - Japon Yeni", value: "JPY" },
        { label: "KWD - Kuveyt Dinarı", value: "KWD" },
        { label: "SAR - Suudi Arabistan Riyali", value: "SAR" },
        { label: "CNY - Çin Yuanı", value: "CNY" }
      ]
    },
    {
      id: "transactionType",
      label: "İşlem Yönü",
      type: "select",
      required: true,
      options: [
        {
          label: "Döviz → TL (Döviz Bozma)",
          value: "to_try"
        },
        {
          label: "TL → Döviz (Döviz Alma)",
          value: "to_currency"
        }
      ]
    },
    {
      id: "quantity",
      label: "Döviz Miktarı",
      type: "number",
      required: true,
      min: 0,
      step: 0.01,
      conditions: [
        {
          fieldId: "transactionType",
          operator: "equals",
          value: "to_try"
        }
      ]
    },
    {
      id: "cashAmount",
      label: "TL Tutarı",
      type: "currency",
      required: true,
      min: 0,
      conditions: [
        {
          fieldId: "transactionType",
          operator: "equals",
          value: "to_currency"
        }
      ]
    }
  ],
  schema,
  calculate: async (input) => {
    const quote = await marketDataService.getCurrencyQuote(input.currencyCode);
    return calculateCurrency(
      input.transactionType, 
      input.currencyCode, 
      input.quantity, 
      input.cashAmount,
      quote
    );
  }
};

