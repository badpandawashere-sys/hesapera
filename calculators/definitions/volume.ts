import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateVolume } from '../formulas/volume';

const sekilEnum = z.enum(['Küp', 'Dikdörtgenler Prizması', 'Küre', 'Silindir', 'Koni']);

const schema = z.object({
  sekil: sekilEnum.default('Dikdörtgenler Prizması'),
  birim: z.enum(['m', 'cm']).default('m'),
  kenarA: z.number().positive("Pozitif değer olmalıdır.").finite("Geçersiz (Infinity)").refine(v => !isNaN(v), "Geçersiz (NaN)").optional(),
  kenarB: z.number().positive("Pozitif değer olmalıdır.").finite("Geçersiz (Infinity)").refine(v => !isNaN(v), "Geçersiz (NaN)").optional(),
  kenarC: z.number().positive("Pozitif değer olmalıdır.").finite("Geçersiz (Infinity)").refine(v => !isNaN(v), "Geçersiz (NaN)").optional(),
  yaricap: z.number().positive("Pozitif değer olmalıdır.").finite("Geçersiz (Infinity)").refine(v => !isNaN(v), "Geçersiz (NaN)").optional(),
  yukseklik: z.number().positive("Pozitif değer olmalıdır.").finite("Geçersiz (Infinity)").refine(v => !isNaN(v), "Geçersiz (NaN)").optional()
}).superRefine((data, ctx) => {
  const req = (val: number | undefined, path: string) => {
    if (val === undefined || val <= 0 || isNaN(val) || !isFinite(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bu şekil için zorunlu ve geçerli bir değer olmalıdır.", path: [path] });
    }
  };
  switch (data.sekil) {
    case 'Küp': 
      req(data.kenarA, 'kenarA'); 
      break;
    case 'Dikdörtgenler Prizması': 
      req(data.kenarA, 'kenarA'); req(data.kenarB, 'kenarB'); req(data.kenarC, 'kenarC'); 
      break;
    case 'Küre': 
      req(data.yaricap, 'yaricap'); 
      break;
    case 'Silindir': 
      req(data.yaricap, 'yaricap'); req(data.yukseklik, 'yukseklik'); 
      break;
    case 'Koni': 
      req(data.yaricap, 'yaricap'); req(data.yukseklik, 'yukseklik'); 
      break;
  }
});

type Input = z.infer<typeof schema>;

export const volumeCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_volume_029',
  slug: 'hacim',
  status: 'published',
  name: 'Hacim Hesaplama',
  shortDescription: 'Küp, dikdörtgenler prizması, küre, silindir ve koni gibi geometrik cisimlerin hacmini pratik olarak hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Hacim Hesaplama Aracı | Hesapera',
    description: 'Farklı geometrik cisimlerin (Küp, Dikdörtgenler Prizması, Küre, Silindir, Koni) hacmini matematiksel formüllerle kolayca hesaplayın.',
    keywords: ["hacim hesaplama", "küp hacmi", "silindir hacmi", "küre hacmi", "koni hacmi", "prizma hacmi"],
    canonical: 'https://hesapera.com.tr/hesaplama/hacim',
    faq: [],
    relatedCalculators: ["alan", "cevre"]
  },
  fields: [
    {
      id: 'sekil',
      label: 'Geometrik Şekil',
      type: 'select',
      required: true,
      defaultValue: 'Dikdörtgenler Prizması',
      options: [
        { label: 'Dikdörtgenler Prizması', value: 'Dikdörtgenler Prizması' },
        { label: 'Küp', value: 'Küp' },
        { label: 'Silindir', value: 'Silindir' },
        { label: 'Küre', value: 'Küre' },
        { label: 'Koni', value: 'Koni' }
      ]
    },
    {
      id: 'birim',
      label: 'Birim',
      type: 'select',
      required: true,
      defaultValue: 'm',
      options: [
        { label: 'Metre (m)', value: 'm' },
        { label: 'Santimetre (cm)', value: 'cm' }
      ]
    },
    {
      id: 'kenarA',
      label: 'Uzunluk (a)',
      type: 'number',
      required: true,
      min: 0.01,
      step: 0.01,
      conditions: [
        { fieldId: 'sekil', operator: 'in', value: ['Küp', 'Dikdörtgenler Prizması'] }
      ]
    },
    {
      id: 'kenarB',
      label: 'Genişlik (b)',
      type: 'number',
      required: true,
      min: 0.01,
      step: 0.01,
      conditions: [
        { fieldId: 'sekil', operator: 'equals', value: 'Dikdörtgenler Prizması' }
      ]
    },
    {
      id: 'kenarC',
      label: 'Yükseklik (c)',
      type: 'number',
      required: true,
      min: 0.01,
      step: 0.01,
      conditions: [
        { fieldId: 'sekil', operator: 'equals', value: 'Dikdörtgenler Prizması' }
      ]
    },
    {
      id: 'yaricap',
      label: 'Yarıçap (r)',
      type: 'number',
      required: true,
      min: 0.01,
      step: 0.01,
      conditions: [
        { fieldId: 'sekil', operator: 'in', value: ['Küre', 'Silindir', 'Koni'] }
      ]
    },
    {
      id: 'yukseklik',
      label: 'Yükseklik (h)',
      type: 'number',
      required: true,
      min: 0.01,
      step: 0.01,
      conditions: [
        { fieldId: 'sekil', operator: 'in', value: ['Silindir', 'Koni'] }
      ]
    }
  ],
  schema,
  calculate: (input) => {
    return calculateVolume(input);
  }
};

