import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateRealReturn } from '../formulas/realReturn';

const schema = z.object({
  nominalRate: z.number(),
  inflationRate: z.number().min(-99.99, 'Enflasyon oranı -100 olamaz')
});

type Input = z.infer<typeof schema>;

export const realReturnCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_realReturn_001',
  slug: 'reel-getiri',
  name: 'Reel Getiri Hesaplama',
  shortDescription: 'Nominal getiri ve enflasyon oranını dikkate alarak yatırımınızın gerçek reel getirisini hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Reel Getiri Hesaplama Aracı | Hesapera',
    description: 'Nominal getiri ve enflasyon oranını dikkate alarak yatırımınızın gerçek reel getirisini hesaplayın.',
    keywords: ["reel getiri","gerçek getiri","nominal getiri","enflasyondan arındırılmış getiri"],
    canonical: 'https://hesapera.com/reel-getiri',
    faq: [],
    relatedCalculators: ["parasal-deger","enflasyon","faiz"]
  },
  fields: [
  {
    "id": "nominalRate",
    "label": "Nominal Getiri Oranı (%)",
    "type": "percentage",
    "required": true,
    "step": 0.01
  },
  {
    "id": "inflationRate",
    "label": "Enflasyon Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": -99.99,
    "step": 0.01
  }
],
  schema,
  calculate: (input) => {
    return calculateRealReturn(input.nominalRate, input.inflationRate);
  }
};