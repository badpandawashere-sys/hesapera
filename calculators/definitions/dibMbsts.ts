import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateDibMbsts } from '../formulas/dibMbsts';

const schema = z.object({
  correct: z.number().int().min(0).max(100),
  wrong: z.number().int().min(0).max(100)
});

type Input = z.infer<typeof schema>;

export const dibMbstsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_dibMbsts_001',
  slug: 'dib-mbsts-puan',
  status: 'draft',
  name: 'DİB MBSTS Puan Hesaplama',
  shortDescription: '2026-DİB-MBSTS sınavı (29 Mart 2026) doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'DİB MBSTS Puan Hesaplama Aracı | Hesapera',
    description: '2026-DİB-MBSTS sınavı (29 Mart 2026) doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
    keywords: ["dib mbsts puan","mbsts hesaplama","diyanet sınav puanı"],
    canonical: 'https://hesapera.com/dib-mbsts-puan',
    faq: [],
    relatedCalculators: ["ales-puan","ags-puan"]
  },
  fields: [
  {
    "id": "correct",
    "label": "Doğru Sayısı",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 100
  },
  {
    "id": "wrong",
    "label": "Yanlış Sayısı",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 100
  }
],
  schema,
  calculate: (input) => {
    return calculateDibMbsts(input.correct, input.wrong);
  }
};

