import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCapitalDividend } from '../formulas/capitalDividend';

const schema = z.object({
  capital: z.number().positive('Sermaye 0 dan büyük olmalıdır'),
  sharesCount: z.number().int().positive('Hisse adedi 0 dan büyük tam sayı olmalıdır'),
  calculationType: z.enum(['by_rate', 'by_amount']),
  dividendRate: z.number().min(0, 'Oran negatif olamaz').optional().default(0),
  dividendAmount: z.number().min(0, 'Tutar negatif olamaz').optional().default(0)
}).superRefine((data, ctx) => {
  if (data.calculationType === 'by_rate' && (data.dividendRate === undefined || data.dividendRate < 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Geçerli bir oran giriniz', path: ['dividendRate'] });
  }
  if (data.calculationType === 'by_amount' && (data.dividendAmount === undefined || data.dividendAmount < 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Geçerli bir tutar giriniz', path: ['dividendAmount'] });
  }
});

type Input = z.infer<typeof schema>;

export const capitalDividendCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_capitalDividend_001',
  slug: 'sermaye-ve-temettu',
  status: 'draft',
  name: 'Sermaye ve Temettü Hesaplama',
  shortDescription: 'Sermaye, hisse adedi ve temettü oranları arasındaki ilişkiyi kullanarak hisse başına düşen temettü ve nominal değeri hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Sermaye ve Temettü Hesaplama Aracı | Hesapera',
    description: 'Sermaye, hisse adedi ve temettü oranları arasındaki ilişkiyi kullanarak hisse başına düşen temettü ve nominal değeri hesaplayın.',
    keywords: ["temettü hesaplama","hisse temettü","sermaye hesaplama","hisse başına temettü"],
    canonical: 'https://hesapera.com/sermaye-ve-temettu',
    faq: [],
    relatedCalculators: ["reel-getiri","repo","ic-verim-orani"]
  },
  fields: [
  {
    "id": "capital",
    "label": "Toplam Sermaye (TL)",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "sharesCount",
    "label": "Toplam Hisse Adedi",
    "type": "number",
    "required": true,
    "min": 1
  },
  {
    "id": "calculationType",
    "label": "Temettü Hesabı Yöntemi",
    "type": "select",
    "required": true,
    "options": [
      {
        "label": "Temettü Oranından Hesapla",
        "value": "by_rate"
      },
      {
        "label": "Toplam Temettü Tutarından Hesapla",
        "value": "by_amount"
      }
    ]
  },
  {
    "id": "dividendRate",
    "label": "Temettü Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01,
    "conditions": [
      {
        "fieldId": "calculationType",
        "operator": "equals",
        "value": "by_rate"
      }
    ]
  },
  {
    "id": "dividendAmount",
    "label": "Toplam Temettü Tutarı (TL)",
    "type": "currency",
    "required": true,
    "min": 0,
    "conditions": [
      {
        "fieldId": "calculationType",
        "operator": "equals",
        "value": "by_amount"
      }
    ]
  }
],
  schema,
  calculate: (input) => {
    return calculateCapitalDividend(input.capital, input.sharesCount, input.calculationType, input.dividendRate, input.dividendAmount);
  }
};

