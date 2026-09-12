import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateInflation } from '../formulas/inflation';

const schema = z.object({
  startAmount: z.number()
    .min(0, 'Başlangıç tutarı 0 veya daha büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)'),
  startIndex: z.number()
    .positive('Başlangıç endeksi 0\'dan büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)'),
  endIndex: z.number()
    .positive('Bitiş endeksi 0\'dan büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)')
});

type Input = z.infer<typeof schema>;

export const inflationCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_inflation_025',
  slug: 'enflasyon',
  status: 'published',
  name: 'Enflasyon Hesaplama',
  shortDescription: 'Başlangıç ve bitiş endeks (TÜFE) değerlerini girerek parasal tutarın enflasyon karşısındaki değişimini hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Enflasyon Hesaplama Aracı | Hesapera',
    description: 'Başlangıç ve bitiş endeks (TÜFE) değerlerini girerek parasal tutarın enflasyon karşısındaki değişimini, enflasyon oranını ve fiyat artışını anında hesaplayın.',
    keywords: ["enflasyon hesaplama","parasal değer","tüfe hesaplama","fiyat artışı"],
    canonical: 'https://hesapera.com.tr/hesaplama/enflasyon',
    faq: [],
    relatedCalculators: ["birikim","bilesik-buyume","faiz"]
  },
  fields: [
    {
      id: "startAmount",
      label: "Başlangıç Tutarı (TL)",
      type: "currency",
      required: true,
      min: 0,
      placeholder: "1000"
    },
    {
      id: "startIndex",
      label: "Başlangıç Dönemi Endeksi",
      type: "number",
      required: true,
      min: 0.01,
      step: 0.01,
      placeholder: "100"
    },
    {
      id: "endIndex",
      label: "Bitiş Dönemi Endeksi",
      type: "number",
      required: true,
      min: 0.01,
      step: 0.01,
      placeholder: "120"
    }
  ],
  schema,
  calculate: (input) => {
    return calculateInflation(input.startAmount, input.startIndex, input.endIndex);
  }
};

