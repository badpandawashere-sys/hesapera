import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculatePomem } from '../formulas/pomem';

const schema = z.object({
  kpssScore: z.number().min(0).max(100),
  fizikiScore: z.number().min(0).max(100),
  mulakatScore: z.number().min(0).max(100)
});

type Input = z.infer<typeof schema>;

export const pomemCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_pomem_001',
  slug: 'pomem-puan',
  status: 'draft',
  name: 'POMEM Puan Hesaplama',
  shortDescription: 'KPSS puanı, fiziki yeterlilik ve mülakat sınavı puanınıza göre Polis Meslek Eğitim Merkezi (POMEM) nihai başarı puanınızı hesaplayın.',
  category: 'education',
  type: 'simple',
  metadata: {
    title: 'POMEM Puan Hesaplama â€” Polis Meslek Eğitim Merkezi | Hesapera',
    description: 'Polis Meslek Eğitim Merkezi (POMEM) güncel başarı formülüne göre KPSS (%25), fiziki yeterlilik (%25) ve mülakat (%50) puanlarıyla nihai sıralama puanınızı öğrenin.',
    keywords: ['pomem puan hesaplama', 'polis meslek eğitim merkezi', 'pomem başarı puanı', 'kpss fiziki mülakat'],
    canonical: 'https://hesapera.com/pomem-puan',
    faq: [],
    relatedCalculators: ['pmyo-puan', 'kpss-puan']
  },
  fields: [
    {
      id: 'kpssScore',
      label: 'KPSS Puanı (0-100)',
      type: 'number',
      required: true,
      min: 0,
      max: 100
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
    const result = calculatePomem(input.kpssScore, input.fizikiScore, input.mulakatScore);

    return {
      primaryResult: result.nihaiScore.toFixed(2),
      secondaryResults: {
        'KPSS Katkısı (%25)': (result.kpssScore * 0.25).toFixed(2),
        'Fiziki Yeterlilik Katkısı (%25)': (result.fizikiScore * 0.25).toFixed(2),
        'Mülakat Katkısı (%50)': (result.mulakatScore * 0.50).toFixed(2),
        'Başarı Durumu': result.statusMessage
      },
      notes: [
        'Polis Akademisi 2026 POMEM Giriş Yönetmeliği esas alınmıştır.',
        'POMEM Nihai Başarı Puanı; KPSS puanının %25\'i, Fiziki Yeterlilik sınavının %25\'i ve Mülakat sınavının %50\'si toplanarak elde edilir.',
        'Fiziki yeterlilik sınavından 60 puanın altında veya mülakat sınavından 70 puanın altında alan adaylar sıralamaya dahil edilmez.',
        'Başvuru için gereken KPSS taban puanı her yıl POMEM alım ilanında belirtilir (Örn. Lisans P3: 60, Önlisans P93: 65).'
      ]
    };
  }
};


