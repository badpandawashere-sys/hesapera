import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateIdealKilo } from '../formulas/idealKilo';

const schema = z.object({
  cinsiyet: z.enum(['Erkek', 'Kadın']),
  boy: z.number().min(130).max(250)
});

type Input = z.infer<typeof schema>;

export const idealKiloCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ideal_kilo_001',
  slug: 'ideal-kilo',
  status: 'published',
  name: 'İdeal Kilo Hesaplama',
  shortDescription: 'Cinsiyetinize ve boyunuza göre tıbbi formüllerle (Devine Formülü) hesaplanmış yaklaşık ideal vücut ağırlığınızı öğrenin.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'İdeal Kilo Hesaplama (Devine Formülü) | Hesapera',
    description: 'Boyunuza ve cinsiyetinize göre tahmini ideal kilonuzu Devine formülü ile matematiksel olarak hesaplayın. (Yetişkinler içindir.)',
    keywords: ['ideal kilo hesaplama', 'boyuma göre kaç kilo olmalıyım', 'ideal vücut ağırlığı', 'devine formülü kilo'],
    canonical: 'https://hesapera.com/ideal-kilo',
    faq: [],
    relatedCalculators: ['vucut-kitle-indeksi', 'bazal-metabolizma-hizi']
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
    { id: 'boy', label: 'Boy (cm)', type: 'number', required: true, min: 130, max: 250 }
  ],
  schema,
  calculate: (input) => calculateIdealKilo(input)
};


