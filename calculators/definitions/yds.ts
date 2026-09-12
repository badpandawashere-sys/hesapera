import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateYds } from '../formulas/yds';

const schema = z.object({
  dogru: z.number().int().min(0).max(80),
  yanlis: z.number().int().min(0).max(80)
});

type Input = z.infer<typeof schema>;

export const ydsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_yds_001',
  slug: 'yds-puan',
  status: 'draft',
  name: 'YDS Puan Hesaplama',
  shortDescription: 'ÖSYM 2026-YDS (Yabancı Dil Bilgisi Seviye Tespit Sınavı) doğru sayınıza göre puanınızı ve dil seviyenizi (A-E) hesaplayın.',
  category: 'education',
  type: 'simple',
  metadata: {
    title: 'YDS Puan Hesaplama 2026 | Hesapera',
    description: 'YDS veya e-YDS doğru/yanlış sayınızı girerek 100 üzerinden yabancı dil puanınızı ve harf seviyenizi hesaplayın. Yanlışlar doğruyu götürmez.',
    keywords: ['yds puan hesaplama', 'e-yds hesaplama', 'yds net hesaplama', 'yds seviyeleri'],
    canonical: 'https://hesapera.com/yds-puan',
    faq: [],
    relatedCalculators: ['ales-puan', 'tus-puan']
  },
  fields: [
    { id: 'dogru', label: 'Doğru Cevap Sayısı (Maks 80)', type: 'number', required: true, min: 0, max: 80 },
    { id: 'yanlis', label: 'Yanlış Cevap Sayısı', type: 'number', required: true, min: 0, max: 80 }
  ],
  schema,
  calculate: (input) => calculateYds(input.dogru, input.yanlis)
};


