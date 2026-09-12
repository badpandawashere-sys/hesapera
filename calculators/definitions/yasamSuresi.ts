import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateYasamSuresi } from '../formulas/yasamSuresi';

const schema = z.object({
  cinsiyet: z.enum(['Erkek', 'Kadın']),
  yas: z.enum(['0', '15', '30', '50', '65'])
});

type Input = z.infer<typeof schema>;

export const yasamSuresiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_yasam_suresi_001',
  slug: 'yasam-suresi',
  name: 'Yaşam Süresi Hesaplama',
  shortDescription: 'TÜİK (2023-2025) resmi verilerine göre belirli yaş grupları için istatistiksel kalan yaşam beklentinizi öğrenin.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Yaşam Süresi Hesaplama (TÜİK 2023-2025) | Hesapera',
    description: 'TÜİK resmi Hayat Tabloları verilerine göre 0, 15, 30, 50 ve 65 yaşlarındaki bireylerin cinsiyete göre istatistiksel yaşam beklentisini hesaplayın.',
    keywords: ['yaşam süresi hesaplama', 'kalan ömür', 'tüik hayat tabloları 2023-2025', 'yaşam beklentisi', 'kaç yıl yaşarım'],
    canonical: 'https://hesapera.com/yasam-suresi',
    faq: [],
    relatedCalculators: []
  },
  fields: [
    {
      id: 'cinsiyet',
      label: 'Cinsiyetiniz',
      type: 'select',
      required: true,
      options: [
        { label: 'Erkek', value: 'Erkek' },
        { label: 'Kadın', value: 'Kadın' }
      ]
    },
    {
      id: 'yas',
      label: 'Yaş Grubu',
      type: 'select',
      required: true,
      options: [
        { label: 'Doğuşta (0 Yaş)', value: '0' },
        { label: '15 Yaş', value: '15' },
        { label: '30 Yaş', value: '30' },
        { label: '50 Yaş', value: '50' },
        { label: '65 Yaş', value: '65' }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateYasamSuresi(input)
};
