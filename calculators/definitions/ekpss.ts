import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateEkpss } from '../formulas/ekpss';

const schema = z.object({
  educationLevel: z.enum(['ortaogretim', 'onlisans', 'lisans']),
  gyCorrect: z.number().int().min(0).max(40),
  gyWrong: z.number().int().min(0).max(40),
  gkCorrect: z.number().int().min(0).max(40),
  gkWrong: z.number().int().min(0).max(40)
});

type Input = z.infer<typeof schema>;

export const ekpssCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ekpss_001',
  slug: 'ekpss-puan',
  status: 'draft',
  name: 'EKPSS Puan Hesaplama',
  shortDescription: '2026-EKPSS (Engelli Kamu Personeli Seçme Sınavı) Genel Yetenek ve Genel Kültür testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'EKPSS Puan Hesaplama Aracı | Hesapera',
    description: '2026-EKPSS (Engelli Kamu Personeli Seçme Sınavı) Genel Yetenek ve Genel Kültür testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
    keywords: ["ekpss puan hesaplama","ekpss 2026","engelli kamu personeli sınavı","ekpss hesabı"],
    canonical: 'https://hesapera.com/ekpss-puan',
    faq: [],
    relatedCalculators: ["ales-puan","ags-puan","kpss-puan"]
  },
  fields: [
  {
    "id": "educationLevel",
    "label": "Eğitim Düzeyi",
    "type": "select",
    "required": true,
    "options": [
      {
        "label": "Ortaöğretim",
        "value": "ortaogretim"
      },
      {
        "label": "Önlisans",
        "value": "onlisans"
      },
      {
        "label": "Lisans",
        "value": "lisans"
      }
    ]
  },
  {
    "id": "gyCorrect",
    "label": "Genel Yetenek Doğru",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 40
  },
  {
    "id": "gyWrong",
    "label": "Genel Yetenek Yanlış",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 40
  },
  {
    "id": "gkCorrect",
    "label": "Genel Kültür Doğru",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 40
  },
  {
    "id": "gkWrong",
    "label": "Genel Kültür Yanlış",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 40
  }
],
  schema,
  calculate: (input) => {
    return calculateEkpss(input.educationLevel, input.gyCorrect, input.gyWrong, input.gkCorrect, input.gkWrong);
  }
};

