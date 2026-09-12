import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAles } from '../formulas/ales';

const schema = z.object({
  sayCorrect: z.number().int().min(0).max(50),
  sayWrong: z.number().int().min(0).max(50),
  sozCorrect: z.number().int().min(0).max(50),
  sozWrong: z.number().int().min(0).max(50)
});

type Input = z.infer<typeof schema>;

export const alesCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ales_001',
  slug: 'ales-puan',
  status: 'draft',
  name: 'ALES Puan Hesaplama',
  shortDescription: 'ALES Sayısal, Sözel ve Eşit Ağırlık (EA) puanlarınızı ÖSYM katsayı standartlarıyla hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'ALES Puan Hesaplama Aracı | Hesapera',
    description: 'ALES Sayısal, Sözel ve Eşit Ağırlık (EA) puanlarınızı ÖSYM katsayı standartlarıyla hesaplayın.',
    keywords: ["ales puan hesaplama","ales say","ales söz","ales ea"],
    canonical: 'https://hesapera.com/ales-puan',
    faq: [],
    relatedCalculators: ["dgs-puan","ags-puan"]
  },
  fields: [
  {
    "id": "sayCorrect",
    "label": "Sayısal Doğru",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 50
  },
  {
    "id": "sayWrong",
    "label": "Sayısal Yanlış",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 50
  },
  {
    "id": "sozCorrect",
    "label": "Sözel Doğru",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 50
  },
  {
    "id": "sozWrong",
    "label": "Sözel Yanlış",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 50
  }
],
  schema,
  calculate: (input) => {
    return calculateAles(input.sayCorrect, input.sayWrong, input.sozCorrect, input.sozWrong);
  }
};

