import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateArea } from '../formulas/area';

const schema = z.object({
  length: z.number().positive('Uzunluk 0 dan büyük olmalıdır'),
  width: z.number().positive('Genişlik 0 dan büyük olmalıdır')
});

type Input = z.infer<typeof schema>;

export const areaCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_area_001',
  slug: 'metrekare-hesaplama',
  name: 'Metrekare Hesaplama',
  shortDescription: 'Uzunluk ve genişlik girerek bir alanın metrekaresini (m²) hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Metrekare Hesaplama Aracı | Hesapera',
    description: 'Uzunluk ve genişlik girerek bir alanın metrekaresini (m²) hesaplayın.',
    keywords: ["metrekare hesaplama","alan hesaplama","m2 hesaplama"],
    canonical: 'https://hesapera.com/metrekare-hesaplama',
    faq: [],
    relatedCalculators: []
  },
  fields: [
  {
    "id": "length",
    "label": "Uzunluk (m)",
    "type": "number",
    "required": true
  },
  {
    "id": "width",
    "label": "Genişlik (m)",
    "type": "number",
    "required": true
  }
],
  schema,
  calculate: (input) => {
    return calculateArea(
      input.length, input.width
    );
  }
};
