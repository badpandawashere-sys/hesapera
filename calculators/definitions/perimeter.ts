import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculatePerimeter } from '../formulas/perimeter';

const schema = z.object({
  sekil: z.enum(['Kare', 'Dikdörtgen', 'Üçgen', 'Daire', 'Paralelkenar', 'Yamuk']),
  birim: z.enum(['cm', 'm', 'mm']),
  kenarA: z.number().positive().optional(),
  kenarB: z.number().positive().optional(),
  kenarC: z.number().positive().optional(),
  kenarD: z.number().positive().optional(),
  yaricap: z.number().positive().optional()
}).superRefine((data, ctx) => {
  const req = (val: number | undefined, path: string) => {
    if (val === undefined || val <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bu şekil için bu alan zorunludur ve pozitif olmalıdır.", path: [path] });
    }
  };

  switch (data.sekil) {
    case 'Kare': 
      req(data.kenarA, 'kenarA'); 
      break;
    case 'Dikdörtgen': 
    case 'Paralelkenar':
      req(data.kenarA, 'kenarA'); 
      req(data.kenarB, 'kenarB'); 
      break;
    case 'Üçgen': 
      req(data.kenarA, 'kenarA'); 
      req(data.kenarB, 'kenarB'); 
      req(data.kenarC, 'kenarC'); 
      if (data.kenarA && data.kenarB && data.kenarC) {
        const { kenarA: a, kenarB: b, kenarC: c } = data;
        if (a + b <= c || a + c <= b || b + c <= a) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Üçgen eşitsizliği kuralına uymuyor. Kenarlar bir üçgen oluşturamaz.", path: ['kenarA'] });
        }
      }
      break;
    case 'Daire': 
      req(data.yaricap, 'yaricap'); 
      break;
    case 'Yamuk': 
      req(data.kenarA, 'kenarA'); 
      req(data.kenarB, 'kenarB'); 
      req(data.kenarC, 'kenarC'); 
      req(data.kenarD, 'kenarD'); 
      break;
  }
});

type Input = z.infer<typeof schema>;

export const perimeterCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_perimeter_001',
  slug: 'cevre',
  status: 'published',
  name: 'Çevre Hesaplama',
  shortDescription: 'Kare, dikdörtgen, üçgen, daire, paralelkenar veya yamuğun çevre uzunluğunu hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Çevre Hesaplama Aracı | Hesapera',
    description: 'Kare, dikdörtgen, üçgen, daire, paralelkenar ve yamuk şekillerinin çevre uzunluğunu hesaplayın.',
    keywords: ["çevre hesaplama", "üçgen çevre", "daire çevre", "geometrik çevre"],
    canonical: 'https://hesapera.com/cevre',
    faq: [],
    relatedCalculators: ["alan"]
  },
  fields: [
    {
      id: "sekil",
      label: "Geometrik Şekil",
      type: "select",
      required: true,
      defaultValue: "Kare",
      options: [
        { label: "Kare", value: "Kare" },
        { label: "Dikdörtgen", value: "Dikdörtgen" },
        { label: "Üçgen", value: "Üçgen" },
        { label: "Daire", value: "Daire" },
        { label: "Paralelkenar", value: "Paralelkenar" },
        { label: "Yamuk", value: "Yamuk" }
      ]
    },
    {
      id: 'birim',
      label: 'Kullanılacak Ölçü Birimi',
      type: 'select',
      required: true,
      options: [
        { label: 'Santimetre (cm)', value: 'cm' },
        { label: 'Metre (m)', value: 'm' },
        { label: 'Milimetre (mm)', value: 'mm' }
      ],
      defaultValue: 'cm'
    },
    { id: 'kenarA', label: 'Birinci Kenar (a)', type: 'number', required: false },
    { id: 'kenarB', label: 'İkinci Kenar (b)', type: 'number', required: false },
    { id: 'kenarC', label: 'Üçüncü Kenar (c)', type: 'number', required: false },
    { id: 'kenarD', label: 'Dördüncü Kenar (d)', type: 'number', required: false },
    { id: 'yaricap', label: 'Yarıçap (r)', type: 'number', required: false }
  ],
  schema,
  calculate: (input) => {
    return calculatePerimeter(input);
  }
};


