import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateTahvil } from '../formulas/tahvil';

const schema = z.object({
  nominalValue: z.number().positive('Nominal değer 0 dan büyük olmalıdır'),
  couponRate: z.number().min(0, 'Kupon oranı negatif olamaz'),
  couponFrequency: z.string(),
  timeToMaturity: z.number().positive('Kalan vade 0 dan büyük olmalıdır'),
  marketYield: z.number().min(0, 'Piyasa getirisi negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const tahvilCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_tahvil_001',
  slug: 'tahvil',
  status: 'draft',
  name: 'Tahvil Hesaplama',
  shortDescription: 'Tahvilin nominal değeri, kupon oranı, vadesi ve piyasa getirisi üzerinden tahvil fiyatı ve getiri göstergelerini hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Tahvil Hesaplama Aracı | Hesapera',
    description: 'Tahvilin nominal değeri, kupon oranı, vadesi ve piyasa getirisi üzerinden tahvil fiyatı ve getiri göstergelerini hesaplayın.',
    keywords: ["tahvil fiyatı","kupon ödemesi","iskontolu tahvil","primli tahvil","tahvil getirisi"],
    canonical: 'https://hesapera.com/tahvil',
    faq: [],
    relatedCalculators: ["ic-verim-orani","eurobond","repo"]
  },
  fields: [
  {
    "id": "nominalValue",
    "label": "Nominal Değer",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "couponRate",
    "label": "Yıllık Kupon Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  },
  {
    "id": "couponFrequency",
    "label": "Kupon Ödeme Sıklığı",
    "type": "select",
    "required": true,
    "options": [
      {
        "label": "Yılda 1 Kez (Yıllık)",
        "value": "1"
      },
      {
        "label": "Yılda 2 Kez (6 Aylık)",
        "value": "2"
      },
      {
        "label": "Yılda 4 Kez (3 Aylık)",
        "value": "4"
      },
      {
        "label": "Yılda 12 Kez (Aylık)",
        "value": "12"
      }
    ]
  },
  {
    "id": "timeToMaturity",
    "label": "Kalan Vade (Yıl)",
    "type": "number",
    "required": true,
    "min": 0,
    "step": 0.01
  },
  {
    "id": "marketYield",
    "label": "Piyasa Getirisi / İskonto Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  }
],
  schema,
  calculate: (input) => {
    return calculateTahvil(input.nominalValue, input.couponRate, input.couponFrequency, input.timeToMaturity, input.marketYield);
  }
};

