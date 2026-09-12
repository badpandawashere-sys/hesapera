import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateIrr } from '../formulas/irr';

const schema = z.object({
  cashFlows: z.array(z.object({
    period: z.number().min(0, 'Dönem 0 dan küçük olamaz'),
    amount: z.number()
  })).min(2, 'En az 2 satır giriniz')
});

type Input = z.infer<typeof schema>;

export const irrCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_irr_001',
  slug: 'ic-verim-orani',
  name: 'İç Verim Oranı Hesaplama',
  shortDescription: 'Bir dizi yatırım veya nakit akışının beklenen getiri oranını (IRR) hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'İç Verim Oranı Hesaplama Aracı | Hesapera',
    description: 'Bir dizi yatırım veya nakit akışının beklenen getiri oranını (IRR) hesaplayın.',
    keywords: ["iç verim oranı","irr hesaplama","yatırım getirisi","nakit akışı","internal rate of return"],
    canonical: 'https://hesapera.com/ic-verim-orani',
    faq: [],
    relatedCalculators: ["net-bugunku-deger","bono","eurobond","birikim"]
  },
  fields: [
  {
    "id": "cashFlows",
    "label": "Nakit Akışları (Cash Flows)",
    "type": "array",
    "required": true,
    "subFields": [
      {
        "id": "period",
        "label": "Dönem (Ay/Yıl)",
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
    return calculateIrr(input.cashFlows);
  }
};