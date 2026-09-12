import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateBelKalcaOrani } from '../formulas/belKalcaOrani';

const schema = z.object({
  cinsiyet: z.enum(['Erkek', 'Kadın']),
  bel: z.number().min(30).max(300),
  kalca: z.number().min(30).max(300)
});

type Input = z.infer<typeof schema>;

export const belKalcaOraniCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_bel_kalca_orani_001',
  slug: 'bel-kalca-orani',
  name: 'Bel / Kalça Oranı Hesaplama',
  shortDescription: 'Bel ve kalça çevrenizi cm cinsinden girerek abdominal obezite riskinizi Dünya Sağlık Örgütü (WHO) sınırlarına göre hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Bel / Kalça Oranı Hesaplama (WHO Standartları) | Hesapera',
    description: 'Bel/Kalça oranınızı hesaplayarak vücut yağ dağılımınızı ve metabolik obezite riskinizi WHO (Dünya Sağlık Örgütü) referanslarına göre öğrenin.',
    keywords: ['bel kalça oranı hesaplama', 'abdominal obezite riski', 'wist to hip ratio', 'vücut yağ oranı hesaplama', 'obezite ölçümü'],
    canonical: 'https://hesapera.com/bel-kalca-orani',
    faq: [],
    relatedCalculators: ['bazal-metabolizma-hizi']
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
    { id: 'bel', label: 'Bel Çevresi (cm)', type: 'number', required: true, min: 30, max: 300 },
    { id: 'kalca', label: 'Kalça Çevresi (cm)', type: 'number', required: true, min: 30, max: 300 }
  ],
  schema,
  calculate: (input) => calculateBelKalcaOrani(input)
};
