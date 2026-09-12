import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateModulerAritmetik } from '../formulas/modulerAritmetik';

const schema = z.object({
  islem: z.enum(['mod', 'toplama', 'cikarma', 'carpma']).default('mod'),
  a: z.number().int("Tam sayı olmalıdır"),
  b: z.number().int("Tam sayı olmalıdır").default(0), // b only used for add/sub/mul
  m: z.number().int("Tam sayı olmalıdır").positive("Mod değeri 0'dan büyük pozitif tam sayı olmalıdır.")
});

type Input = z.infer<typeof schema>;

export const modulerAritmetikCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_mod_001',
  slug: 'moduler-aritmetik',
  status: 'draft',
  name: 'Modüler Aritmetik Hesaplama',
  shortDescription: 'Sayıların belirtilen bir moda göre (mod m) değerlerini, toplama, çıkarma ve çarpma işlemlerini hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Modüler Aritmetik Hesaplama (Mod Alma) | Hesapera',
    description: 'Mod alma (a mod m), modüler toplama, çıkarma ve çarpma işlemlerini adım adım yapın. Negatif sayı desteği mevcuttur.',
    keywords: ['mod hesaplama', 'modüler aritmetik', 'mod alma', 'a mod b', 'kalan bulma', 'mod matematik'],
    canonical: 'https://hesapera.com/moduler-aritmetik',
    faq: [],
    relatedCalculators: ['ebob-ekok', 'faktoriyel']
  },
  fields: [
    {
      id: 'islem',
      label: 'İşlem Türü',
      type: 'select',
      required: true,
      defaultValue: 'mod',
      options: [
        { label: 'Mod Alma (a mod m)', value: 'mod' },
        { label: 'Toplama (a + b) mod m', value: 'toplama' },
        { label: 'Çıkarma (a - b) mod m', value: 'cikarma' },
        { label: 'Çarpma (a Ã— b) mod m', value: 'carpma' }
      ]
    },
    { id: 'm', label: 'Mod Değeri (m)', type: 'number', required: true, min: 1, description: 'Hangi moda göre işlem yapılacak?' },
    { id: 'a', label: '1. Sayı (a)', type: 'number', required: true },
    { 
      id: 'b', 
      label: '2. Sayı (b)', 
      type: 'number', 
      required: true,
      conditions: [
        { fieldId: 'islem', operator: 'in', value: ['toplama', 'cikarma', 'carpma'] }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateModulerAritmetik({
    islem: input.islem,
    a: input.a,
    b: input.islem === 'mod' ? 0 : input.b,
    m: input.m
  })
};


