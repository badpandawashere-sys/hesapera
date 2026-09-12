import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAreaGeometry } from '../formulas/areaGeometry';

const schema = z.discriminatedUnion('shape', [
  z.object({
    shape: z.literal('square'),
    side: z.number().positive()
  }),
  z.object({
    shape: z.literal('rectangle'),
    length: z.number().positive(),
    width: z.number().positive()
  }),
  z.object({
    shape: z.literal('triangle'),
    base: z.number().positive(),
    height: z.number().positive()
  }),
  z.object({
    shape: z.literal('circle'),
    radius: z.number().positive()
  })
]);

type Input = z.infer<typeof schema>;

export const areaGeometryCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_areaGeometry_001',
  slug: 'alan-hesaplama',
  status: 'draft',
  name: 'Alan Hesaplama',
  shortDescription: 'Kare, dikdörtgen, üçgen veya dairenin alanını hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Alan Hesaplama Aracı | Hesapera',
    description: 'Kare, dikdörtgen, üçgen veya dairenin alanını hesaplayın.',
    keywords: ["alan hesaplama","üçgen alanı","daire alanı","metrekare"],
    canonical: 'https://hesapera.com/alan-hesaplama',
    faq: [],
    relatedCalculators: ["cevre-hesaplama","hacim-hesaplama","metrekare-hesaplama"]
  },
  fields: [
  {
    "id": "shape",
    "label": "Geometrik Şekil",
    "type": "select",
    "required": true,
    "defaultValue": "square",
    "options": [
      {
        "label": "Kare",
        "value": "square"
      },
      {
        "label": "Dikdörtgen",
        "value": "rectangle"
      },
      {
        "label": "Üçgen",
        "value": "triangle"
      },
      {
        "label": "Daire",
        "value": "circle"
      }
    ]
  },
  {
    "id": "side",
    "label": "Kenar (m)",
    "type": "number",
    "conditions": [
      {
        "fieldId": "shape",
        "operator": "equals",
        "value": "square"
      }
    ]
  },
  {
    "id": "length",
    "label": "Uzunluk (m)",
    "type": "number",
    "conditions": [
      {
        "fieldId": "shape",
        "operator": "equals",
        "value": "rectangle"
      }
    ]
  },
  {
    "id": "width",
    "label": "Genişlik (m)",
    "type": "number",
    "conditions": [
      {
        "fieldId": "shape",
        "operator": "equals",
        "value": "rectangle"
      }
    ]
  },
  {
    "id": "base",
    "label": "Taban (m)",
    "type": "number",
    "conditions": [
      {
        "fieldId": "shape",
        "operator": "equals",
        "value": "triangle"
      }
    ]
  },
  {
    "id": "height",
    "label": "Yükseklik (m)",
    "type": "number",
    "conditions": [
      {
        "fieldId": "shape",
        "operator": "equals",
        "value": "triangle"
      }
    ]
  },
  {
    "id": "radius",
    "label": "Yarıçap (m)",
    "type": "number",
    "conditions": [
      {
        "fieldId": "shape",
        "operator": "equals",
        "value": "circle"
      }
    ]
  }
],
  schema,
  calculate: (input) => {
    return calculateAreaGeometry(input);
  }
};


