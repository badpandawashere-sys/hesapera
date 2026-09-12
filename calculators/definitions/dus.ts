import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateDus } from '../formulas/dus';

const schema = z.object({
  temelCorrect: z.number().int().min(0).max(80),
  temelWrong: z.number().int().min(0).max(80),
  klinikCorrect: z.number().int().min(0).max(120),
  klinikWrong: z.number().int().min(0).max(120)
});

type Input = z.infer<typeof schema>;

export const dusCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_dus_001',
  slug: 'dus-puan',
  status: 'draft',
  name: 'DUS Puan Hesaplama',
  shortDescription: '2026-DUS (Diş Hekimliği Uzmanlık Sınavı) Temel ve Klinik Bilimler testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'DUS Puan Hesaplama Aracı | Hesapera',
    description: '2026-DUS (Diş Hekimliği Uzmanlık Sınavı) Temel ve Klinik Bilimler testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
    keywords: ["dus puan hesaplama","dis hekimligi uzmanlik sinavi","dus 2026"],
    canonical: 'https://hesapera.com/dus-puan',
    faq: [],
    relatedCalculators: ["ales-puan"]
  },
  fields: [
  {
    "id": "temelCorrect",
    "label": "Temel Bilimler Doğru",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 80
  },
  {
    "id": "temelWrong",
    "label": "Temel Bilimler Yanlış",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 80
  },
  {
    "id": "klinikCorrect",
    "label": "Klinik Bilimler Doğru",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 120
  },
  {
    "id": "klinikWrong",
    "label": "Klinik Bilimler Yanlış",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 120
  }
],
  schema,
  calculate: (input) => {
    return calculateDus(input.temelCorrect, input.temelWrong, input.klinikCorrect, input.klinikWrong);
  }
};

