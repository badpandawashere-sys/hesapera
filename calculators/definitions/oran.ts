import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateOran } from '../formulas/oran';

const schema = z.object({
  a: z.number().int('Tam sayı olmalıdır').positive('Sıfırdan büyük olmalıdır'),
  b: z.number().int('Tam sayı olmalıdır').positive('Sıfırdan büyük olmalıdır')
});

type Input = z.infer<typeof schema>;

export const oranCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_oran_001',
  slug: 'oran',
  name: 'Oran Hesaplama',
  shortDescription: 'İki sayı arasındaki oranı sadeleştirerek en basit formunda bulun.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Oran Hesaplama (Sadeleştirme) | Hesapera',
    description: 'İki sayı arasındaki oranı hesaplayın ve en sade haliyle (A:B) görün. Kesir sadeleştirme aracı.',
    keywords: ["oran hesaplama", "kesir sadeleştirme", "oran orantı", "oran bulma"],
    canonical: 'https://hesapera.com/oran',
    faq: [],
    relatedCalculators: ["ebob-ekok", "yuzde"]
  },
  fields: [
    { id: 'a', label: 'Birinci Sayı (A)', type: 'number', required: true, min: 1 },
    { id: 'b', label: 'İkinci Sayı (B)', type: 'number', required: true, min: 1 }
  ],
  schema,
  calculate: (input) => calculateOran(input)
};
