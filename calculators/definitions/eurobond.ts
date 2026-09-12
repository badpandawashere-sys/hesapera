import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateEurobond } from '../formulas/eurobond';

const schema = z.object({
  faceValue: z.number().positive('Nominal değer 0 dan büyük olmalıdır'),
  purchasePrice: z.number().positive('Alış fiyatı 0 dan büyük olmalıdır'),
  annualCouponRate: z.number().min(0, 'Kupon oranı negatif olamaz'),
  couponFrequency: z.string(),
  remainingYears: z.number().positive('Vade pozitif olmalıdır')
});

type Input = z.infer<typeof schema>;

export const eurobondCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_eurobond_001',
  slug: 'eurobond',
  status: 'draft',
  name: 'Eurobond Hesaplama',
  shortDescription: 'Döviz cinsi tahvillerin (Eurobond) tahmini kupon getirisini ve vade sonu toplam nakit akışını simüle edin.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Eurobond Hesaplama Aracı | Hesapera',
    description: 'Döviz cinsi tahvillerin (Eurobond) tahmini kupon getirisini ve vade sonu toplam nakit akışını simüle edin.',
    keywords: ["eurobond hesaplama","döviz tahvil","kupon getirisi","eurobond nakit akışı"],
    canonical: 'https://hesapera.com/eurobond',
    faq: [],
    relatedCalculators: ["tahvil","bono","faiz"]
  },
  fields: [
  {
    "id": "faceValue",
    "label": "Nominal Değer (Face Value)",
    "type": "number",
    "required": true,
    "min": 0
  },
  {
    "id": "purchasePrice",
    "label": "Alış Fiyatı (Purchase Price)",
    "type": "number",
    "required": true,
    "min": 0
  },
  {
    "id": "annualCouponRate",
    "label": "Yıllık Kupon Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  },
  {
    "id": "couponFrequency",
    "label": "Kupon Sıklığı",
    "type": "select",
    "required": true,
    "options": [
      {
        "label": "Yılda 1 (Annual)",
        "value": "1"
      },
      {
        "label": "Yılda 2 (Semi-Annual)",
        "value": "2"
      }
    ]
  },
  {
    "id": "remainingYears",
    "label": "Vadeye Kalan Yıl",
    "type": "number",
    "required": true,
    "min": 0.5,
    "step": 0.5
  }
],
  schema,
  calculate: (input) => {
    return calculateEurobond(input.faceValue, input.purchasePrice, input.annualCouponRate, input.couponFrequency, input.remainingYears);
  }
};

