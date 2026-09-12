import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAlan } from '../formulas/alan';

const schema = z.object({
  sekil: z.enum(['Kare', 'Dikdörtgen', 'Üçgen', 'Daire', 'Paralelkenar', 'Yamuk']),
  birim: z.enum(['cm', 'm', 'mm']),
  kenarA: z.number().min(0).optional(),
  kenarB: z.number().min(0).optional(),
  yukseklik: z.number().min(0).optional(),
  yaricap: z.number().min(0).optional(),
  taban: z.number().min(0).optional(),
  ustTaban: z.number().min(0).optional()
}).superRefine((data, ctx) => {
  const requireField = (val: number | undefined, path: string) => {
    if (val === undefined || val <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bu şekil için bu alan zorunludur ve 0'dan büyük olmalıdır.", path: [path] });
    }
  };

  switch (data.sekil) {
    case 'Kare': requireField(data.kenarA, 'kenarA'); break;
    case 'Dikdörtgen': requireField(data.kenarA, 'kenarA'); requireField(data.kenarB, 'kenarB'); break;
    case 'Üçgen': requireField(data.taban, 'taban'); requireField(data.yukseklik, 'yukseklik'); break;
    case 'Daire': requireField(data.yaricap, 'yaricap'); break;
    case 'Paralelkenar': requireField(data.taban, 'taban'); requireField(data.yukseklik, 'yukseklik'); break;
    case 'Yamuk': requireField(data.taban, 'taban'); requireField(data.ustTaban, 'ustTaban'); requireField(data.yukseklik, 'yukseklik'); break;
  }
});

type Input = z.infer<typeof schema>;

export const alanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_alan_001',
  slug: 'alan',
  name: 'Alan Hesaplama',
  shortDescription: 'Kare, dikdörtgen, üçgen, daire, paralelkenar veya yamuk gibi geometrik şekillerin alanını formüllerle hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Geometrik Alan Hesaplama (Kare, Üçgen, Daire, Yamuk) | Hesapera',
    description: 'Farklı geometrik şekillerin (Kare, Dikdörtgen, Üçgen, Daire, Paralelkenar, Yamuk) metrekare ve santimetrekare cinsinden alanını kolayca hesaplayın.',
    keywords: ['alan hesaplama', 'üçgenin alanı', 'dairenin alanı', 'dikdörtgen alan hesabı', 'geometrik alan', 'metrekare hesaplama'],
    canonical: 'https://hesapera.com/alan',
    faq: [],
    relatedCalculators: []
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
        { label: 'Daire', value: 'Daire' },
        { label: 'Paralelkenar', value: 'Paralelkenar' },
        { label: 'Yamuk', value: 'Yamuk' }
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
    { id: 'kenarA', label: 'Birinci Kenar (Kısa Kenar veya Kare Kenarı)', type: 'number', required: false },
    { id: 'kenarB', label: 'İkinci Kenar (Uzun Kenar)', type: 'number', required: false },
    { id: 'taban', label: 'Taban Uzunluğu (veya Yamuk için Alt Taban)', type: 'number', required: false },
    { id: 'ustTaban', label: 'Üst Taban Uzunluğu (Sadece Yamuk)', type: 'number', required: false },
    { id: 'yukseklik', label: 'Yükseklik', type: 'number', required: false },
    { id: 'yaricap', label: 'Yarıçap (Sadece Daire)', type: 'number', required: false }
  ],
  schema,
  calculate: (input) => calculateAlan(input)
};
