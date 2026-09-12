import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateDgs } from '../formulas/dgs';

const schema = z.object({
  sayCorrect: z.number().int().min(0).max(50),
  sayWrong: z.number().int().min(0).max(50),
  sozCorrect: z.number().int().min(0).max(50),
  sozWrong: z.number().int().min(0).max(50),
  obp: z.number().min(40).max(80)
});

type Input = z.infer<typeof schema>;

export const dgsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_dgs_001',
  slug: 'dgs-puan',
  name: 'DGS Puan Hesaplama',
  shortDescription: 'Dikey Geçiş Sınavı (DGS) Sayısal, Sözel ve Eşit Ağırlık (EA) puanlarınızı ÖBP dahil şekilde hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'DGS Puan Hesaplama Aracı | Hesapera',
    description: 'Dikey Geçiş Sınavı (DGS) Sayısal, Sözel ve Eşit Ağırlık (EA) puanlarınızı ÖBP dahil şekilde hesaplayın.',
    keywords: ["dgs puan hesaplama","dgs öbp","dikey geçiş sınavı","dgs 2026"],
    canonical: 'https://hesapera.com/dgs-puan',
    faq: [],
    relatedCalculators: ["ales-puan"]
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
  },
  {
    "id": "obp",
    "label": "ÖBP (Önlisans Başarı Puanı)",
    "type": "number",
    "required": true,
    "min": 40,
    "max": 80
  }
],
  schema,
  calculate: (input) => {
    return calculateDgs(input.sayCorrect, input.sayWrong, input.sozCorrect, input.sozWrong, input.obp);
  }
};