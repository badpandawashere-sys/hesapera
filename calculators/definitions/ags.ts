import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAgs } from '../formulas/ags';

const schema = z.object({
  gkgyCorrect: z.number().int().min(0).max(40),
  gkgyWrong: z.number().int().min(0).max(40),
  ebCorrect: z.number().int().min(0).max(40),
  ebWrong: z.number().int().min(0).max(40)
});

type Input = z.infer<typeof schema>;

export const agsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ags_001',
  slug: 'ags-puan',
  status: 'draft',
  name: 'AGS Puan Hesaplama',
  shortDescription: 'MEB Akademi Giriş Sınavı (AGS) için doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'AGS Puan Hesaplama Aracı | Hesapera',
    description: 'MEB Akademi Giriş Sınavı (AGS) için doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
    keywords: ["ags puan hesaplama","akademi giriş sınavı","meb ags","2026 ags"],
    canonical: 'https://hesapera.com/ags-puan',
    faq: [],
    relatedCalculators: ["ales-puan","dgs-puan"]
  },
  fields: [
  {
    "id": "gkgyCorrect",
    "label": "Genel Yetenek ve Genel Kültür Doğru",
    "type": "number",
    "required": true,
    "min": 0
  },
  {
    "id": "gkgyWrong",
    "label": "Genel Yetenek ve Genel Kültür Yanlış",
    "type": "number",
    "required": true,
    "min": 0
  },
  {
    "id": "ebCorrect",
    "label": "Eğitim Bilimleri Doğru",
    "type": "number",
    "required": true,
    "min": 0
  },
  {
    "id": "ebWrong",
    "label": "Eğitim Bilimleri Yanlış",
    "type": "number",
    "required": true,
    "min": 0
  }
],
  schema,
  calculate: (input) => {
    return calculateAgs(input.gkgyCorrect, input.gkgyWrong, input.ebCorrect, input.ebWrong);
  }
};

