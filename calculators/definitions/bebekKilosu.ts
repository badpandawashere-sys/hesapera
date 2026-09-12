import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateBebekKilosu } from '../formulas/bebekKilosu';

const schema = z.object({
  cinsiyet: z.enum(['Erkek', 'Kız']),
  yasAy: z.number().min(0).max(24),
  mevcutKilo: z.number().min(1).max(30)
});

type Input = z.infer<typeof schema>;

export const bebekKilosuCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_bebek_kilosu_001',
  slug: 'bebek-kilosu',
  name: 'Bebek Kilosu Hesaplama',
  shortDescription: 'Dünya Sağlık Örgütü (WHO) 0-24 ay referanslarına göre bebeğinizin kilosunu medyan değerlerle karşılaştırın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Bebek Kilosu Hesaplama (WHO Standartları) | Hesapera',
    description: 'Bebeğinizin mevcut kilosunu yaş ve cinsiyetine göre Dünya Sağlık Örgütü (WHO) büyüme standartlarındaki 50. persentil (medyan) değerleriyle karşılaştırın.',
    keywords: ['bebek kilosu hesaplama', 'bebek gelişimi', 'who persentil', 'bebek kilo tablosu', 'aylık bebek kilosu'],
    canonical: 'https://hesapera.com/bebek-kilosu',
    faq: [],
    relatedCalculators: ['bebek-boyu', 'asi-takvimi']
  },
  fields: [
    {
      id: 'cinsiyet',
      label: 'Cinsiyet',
      type: 'select',
      required: true,
      options: [
        { label: 'Erkek', value: 'Erkek' },
        { label: 'Kız', value: 'Kız' }
      ]
    },
    { id: 'yasAy', label: 'Yaş (Ay)', type: 'number', required: true, min: 0, max: 24, defaultValue: 6 },
    { id: 'mevcutKilo', label: 'Mevcut Kilo (kg)', type: 'number', required: true, min: 1, max: 30 }
  ],
  schema,
  calculate: (input) => calculateBebekKilosu(input)
};
