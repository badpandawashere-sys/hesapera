import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculatePermutation } from '../formulas/permutation';

const schema = z.object({
  n: z.number().int('Tam sayı olmalıdır').min(0).max(170),
  r: z.number().int('Tam sayı olmalıdır').min(0)
}).refine(data => data.r <= data.n, { message: 'r, n den büyük olamaz', path: ['r'] });

type Input = z.infer<typeof schema>;

export const permutationCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_permutation_001',
  slug: 'permutasyon-hesaplama',
  name: 'Permütasyon Hesaplama',
  shortDescription: 'n elemanlı bir kümenin r elemanlı permütasyonlarını (sıralı diziliş) hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Permütasyon Hesaplama Aracı | Hesapera',
    description: 'n elemanlı bir kümenin r elemanlı permütasyonlarını (sıralı diziliş) hesaplayın.',
    keywords: ["permütasyon","sıralama","matematik","olasılık"],
    canonical: 'https://hesapera.com/permutasyon-hesaplama',
    faq: [],
    relatedCalculators: ["kombinasyon-hesaplama","faktoriyel-hesaplama"]
  },
  fields: [
  {
    "id": "n",
    "label": "Eleman Sayısı (n)",
    "type": "number",
    "required": true,
    "max": 170
  },
  {
    "id": "r",
    "label": "Seçim Sayısı (r)",
    "type": "number",
    "required": true
  }
],
  schema,
  calculate: (input) => {
    return calculatePermutation(input.n, input.r);
  }
};
