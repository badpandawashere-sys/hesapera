import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMetrekare } from '../formulas/metrekare';

const schema = z.object({
  uzunluk: z.number()
    .positive('Uzunluk 0\'dan büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)'),
  genislik: z.number()
    .positive('Genişlik 0\'dan büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)'),
  birim: z.enum(['m', 'cm']).default('m')
});

type Input = z.infer<typeof schema>;

export const metrekareCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_metrekare_028',
  slug: 'metrekare',
  name: 'Metrekare Hesaplama',
  shortDescription: 'Bir zemin, duvar veya odanın alanını metrekare (m²) cinsinden pratik olarak hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Metrekare Hesaplama Aracı | Hesapera',
    description: 'Uzunluk ve genişlik değerlerini girerek kolayca metrekare (m²) hesaplayın. Santimetre ve metre giriş desteği ile alan hesaplayıcı.',
    keywords: ["metrekare hesaplama", "m2 hesaplama", "alan hesaplama", "oda metrekaresi", "duvar metrekaresi"],
    canonical: 'https://hesapera.com/hesaplama/metrekare',
    faq: [],
    relatedCalculators: ["alan"]
  },
  fields: [
    {
      id: "uzunluk",
      label: "Uzunluk",
      type: "number",
      required: true,
      min: 0.01,
      step: 0.01,
      placeholder: "5"
    },
    {
      id: "genislik",
      label: "Genişlik",
      type: "number",
      required: true,
      min: 0.01,
      step: 0.01,
      placeholder: "4"
    },
    {
      id: "birim",
      label: "Girdi Birimi",
      type: "select",
      required: true,
      options: [
        { label: "Metre (m)", value: "m" },
        { label: "Santimetre (cm)", value: "cm" }
      ],
      defaultValue: "m"
    }
  ],
  schema,
  calculate: (input) => {
    return calculateMetrekare(input.uzunluk, input.genislik, input.birim);
  }
};
