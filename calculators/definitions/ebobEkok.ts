import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateEbobEkok } from '../formulas/ebobEkok';

const schema = z.object({
  numbers: z.array(
    z.object({
      value: z.number({ message: "Lütfen geçerli bir sayı giriniz." })
        .int("Lütfen tam sayı giriniz.")
        .min(1, "1 veya daha büyük tam sayı giriniz.")
    })
  ).min(2, "En az iki sayı girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const ebobEkokCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ebob_ekok_001',
  slug: 'ebob-ekok',
  status: 'published',
  name: 'EBOB EKOK Hesaplama',
  shortDescription: 'İki veya daha fazla pozitif tam sayının En Büyük Ortak Bölenini (EBOB) ve En Küçük Ortak Katını (EKOK) hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'EBOB EKOK Hesaplama | Hesapera',
    description: 'Pozitif tam sayılar için EBOB (En Büyük Ortak Bölen) ve EKOK (En Küçük Ortak Kat) değerlerini anında hesaplayın.',
    keywords: ['ebob hesaplama', 'ekok hesaplama', 'en büyük ortak bölen', 'en küçük ortak kat', 'gcd lcm hesaplama', 'çoklu ebob ekok'],
    canonical: 'https://hesapera.com/ebob-ekok',
    faq: [],
    relatedCalculators: ['asal-carpan', 'faktoriyel']
  },
  fields: [
    {
      id: 'numbers',
      label: 'Sayılar',
      type: 'array',
      required: true,
      defaultValue: [{ value: undefined }, { value: undefined }],
      subFields: [
        { id: 'value', label: 'Sayı', type: 'number', required: true, min: 1 }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateEbobEkok(input)
};
