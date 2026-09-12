import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateFactorial } from '../formulas/factorial';

const schema = z.object({
  n: z.number({ message: 'Değer girilmelidir' })
    .int('Tam sayı olmalıdır')
    .min(0, 'Negatif sayı faktöriyeli tanımlı değildir')
    .max(2000, 'Çok büyük değerler desteklenmemektedir (Maks. 2000)')
    .finite("Geçersiz (Infinity)")
    .refine(v => !isNaN(v), "Geçersiz (NaN)")
});

type Input = z.infer<typeof schema>;

export const factorialCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_factorial_030',
  slug: 'faktoriyel',
  name: 'Faktöriyel Hesaplama',
  shortDescription: 'Bir tam sayının faktöriyelini (n!) kesin doğrulukla hesaplayın. (n! = n × n-1 ... × 1)',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Faktöriyel Hesaplama Aracı (n!) | Hesapera',
    description: 'Verilen n sayısının faktöriyelini (n!) doğru bir şekilde hesaplayın. Büyük faktöriyeller (BigInt) için kesin değer sonucu veren hesaplayıcı.',
    keywords: ["faktöriyel hesaplama", "n! hesaplama", "faktöriyel formülü", "matematik faktöriyel", "0 faktöriyel"],
    canonical: 'https://hesapera.com/hesaplama/faktoriyel',
    faq: [],
    relatedCalculators: ["kombinasyon", "permutasyon", "ebob-ekok"]
  },
  fields: [
    {
      id: "n",
      label: "Sayı (n)",
      type: "number",
      required: true,
      min: 0,
      max: 2000,
      placeholder: "5"
    }
  ],
  schema,
  calculate: (input) => {
    return calculateFactorial(input.n);
  }
};
