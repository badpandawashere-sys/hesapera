import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateIyos } from '../formulas/iyos';

const schema = z.object({
  gyCorrect: z.number().int().min(0).max(50),
  gyWrong: z.number().int().min(0).max(50),
  hukukCorrect: z.number().int().min(0).max(50),
  hukukWrong: z.number().int().min(0).max(50)
});

type Input = z.infer<typeof schema>;

export const iyosCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_iyos_001',
  slug: 'iyos-puan',
  status: 'draft',
  name: 'İYÖS Puan Hesaplama',
  shortDescription: '2026-İYÖS (İdari Yargı Ön Sınavı, 27 Eylül 2026) Genel Yetenek ve Hukuk testleri doğru/yanlış sayılarınıza göre yaklaşık puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'İYÖS Puan Hesaplama â€” İdari Yargı Ön Sınavı 2026 | Hesapera',
    description: '2026-İYÖS (İdari Yargı Ön Sınavı, 27 Eylül 2026) Genel Yetenek ve Hukuk testleri doğru/yanlış sayılarınıza göre yaklaşık puanınızı hesaplayın.',
    keywords: ['iyos puan hesaplama', 'idari yargı ön sınavı', 'iyos 2026', 'iyos hesabı'],
    canonical: 'https://hesapera.com/iyos-puan',
    faq: [],
    relatedCalculators: ['hmgs-puan', 'ales-puan']
  },
  fields: [
    { id: 'gyCorrect', label: 'Genel Yetenek Doğru', type: 'number', required: true, min: 0, max: 50 },
    { id: 'gyWrong', label: 'Genel Yetenek Yanlış', type: 'number', required: true, min: 0, max: 50 },
    { id: 'hukukCorrect', label: 'Hukuk Doğru', type: 'number', required: true, min: 0, max: 50 },
    { id: 'hukukWrong', label: 'Hukuk Yanlış', type: 'number', required: true, min: 0, max: 50 }
  ],
  schema,
  calculate: (input) => calculateIyos(input.gyCorrect, input.gyWrong, input.hukukCorrect, input.hukukWrong)
};

