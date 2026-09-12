import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateNpv } from '../formulas/npv';

const schema = z.object({
  discountRate: z.number().min(-99, 'İskonto oranı -99 dan küçük olamaz'),
  cashFlows: z.array(z.object({
    period: z.number().min(0, 'Dönem 0 dan küçük olamaz'),
    amount: z.number()
  })).min(1, 'En az 1 satır giriniz')
});

type Input = z.infer<typeof schema>;

export const npvCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_npv_001',
  slug: 'net-bugunku-deger',
  name: 'Net Bugünkü Değer Hesaplama (NPV)',
  shortDescription: 'Gelecekteki nakit akışlarının, belirlenen iskonto oranıyla bugünkü değerini hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Net Bugünkü Değer Hesaplama (NPV) Aracı | Hesapera',
    description: 'Gelecekteki nakit akışlarının, belirlenen iskonto oranıyla bugünkü değerini hesaplayın.',
    keywords: ["net bugünkü değer","npv hesaplama","iskonto","nakit akışı değerleme"],
    canonical: 'https://hesapera.com/net-bugunku-deger',
    faq: [],
    relatedCalculators: ["ic-verim-orani","faiz","bono","eurobond"]
  },
  fields: [
  {
    "id": "discountRate",
    "label": "İskonto Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": -99,
    "step": 0.01
  },
  {
    "id": "cashFlows",
    "label": "Nakit Akışları",
    "type": "array",
    "required": true,
    "subFields": [
      {
        "id": "period",
        "label": "Dönem",
        "type": "number",
        "required": true,
        "min": 0
      },
      {
        "id": "amount",
        "label": "Tutar (TL)",
        "type": "number",
        "required": true
      }
    ]
  }
],
  schema,
  calculate: (input) => {
    return calculateNpv(input.discountRate, input.cashFlows);
  }
};