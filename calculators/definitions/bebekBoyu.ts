import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateBebekBoyu } from '../formulas/bebekBoyu';

const schema = z.object({
  cinsiyet: z.enum(['Erkek', 'Kız']),
  anneBoyu: z.number().min(100).max(220),
  babaBoyu: z.number().min(100).max(220)
});

type Input = z.infer<typeof schema>;

export const bebekBoyuCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_bebek_boyu_001',
  slug: 'bebek-boyu',
  status: 'draft',
  name: 'Bebek / Çocuk Hedef Boy Hesaplama',
  shortDescription: 'Ebeveyn boylarına dayanarak (Mid-Parental Height) çocuğunuzun genetik potansiyel yetişkinlik boyunu (hedef boy) hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Bebek Boyu / Çocuk Hedef Boy Hesaplama | Hesapera',
    description: 'Anne ve baba boyunu kullanarak erkek veya kız çocuğunuzun genetik olarak ulaşabileceği tahmini yetişkinlik boyunu hesaplayın.',
    keywords: ['bebek boyu hesaplama', 'çocuk boyu hesaplama', 'hedef boy hesaplama', 'genetik boy hesaplama', 'mid parental height'],
    canonical: 'https://hesapera.com/bebek-boyu',
    faq: [],
    relatedCalculators: ['asi-takvimi']
  },
  fields: [
    {
      id: 'cinsiyet',
      label: 'Çocuğun Cinsiyeti',
      type: 'select',
      required: true,
      options: [
        { label: 'Erkek', value: 'Erkek' },
        { label: 'Kız', value: 'Kız' }
      ]
    },
    { id: 'anneBoyu', label: 'Anne Boyu (cm)', type: 'number', required: true, min: 100, max: 220 },
    { id: 'babaBoyu', label: 'Baba Boyu (cm)', type: 'number', required: true, min: 100, max: 220 }
  ],
  schema,
  calculate: (input) => calculateBebekBoyu(input)
};


