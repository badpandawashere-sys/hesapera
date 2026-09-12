import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAks } from '../formulas/aks';

const schema = z.object({
  correct: z.number().int().min(0).max(100),
  wrong: z.number().int().min(0).max(100)
});

type Input = z.infer<typeof schema>;

export const aksCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_aks_001',
  slug: 'aks-puan',
  status: 'draft',
  name: 'AKS Puan Hesaplama',
  shortDescription: 'MEB Adaylık Kaldırma Sınavı (AKS) sonucunuzu hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'AKS Puan Hesaplama Aracı | Hesapera',
    description: 'MEB Adaylık Kaldırma Sınavı (AKS) sonucunuzu hesaplayın.',
    keywords: ["aks puan hesaplama","adaylık kaldırma sınavı","aks kaç puan"],
    canonical: 'https://hesapera.com/aks-puan',
    faq: [],
    relatedCalculators: ["ags-puan"]
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
    return calculateAks(input.correct, input.wrong);
  }
};

