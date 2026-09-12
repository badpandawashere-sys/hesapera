import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCompoundGrowth } from '../formulas/compoundGrowth';

const schema = z.object({
  initialValue: z.number().positive('Başlangıç değeri 0 dan büyük olmalıdır'),
  growthRate: z.number().min(-100, 'Büyüme oranı -100 den küçük olamaz'),
  periods: z.number().int().positive('Dönem pozitif tam sayı olmalıdır')
});

type Input = z.infer<typeof schema>;

export const compoundGrowthCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_compoundGrowth_001',
  slug: 'bilesik-buyume',
  status: 'published',
  name: 'Bileşik Büyüme Hesaplama',
  shortDescription: 'Bir değerin belirli dönemlerde ortalama büyüme oranıyla gelecekteki değerini (Compound Growth) hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Bileşik Büyüme Hesaplama Aracı | Hesapera',
    description: 'Bir değerin belirli dönemlerde ortalama büyüme oranıyla gelecekteki değerini (Compound Growth) hesaplayın.',
    keywords: ["bileşik büyüme","büyüme hesaplama","compound growth","ortalama büyüme"],
    canonical: 'https://hesapera.com/bilesik-buyume',
    faq: [],
    relatedCalculators: ["birikim","bilesik-faiz-hesaplama"]
  },
  fields: [
  {
    "id": "initialValue",
    "label": "Başlangıç Değeri",
    "type": "number",
    "required": true,
    "min": 0
  },
  {
    "id": "growthRate",
    "label": "Büyüme Oranı (Dönemsel %)",
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
    "min": 1
  }
],
  schema,
  calculate: (input) => {
    return calculateCompoundGrowth(input.initialValue, input.growthRate, input.periods);
  }
};

