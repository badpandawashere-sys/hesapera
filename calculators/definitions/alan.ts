import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAlan } from '../formulas/alan';

const sekilEnum = z.enum(['Kare', 'Dikdörtgen', 'Üçgen', 'Paralelkenar', 'Yamuk', 'Daire', 'Elips']);
const birimEnum = z.enum(['cm', 'm', 'mm']);

const schema = z.object({
  sekil: sekilEnum.default('Dikdörtgen'),
  birim: birimEnum.default('cm'),
  kenarA: z.number().optional(),
  kenarB: z.number().optional(),
  taban: z.number().optional(),
  ustTaban: z.number().optional(),
  yukseklik: z.number().optional(),
  yaricap: z.number().optional(),
  buyukYaricap: z.number().optional(),
  kucukYaricap: z.number().optional()
}).superRefine((data, ctx) => {
  const requireField = (val: number | undefined, path: string) => {
    if (val === undefined || isNaN(val) || val <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bu şekil için bu alan zorunludur ve 0'dan büyük olmalıdır.", path: [path] });
    }
  };

  switch (data.sekil) {
    case 'Kare': requireField(data.kenarA, 'kenarA'); break;
    case 'Dikdörtgen': requireField(data.kenarA, 'kenarA'); requireField(data.kenarB, 'kenarB'); break;
    case 'Üçgen': requireField(data.taban, 'taban'); requireField(data.yukseklik, 'yukseklik'); break;
    case 'Paralelkenar': requireField(data.taban, 'taban'); requireField(data.yukseklik, 'yukseklik'); break;
    case 'Yamuk': requireField(data.taban, 'taban'); requireField(data.ustTaban, 'ustTaban'); requireField(data.yukseklik, 'yukseklik'); break;
    case 'Daire': requireField(data.yaricap, 'yaricap'); break;
    case 'Elips': requireField(data.buyukYaricap, 'buyukYaricap'); requireField(data.kucukYaricap, 'kucukYaricap'); break;
  }
});

type Input = z.infer<typeof schema>;

export const alanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_alan_001',
  slug: 'alan',
  status: 'published',
  name: 'Alan Hesaplama',
  shortDescription: 'Kare, dikdörtgen, üçgen, daire, elips, paralelkenar veya yamuk gibi geometrik şekillerin alanını formüllerle hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Geometrik Alan Hesaplama (Kare, Üçgen, Daire, Yamuk) | Hesapera',
    description: 'Farklı geometrik şekillerin (Kare, Dikdörtgen, Üçgen, Daire, Paralelkenar, Yamuk, Elips) metrekare ve santimetrekare cinsinden alanını kolayca hesaplayın.',
    keywords: ['alan hesaplama', 'üçgenin alanı', 'dairenin alanı', 'dikdörtgen alan hesabı', 'geometrik alan', 'metrekare hesaplama'],
    canonical: 'https://hesapera.com.tr/hesaplama/alan',
    faq: [],
    relatedCalculators: ["cevre", "hacim"]
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
        { label: 'Daire', value: 'Daire' },
        { label: 'Elips', value: 'Elips' }
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
      id: 'kenarA', label: 'Kenar (Kare) / Kısa Kenar (Dikdörtgen)', type: 'number', required: false,
      conditions: [{ fieldId: 'sekil', operator: 'in', value: ['Kare', 'Dikdörtgen'] }]
    },
    {
      id: 'kenarB', label: 'Uzun Kenar', type: 'number', required: false,
      conditions: [{ fieldId: 'sekil', operator: 'equals', value: 'Dikdörtgen' }]
    },
    {
      id: 'taban', label: 'Taban Uzunluğu (Üçgen, Paralelkenar, Yamuk)', type: 'number', required: false,
      conditions: [{ fieldId: 'sekil', operator: 'in', value: ['Üçgen', 'Paralelkenar', 'Yamuk'] }]
    },
    {
      id: 'ustTaban', label: 'Üst Taban Uzunluğu', type: 'number', required: false,
      conditions: [{ fieldId: 'sekil', operator: 'equals', value: 'Yamuk' }]
    },
    {
      id: 'yukseklik', label: 'Yükseklik', type: 'number', required: false,
      conditions: [{ fieldId: 'sekil', operator: 'in', value: ['Üçgen', 'Paralelkenar', 'Yamuk'] }]
    },
    {
      id: 'yaricap', label: 'Yarıçap (r)', type: 'number', required: false,
      conditions: [{ fieldId: 'sekil', operator: 'equals', value: 'Daire' }]
    },
    {
      id: 'buyukYaricap', label: 'Büyük Yarıçap (a)', type: 'number', required: false,
      conditions: [{ fieldId: 'sekil', operator: 'equals', value: 'Elips' }]
    },
    {
      id: 'kucukYaricap', label: 'Küçük Yarıçap (b)', type: 'number', required: false,
      conditions: [{ fieldId: 'sekil', operator: 'equals', value: 'Elips' }]
    }
  ],
  schema,
  calculate: (input) => calculateAlan(input)
};
