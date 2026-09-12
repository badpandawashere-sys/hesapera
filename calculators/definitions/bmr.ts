import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateBmr } from '../formulas/bmr';

const schema = z.object({
  cinsiyet: z.enum(['Erkek', 'Kadın']),
  yas: z.number().min(1).max(120),
  boy: z.number().min(50).max(250),
  kilo: z.number().min(20).max(300)
});

type Input = z.infer<typeof schema>;

export const bazalMetabolizmaHiziCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_bazal_metabolizma_hizi_001',
  slug: 'bazal-metabolizma-hizi',
  name: 'Bazal Metabolizma Hızı (BMR) Hesaplama',
  shortDescription: 'Cinsiyet, yaş, boy ve kilonuza göre günlük dinlenik halde harcadığınız bazal enerji (BMR) miktarını hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Bazal Metabolizma Hızı Hesaplama (BMR) | Hesapera',
    description: 'Mifflin-St Jeor formülü kullanılarak cinsiyet, yaş, boy ve kilonuza göre günlük tahmini bazal metabolizma hızınızı (BMR) öğrenin.',
    keywords: ['bazal metabolizma hızı hesaplama', 'bmr hesaplama', 'metabolizma hızı ölçme', 'mifflin st jeor bmr'],
    canonical: 'https://hesapera.com/bazal-metabolizma-hizi',
    faq: [],
    relatedCalculators: []
  },
  fields: [
    {
      id: 'cinsiyet',
      label: 'Cinsiyet',
      type: 'select',
      required: true,
      options: [
        { label: 'Erkek', value: 'Erkek' },
        { label: 'Kadın', value: 'Kadın' }
      ]
    },
    { id: 'yas', label: 'Yaş', type: 'number', required: true, min: 1, max: 120 },
    { id: 'boy', label: 'Boy (cm)', type: 'number', required: true, min: 50, max: 250 },
    { id: 'kilo', label: 'Kilo (kg)', type: 'number', required: true, min: 20, max: 300 }
  ],
  schema,
  calculate: (input) => calculateBmr(input)
};
