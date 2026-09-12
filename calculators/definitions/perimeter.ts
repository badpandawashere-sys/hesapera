import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculatePerimeter } from '../formulas/perimeter';

const sekilEnum = z.enum(['Kare', 'Dikdörtgen', 'Üçgen', 'Paralelkenar', 'Yamuk', 'Daire']);
const birimEnum = z.enum(['cm', 'm', 'mm']);

const schema = z.object({
  sekil: sekilEnum.default('Dikdörtgen'),
  birim: birimEnum.default('cm'),
  kenarA: z.number().optional(),
  kenarB: z.number().optional(),
  kenarC: z.number().optional(),
  kenarD: z.number().optional(),
  yaricap: z.number().optional()
}).superRefine((data, ctx) => {
  const requireField = (val: number | undefined, path: string) => {
    if (val === undefined || isNaN(val) || val <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bu şekil için bu alan zorunludur ve 0'dan büyük olmalıdır.", path: [path] });
      return false;
    }
    return true;
  };

  if (data.sekil === 'Kare') {
    requireField(data.kenarA, 'kenarA');
  } else if (data.sekil === 'Dikdörtgen' || data.sekil === 'Paralelkenar') {
    requireField(data.kenarA, 'kenarA');
    requireField(data.kenarB, 'kenarB');
  } else if (data.sekil === 'Üçgen') {
    const aValid = requireField(data.kenarA, 'kenarA');
    const bValid = requireField(data.kenarB, 'kenarB');
    const cValid = requireField(data.kenarC, 'kenarC');

    if (aValid && bValid && cValid && data.kenarA! && data.kenarB! && data.kenarC!) {
      const a = data.kenarA;
      const b = data.kenarB;
      const c = data.kenarC;
      if (a + b <= c || a + c <= b || b + c <= a) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Geçersiz üçgen: Herhangi iki kenarın toplamı üçüncü kenardan büyük olmalıdır.", path: ['kenarA'] });
      }
    }
  } else if (data.sekil === 'Yamuk') {
    requireField(data.kenarA, 'kenarA');
    requireField(data.kenarB, 'kenarB');
    requireField(data.kenarC, 'kenarC');
    requireField(data.kenarD, 'kenarD');
  } else if (data.sekil === 'Daire') {
    requireField(data.yaricap, 'yaricap');
  }
});

type Input = z.infer<typeof schema>;

export const perimeterCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_perimeter_001',
  slug: 'cevre',
  status: 'published',
  name: 'Çevre Hesaplama',
  shortDescription: 'Kare, dikdörtgen, üçgen, paralelkenar, yamuk veya daire gibi geometrik şekillerin çevre uzunluğunu hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Çevre Hesaplama (Kare, Üçgen, Daire, Dikdörtgen) | Hesapera',
    description: 'Farklı geometrik şekillerin (Kare, Dikdörtgen, Üçgen, Daire, Paralelkenar, Yamuk) çevre uzunluğunu santimetre, metre veya milimetre cinsinden anında hesaplayın.',
    keywords: ['çevre hesaplama', 'üçgenin çevresi', 'dairenin çevresi', 'dikdörtgen çevre hesabı', 'geometrik çevre', 'çevre uzunluğu'],
    canonical: 'https://hesapera.com.tr/hesaplama/cevre',
    faq: [],
    relatedCalculators: ["alan", "hacim"]
  },
  fields: [
    {
      id: 'sekil',
      label: 'Geometrik Şekil',
      type: 'select',
      required: true,
      options: [
        { label: 'Kare', value: 'Kare' },
        { label: 'Dikdörtgen', value: 'Dikdörtgen' },
        { label: 'Üçgen', value: 'Üçgen' },
        { label: 'Paralelkenar', value: 'Paralelkenar' },
        { label: 'Yamuk', value: 'Yamuk' },
        { label: 'Daire', value: 'Daire' }
      ],
      defaultValue: 'Dikdörtgen'
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
    {
      id: 'kenarA',
      label: '1. Kenar / Taban / Alt Taban (a)',
      type: 'number',
      required: false,
      conditions: [{ fieldId: 'sekil', operator: 'in', value: ['Kare', 'Dikdörtgen', 'Üçgen', 'Paralelkenar', 'Yamuk'] }]
    },
    {
      id: 'kenarB',
      label: '2. Kenar / Yan Kenar / Üst Taban (b)',
      type: 'number',
      required: false,
      conditions: [{ fieldId: 'sekil', operator: 'in', value: ['Dikdörtgen', 'Üçgen', 'Paralelkenar', 'Yamuk'] }]
    },
    {
      id: 'kenarC',
      label: '3. Kenar / 1. Yan Kenar (c)',
      type: 'number',
      required: false,
      conditions: [{ fieldId: 'sekil', operator: 'in', value: ['Üçgen', 'Yamuk'] }]
    },
    {
      id: 'kenarD',
      label: '4. Kenar / 2. Yan Kenar (d)',
      type: 'number',
      required: false,
      conditions: [{ fieldId: 'sekil', operator: 'equals', value: 'Yamuk' }]
    },
    {
      id: 'yaricap',
      label: 'Yarıçap (r)',
      type: 'number',
      required: false,
      conditions: [{ fieldId: 'sekil', operator: 'equals', value: 'Daire' }]
    }
  ],
  schema,
  calculate: (input) => calculatePerimeter(input)
};
