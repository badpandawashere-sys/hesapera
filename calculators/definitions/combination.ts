import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCombination } from '../formulas/combination';

const schema = z.object({
  n: z.number().int('Tam sayı olmalıdır').min(0).max(170),
  r: z.number().int('Tam sayı olmalıdır').min(0)
}).refine(data => data.r <= data.n, { message: 'r, n den büyük olamaz', path: ['r'] });

type Input = z.infer<typeof schema>;

export const combinationCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_combination_001',
  slug: 'kombinasyon',
  name: 'Kombinasyon Hesaplama',
  shortDescription: 'n elemanlı bir kümeden r eleman seçmenin kaç farklı yolu olduğunu BigInt hassasiyetiyle hesaplayın. C(n,r) = n! / (r! × (n-r)!)',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Kombinasyon Hesaplama | Hesapera',
    description: 'n elemanlı bir kümenin r elemanlı kombinasyonlarını (seçim sayısını) BigInt hassasiyetiyle hesaplayın.',
    keywords: ["kombinasyon hesaplama", "C(n,r)", "seçim sayısı", "olasılık hesaplama"],
    canonical: 'https://hesapera.com/kombinasyon',
    faq: [],
    relatedCalculators: ["permutasyon", "faktoriyel", "ebob-ekok"]
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
    return calculateCombination(input.n, input.r);
  }
};
