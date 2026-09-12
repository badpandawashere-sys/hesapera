import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateInc } from '../formulas/inc';

const schema = z.object({
  miktar: z.number().min(0, "Değer 0 veya daha büyük olmalıdır."),
  kaynakBirim: z.enum(['inch', 'cm']),
  hedefBirim: z.enum(['inch', 'cm'])
});

type Input = z.infer<typeof schema>;

export const incCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_inc_001',
  slug: 'inc',
  name: 'İnç Hesaplama',
  shortDescription: 'İnç (inch) ile santimetre (cm) arasında pratik uzunluk dönüşümü yapın. 1 inch = 2.54 cm.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'İnç - Santimetre Dönüştürücü | Hesapera',
    description: 'İnç (inch) ve santimetre (cm) arasında iki yönlü uzunluk birimi dönüşümü yapın. 1 inch = 2.54 cm sabiti ile doğru sonuçlar alın.',
    keywords: ['inç hesaplama', 'inch cm dönüştürme', 'santimetre inç', 'inch kaç cm', 'cm kaç inch'],
    canonical: 'https://hesapera.com/inc',
    faq: [],
    relatedCalculators: ['metrekare', 'cevre', 'alan']
  },
  fields: [
    { id: 'miktar', label: 'Değer', type: 'number', required: true, min: 0 },
    {
      id: 'kaynakBirim',
      label: 'Kaynak Birim',
      type: 'select',
      required: true,
      defaultValue: 'inch',
      options: [
        { label: 'İnç (inch)', value: 'inch' },
        { label: 'Santimetre (cm)', value: 'cm' }
      ]
    },
    {
      id: 'hedefBirim',
      label: 'Hedef Birim',
      type: 'select',
      required: true,
      defaultValue: 'cm',
      options: [
        { label: 'Santimetre (cm)', value: 'cm' },
        { label: 'İnç (inch)', value: 'inch' }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateInc(input)
};
