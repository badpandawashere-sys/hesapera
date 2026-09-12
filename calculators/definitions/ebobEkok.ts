import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateEbobEkok } from '../formulas/ebobEkok';

const schema = z.object({
  a: z.number().int("Lütfen tam sayı giriniz.").min(1, "1 veya daha büyük tam sayı giriniz."),
  b: z.number().int("Lütfen tam sayı giriniz.").min(1, "1 veya daha büyük tam sayı giriniz.")
});

type Input = z.infer<typeof schema>;

export const ebobEkokCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ebob_ekok_001',
  slug: 'ebob-ekok',
  name: 'EBOB EKOK Hesaplama',
  shortDescription: 'İki pozitif tam sayının En Büyük Ortak Bölenini (EBOB/GCD) ve En Küçük Ortak Katını (EKOK/LCM) hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'EBOB EKOK Hesaplama | Hesapera',
    description: 'İki pozitif tam sayı için EBOB (En Büyük Ortak Bölen) ve EKOK (En Küçük Ortak Kat) değerlerini Öklid algoritmasıyla hesaplayın.',
    keywords: ['ebob hesaplama', 'ekok hesaplama', 'en büyük ortak bölen', 'en küçük ortak kat', 'gcd lcm hesaplama'],
    canonical: 'https://hesapera.com/ebob-ekok',
    faq: [],
    relatedCalculators: ['asal-carpan', 'faktoriyel']
  },
  fields: [
    { id: 'a', label: 'Birinci Sayı (a)', type: 'number', required: true, min: 1 },
    { id: 'b', label: 'İkinci Sayı (b)', type: 'number', required: true, min: 1 }
  ],
  schema,
  calculate: (input) => calculateEbobEkok(input)
};
