import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKpss } from '../formulas/kpss';

const schema = z.object({
  level: z.enum(['lisans', 'onlisans', 'ortaogretim']),
  scoreType: z.enum(['KPSSP1', 'KPSSP3']),
  gyCorrect: z.number().int().min(0).max(60),
  gyWrong: z.number().int().min(0).max(60),
  gkCorrect: z.number().int().min(0).max(60),
  gkWrong: z.number().int().min(0).max(60)
});

type Input = z.infer<typeof schema>;

export const kpssCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_kpss_001',
  slug: 'kpss-puan',
  name: 'KPSS Puan Hesaplama',
  shortDescription: 'KPSS Genel Yetenek ve Genel Kültür testleri doğru/yanlış sayılarınıza göre KPSSP1 veya KPSSP3 yaklaşık puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'KPSS Puan Hesaplama — GY ve GK Bazlı | Hesapera',
    description: 'KPSS 2026 Genel Yetenek ve Genel Kültür testleri doğru/yanlış sayılarınıza göre KPSSP1 ve KPSSP3 yaklaşık puanınızı hesaplayın.',
    keywords: ['kpss puan hesaplama', 'kpss 2026', 'kpssp3 hesaplama', 'kpss gk gy net'],
    canonical: 'https://hesapera.com/kpss-puan',
    faq: [],
    relatedCalculators: ['ekpss-puan', 'ales-puan', 'ags-puan']
  },
  fields: [
    {
      id: 'level',
      label: 'KPSS Düzeyi',
      type: 'select',
      required: true,
      options: [
        { label: 'Lisans (GY: 60 soru, GK: 60 soru)', value: 'lisans' },
        { label: 'Önlisans (GY: 40 soru, GK: 40 soru)', value: 'onlisans' },
        { label: 'Ortaöğretim (GY: 40 soru, GK: 40 soru)', value: 'ortaogretim' }
      ]
    },
    {
      id: 'scoreType',
      label: 'Puan Türü',
      type: 'select',
      required: true,
      options: [
        { label: 'KPSSP3 — GY %50 + GK %50', value: 'KPSSP3' },
        { label: 'KPSSP1 — GY %30 + GK %70', value: 'KPSSP1' }
      ]
    },
    { id: 'gyCorrect', label: 'Genel Yetenek Doğru', type: 'number', required: true, min: 0, max: 60 },
    { id: 'gyWrong', label: 'Genel Yetenek Yanlış', type: 'number', required: true, min: 0, max: 60 },
    { id: 'gkCorrect', label: 'Genel Kültür Doğru', type: 'number', required: true, min: 0, max: 60 },
    { id: 'gkWrong', label: 'Genel Kültür Yanlış', type: 'number', required: true, min: 0, max: 60 }
  ],
  schema,
  calculate: (input) => calculateKpss(
    input.level,
    input.scoreType,
    input.gyCorrect, input.gyWrong,
    input.gkCorrect, input.gkWrong
  )
};