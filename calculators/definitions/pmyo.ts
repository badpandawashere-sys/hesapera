import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculatePmyo } from '../formulas/pmyo';

const schema = z.object({
  tytScore: z.number().min(100).max(500),
  fizikiScore: z.number().min(0).max(100),
  mulakatScore: z.number().min(0).max(100)
});

type Input = z.infer<typeof schema>;

export const pmyoCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_pmyo_001',
  slug: 'pmyo-puan',
  name: 'PMYO Puan Hesaplama',
  shortDescription: 'TYT ham puanı, fiziki yeterlilik ve mülakat sınavı puanınıza göre Polis Meslek Yüksekokulu (PMYO) nihai başarı puanınızı hesaplayın.',
  category: 'education',
  type: 'simple',
  metadata: {
    title: 'PMYO Puan Hesaplama — Polis Meslek Yüksekokulu | Hesapera',
    description: 'Polis Meslek Yüksekokulu (PMYO) güncel başarı puanı formülüne göre TYT (%25), fiziki yeterlilik (%25) ve mülakat (%50) bileşenleriyle nihai puanınızı hesaplayın.',
    keywords: ['pmyo puan hesaplama', 'polis meslek yüksekokulu', 'pmyo başarı puanı', 'tyt fiziki mülakat'],
    canonical: 'https://hesapera.com/pmyo-puan',
    faq: [],
    relatedCalculators: ['pomem-puan', 'msu-puan']
  },
  fields: [
    {
      id: 'tytScore',
      label: 'TYT Ham Puanı (100-500)',
      type: 'number',
      required: true,
      min: 100,
      max: 500
    },
    {
      id: 'fizikiScore',
      label: 'Fiziki Yeterlilik Puanı (0-100)',
      type: 'number',
      required: true,
      min: 0,
      max: 100
    },
    {
      id: 'mulakatScore',
      label: 'Mülakat Puanı (0-100)',
      type: 'number',
      required: true,
      min: 0,
      max: 100
    }
  ],
  schema,
  calculate: (input) => {
    const result = calculatePmyo(input.tytScore, input.fizikiScore, input.mulakatScore);

    return {
      primaryResult: result.nihaiScore.toFixed(2),
      secondaryResults: {
        'TYT Katkısı (%25)': (result.tytScore * 0.25).toFixed(2),
        'Fiziki Yeterlilik Katkısı (%25)': (result.fizikiScore * 0.25).toFixed(2),
        'Mülakat Katkısı (%50)': (result.mulakatScore * 0.50).toFixed(2),
        'Başarı Durumu': result.statusMessage
      },
      notes: [
        'Polis Akademisi 2026 PMYO Giriş Yönetmeliği esas alınmıştır.',
        'PMYO Nihai Başarı Puanı; TYT puanının %25\'i, Fiziki Yeterlilik sınavının %25\'i ve Mülakat sınavının %50\'si toplanarak elde edilir.',
        'Fiziki yeterlilik sınavından 60 puanın altında veya mülakat sınavından 70 puanın altında alan adaylar sıralamaya dahil edilmez.'
      ]
    };
  }
};
