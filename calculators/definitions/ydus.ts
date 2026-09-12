import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateYdus } from '../formulas/ydus';

const schema = z.object({
  dogru: z.number().int().min(0).max(80),
  yanlis: z.number().int().min(0).max(80)
});

type Input = z.infer<typeof schema>;

export const ydusCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ydus_001',
  slug: 'ydus-puan',
  status: 'draft',
  name: 'YDUS Puan Hesaplama',
  shortDescription: 'YDUS (Yan Dal Uzmanlık Eğitimi Giriş Sınavı) doğru/yanlış sayılarınıza göre yaklaşık puanınızı (100 üzerinden) hesaplayın.',
  category: 'education',
  type: 'simple',
  metadata: {
    title: 'YDUS Puan Hesaplama 2026 | Hesapera',
    description: '2026 YDUS sınavı için netlerinizi ve yaklaşık sınav puanınızı hesaplayın. 80 soruluk standart test için 4 yanlış 1 doğruyu götürür.',
    keywords: ['ydus puan hesaplama', 'yan dal uzmanlık sınavı', 'ydus net hesaplama', '2026 ydus'],
    canonical: 'https://hesapera.com/ydus-puan',
    faq: [],
    relatedCalculators: ['tus-puan', 'dus-puan']
  },
  fields: [
    { id: 'dogru', label: 'Doğru Sayısı (Maks 80)', type: 'number', required: true, min: 0, max: 80 },
    { id: 'yanlis', label: 'Yanlış Sayısı', type: 'number', required: true, min: 0, max: 80 }
  ],
  schema,
  calculate: (input) => calculateYdus(input.dogru, input.yanlis)
};


