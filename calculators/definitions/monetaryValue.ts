import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMonetaryValue } from '../formulas/monetaryValue';

const schema = z.object({
  amount: z.number().min(0, 'Tutar negatif olamaz'),
  rate: z.number().min(-100, 'Oran -100 den küçük olamaz'),
  periods: z.number().min(0, 'Dönem sayısı negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const monetaryValueCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_monetaryValue_001',
  slug: 'parasal-deger',
  status: 'draft',
  name: 'Parasal Değer Hesaplama',
  shortDescription: 'Bir parasal tutarın belirli bir değişim (örneğin enflasyon) oranı sonrası nominal değerini hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Parasal Değer Hesaplama Aracı | Hesapera',
    description: 'Bir parasal tutarın belirli bir değişim (örneğin enflasyon) oranı sonrası nominal değerini hesaplayın.',
    keywords: ["parasal değer","enflasyon farkı","nominal değer","paranın bugünkü değeri"],
    canonical: 'https://hesapera.com/parasal-deger',
    faq: [],
    relatedCalculators: ["reel-getiri","enflasyon","faiz"]
  },
  fields: [
  {
    "id": "amount",
    "label": "Başlangıç Tutarı",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "rate",
    "label": "Dönemsel Değişim Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": -100,
    "step": 0.01
  },
  {
    "id": "periods",
    "label": "Dönem Sayısı",
    "type": "number",
    "required": true,
    "min": 0
  }
],
  schema,
  calculate: (input) => {
    return calculateMonetaryValue(input.amount, input.rate, input.periods);
  }
};

