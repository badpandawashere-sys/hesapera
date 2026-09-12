import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateOyp, formatOypResult } from '../formulas/oyp';

const schema = z.object({
  alesScore: z.number().min(0).max(100),
  yabancıDilScore: z.number().min(0).max(100),
  lisansScore: z.number().min(0).max(100)
});

type Input = z.infer<typeof schema>;

export const oypCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_oyp_001',
  slug: 'oyp-puan',
  status: 'draft',
  name: 'ÖYP Puan Hesaplama',
  shortDescription: 'Tarihi ÖYP (Öğretim Üyesi Yetiştirme Programı) puan hesaplama. ALES, yabancı dil ve lisans mezuniyet notuna göre tarihi ÖYP puanınızı hesaplayın. (Tarihi sistem, ~2018 sona ermiştir.)',
  category: 'education',
  type: 'simple',
  metadata: {
    title: 'ÖYP Puan Hesaplama â€” Öğretim Üyesi Yetiştirme Programı (Tarihi) | Hesapera',
    description: 'Tarihi ÖYP (Öğretim Üyesi Yetiştirme Programı) formülüne göre ALES, yabancı dil ve lisans notu ile ÖYP puanınızı hesaplayın. ÖYP sistemi ~2018 itibarıyla sona ermiştir.',
    keywords: ['oyp puan hesaplama', 'öyp hesaplama', 'öğretim üyesi yetiştirme programı', 'oyp ales yds'],
    canonical: 'https://hesapera.com/oyp-puan',
    faq: [],
    relatedCalculators: ['ales-puan', 'kpss-puan']
  },
  fields: [
    {
      id: 'alesScore',
      label: 'ALES Puanı (0â€“100)',
      type: 'number',
      required: true,
      min: 0,
      max: 100
    },
    {
      id: 'yabancıDilScore',
      label: 'Yabancı Dil Puanı â€” YDS/YÖKDİL (0â€“100)',
      type: 'number',
      required: true,
      min: 0,
      max: 100
    },
    {
      id: 'lisansScore',
      label: 'Lisans Mezuniyet Notu (0â€“100)',
      type: 'number',
      required: true,
      min: 0,
      max: 100
    }
  ],
  schema,
  calculate: (input) => {
    const result = calculateOyp(input.alesScore, input.yabancıDilScore, input.lisansScore);
    return formatOypResult(result);
  }
};


