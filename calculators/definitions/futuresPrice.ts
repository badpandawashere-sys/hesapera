import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateFuturesPrice } from '../formulas/futuresPrice';

const schema = z.object({
  spotPrice: z.number().positive('Spot fiyat 0 dan büyük olmalıdır'),
  interestRate: z.number().min(0, 'Faiz negatif olamaz'),
  daysToMaturity: z.number().int().positive('Gün sayısı 0 dan büyük olmalıdır'),
  dividendType: z.enum(['none', 'rate', 'amount']),
  dividendRate: z.number().min(0).optional().default(0),
  dividendAmount: z.number().min(0).optional().default(0)
});

type Input = z.infer<typeof schema>;

export const futuresPriceCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_futuresPrice_001',
  slug: 'vadeli-islem-fiyati',
  status: 'draft',
  name: 'Vadeli İşlem Fiyatı Hesaplama',
  shortDescription: 'Dayanak varlığın spot fiyatı, finansman maliyeti ve temettü etkisi üzerinden teorik vadeli işlem fiyatını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Vadeli İşlem Fiyatı Hesaplama Aracı | Hesapera',
    description: 'Dayanak varlığın spot fiyatı, finansman maliyeti ve temettü etkisi üzerinden teorik vadeli işlem fiyatını hesaplayın.',
    keywords: ["vadeli işlem fiyatı","viop","spot fiyat","teorik fiyat","taşıma maliyeti"],
    canonical: 'https://hesapera.com/vadeli-islem-fiyati',
    faq: [],
    relatedCalculators: ["repo","ic-ve-dis-iskonto","altin"]
  },
  fields: [
  {
    "id": "spotPrice",
    "label": "Dayanak Varlık Spot Fiyatı",
    "type": "number",
    "required": true,
    "min": 0,
    "step": 0.0001
  },
  {
    "id": "interestRate",
    "label": "Yıllık Faiz / Finansman Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  },
  {
    "id": "daysToMaturity",
    "label": "Vade (Gün)",
    "type": "number",
    "required": true,
    "min": 1
  },
  {
    "id": "dividendType",
    "label": "Temettü / Gelir Türü",
    "type": "select",
    "required": true,
    "options": [
      {
        "label": "Gelir/Temettü Yok",
        "value": "none"
      },
      {
        "label": "Yıllık Oran Üzerinden (%)",
        "value": "rate"
      },
      {
        "label": "Mutlak Tutar Üzerinden (Vade İçi)",
        "value": "amount"
      }
    ]
  },
  {
    "id": "dividendRate",
    "label": "Yıllık Temettü Getirisi (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01,
    "conditions": [
      {
        "fieldId": "dividendType",
        "operator": "equals",
        "value": "rate"
      }
    ]
  },
  {
    "id": "dividendAmount",
    "label": "Temettü / Gelir Tutarı",
    "type": "number",
    "required": true,
    "min": 0,
    "step": 0.0001,
    "conditions": [
      {
        "fieldId": "dividendType",
        "operator": "equals",
        "value": "amount"
      }
    ]
  }
],
  schema,
  calculate: (input) => {
    return calculateFuturesPrice(input.spotPrice, input.interestRate, input.daysToMaturity, input.dividendType, input.dividendRate, input.dividendAmount);
  }
};

