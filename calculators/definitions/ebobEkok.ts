import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateEbobEkok } from '../formulas/ebobEkok';

const schema = z.object({
  numbers: z.array(
    z.object({
      value: z.number({ message: "Lütfen geçerli bir sayý giriniz." })
        .int("Lütfen tam sayý giriniz.")
        .min(1, "1 veya daha büyük tam sayý giriniz.")
    })
  ).min(2, "En az iki sayý girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const ebobEkokCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ebob_ekok_001',
  slug: 'ebob-ekok',
  status: 'published',
  name: 'EBOB EKOK Hesaplama',
  shortDescription: 'Ýki veya daha fazla pozitif tam sayýnýn En Büyük Ortak Bölenini (EBOB) ve En Küçük Ortak Katýný (EKOK) hesaplayýn.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'EBOB EKOK Hesaplama | Hesapera',
    description: 'Pozitif tam sayýlar için EBOB (En Büyük Ortak Bölen) ve EKOK (En Küçük Ortak Kat) deðerlerini anýnda hesaplayýn.',
    keywords: ['ebob hesaplama', 'ekok hesaplama', 'en büyük ortak bölen', 'en küçük ortak kat', 'gcd lcm hesaplama', 'çoklu ebob ekok'],
    canonical: 'https://hesapera.com/ebob-ekok',
    faq: [],
    relatedCalculators: ['asal-carpan', 'faktoriyel']
  },
  fields: [
    {
      id: 'numbers',
      label: 'Sayýlar',
      type: 'array',
      required: true,
      defaultValue: [{ value: undefined }, { value: undefined }],
      subFields: [
        { id: 'value', label: 'Sayý', type: 'number', required: true, min: 1 }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateEbobEkok(input)
};
