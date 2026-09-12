import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateRatio } from '../formulas/ratio';

const schema = z.object({
  firstValue: z.number().min(0, 'Değer negatif olamaz'),
  secondValue: z.number().positive('Payda sıfırdan büyük olmalıdır')
});

type Input = z.infer<typeof schema>;

export const ratioCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ratio_001',
  slug: 'oran-hesaplama',
  status: 'draft',
  name: 'Oran Hesaplama',
  shortDescription: 'İki sayı arasındaki oranı ve yüzde karşılığını anında bulun.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Oran Hesaplama Aracı | Hesapera',
    description: 'İki sayı arasındaki oranı ve yüzde karşılığını anında bulun.',
    keywords: ["oran hesaplama","yüzde oranı","iki sayı arası oran"],
    canonical: 'https://hesapera.com/oran-hesaplama',
    faq: [],
    relatedCalculators: ["yuzde-hesaplama"]
  },
  fields: [
  {
    "id": "firstValue",
    "label": "İlk Sayı (Pay)",
    "type": "number",
    "required": true
  },
  {
    "id": "secondValue",
    "label": "İkinci Sayı (Payda)",
    "type": "number",
    "required": true
  }
],
  schema,
  calculate: (input) => {
    return calculateRatio(
      input.firstValue, input.secondValue
    );
  }
};


