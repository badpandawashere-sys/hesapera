import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMil } from '../formulas/mil';

const schema = z.object({
  miktar: z.number()
    .min(0, "Değer 0 veya daha büyük olmalıdır.")
    .finite("Geçersiz değer (Infinity)")
    .refine(v => !isNaN(v), "Geçersiz değer (NaN)"),
  birim: z.enum(['mil', 'km', 'm']).default('mil')
});

type Input = z.infer<typeof schema>;

export const milCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_mil_029',
  slug: 'mil',
  name: 'Mil Hesaplama',
  shortDescription: 'Mil, Kilometre (km) ve Metre (m) arasında hassas uzunluk birimi dönüşümü yapın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Mil Hesaplama Aracı | Hesapera',
    description: 'Mil, kilometre (km) ve metre (m) arasında iki yönlü uzunluk birimi dönüşümü yapın. 1 mil = 1.609344 km sabiti ile doğru hesaplama.',
    keywords: ['mil hesaplama', 'mil km dönüştürme', '1 mil kaç km', 'kilometre mil hesaplama', 'uzunluk ölçüleri'],
    canonical: 'https://hesapera.com/hesaplama/mil',
    faq: [],
    relatedCalculators: ["metrekare"]
  },
  fields: [
    { 
      id: 'miktar', 
      label: 'Değer', 
      type: 'number', 
      required: true, 
      min: 0,
      placeholder: '10' 
    },
    {
      id: 'birim',
      label: 'Birim',
      type: 'select',
      required: true,
      defaultValue: 'mil',
      options: [
        { label: 'Mil (mi)', value: 'mil' },
        { label: 'Kilometre (km)', value: 'km' },
        { label: 'Metre (m)', value: 'm' }
      ]
    }
  ],
  schema,
  calculate: (input) => {
    return calculateMil(input.miktar, input.birim);
  }
};
