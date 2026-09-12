import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateHistoricalGold } from '../formulas/historicalGold';

const schema = z.object({
  transactionType: z.string(),
  instrumentId: z.string(),
  date: z.string(),
  quantity: z.number().min(0, 'Negatif miktar olamaz').optional().default(0),
  cashAmount: z.number().min(0, 'Negatif tutar olamaz').optional().default(0)
}).superRefine((data, ctx) => {
  if (data.transactionType === 'to_cash' && data.quantity <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Miktar 0 dan büyük olmalıdır', path: ['quantity'] });
  }
  if (data.transactionType === 'to_gold' && data.cashAmount <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tutar 0 dan büyük olmalıdır', path: ['cashAmount'] });
  }
});

type Input = z.infer<typeof schema>;

export const historicalGoldCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_historicalGold_001',
  slug: 'gecmis-altin-fiyatlari',
  name: 'Geçmiş Altın Fiyatları Hesaplama',
  shortDescription: 'Belirli bir tarihteki altın fiyatı verisini kullanarak geçmiş tarihli bir altın değer hesabı yapın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Geçmiş Altın Fiyatları Hesaplama Aracı | Hesapera',
    description: 'Belirli bir tarihteki altın fiyatı verisini kullanarak geçmiş tarihli bir altın değer hesabı yapın.',
    keywords: ["geçmiş altın fiyatları","tarihsel altın hesaplama","eski altın fiyatı"],
    canonical: 'https://hesapera.com/gecmis-altin-fiyatlari',
    faq: [],
    relatedCalculators: ["altin","gecmis-doviz-kurlari","doviz"]
  },
  fields: [
  {
    "id": "transactionType",
    "label": "İşlem Türü",
    "type": "select",
    "required": true,
    "options": [
      {
        "label": "Altından Paraya (Miktardan Tutara)",
        "value": "to_cash"
      },
      {
        "label": "Paradan Altına (Tutardan Miktara)",
        "value": "to_gold"
      }
    ]
  },
  {
    "id": "instrumentId",
    "label": "Altın Türü",
    "type": "select",
    "required": true,
    "options": [
      {
        "label": "Gram Altın",
        "value": "gram"
      }
    ]
  },
  {
    "id": "date",
    "label": "Tarih",
    "type": "date",
    "required": true
  },
  {
    "id": "quantity",
    "label": "Altın Miktarı",
    "type": "number",
    "required": true,
    "min": 0,
    "step": 0.01,
    "conditions": [
      {
        "fieldId": "transactionType",
        "operator": "equals",
        "value": "to_cash"
      }
    ]
  },
  {
    "id": "cashAmount",
    "label": "Para Tutarı (TL)",
    "type": "currency",
    "required": true,
    "min": 0,
    "conditions": [
      {
        "fieldId": "transactionType",
        "operator": "equals",
        "value": "to_gold"
      }
    ]
  }
],
  schema,
  calculate: (input) => {
    return calculateHistoricalGold(input.transactionType, input.instrumentId, input.date, input.quantity, input.cashAmount);
  }
};