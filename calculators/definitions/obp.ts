import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateObp, formatObpResult } from '../formulas/obp';

const schema = z.object({
  diplomaNotu: z.number().min(0).max(100),
  useKirik: z.enum(['normal', 'kirik'])
});

type Input = z.infer<typeof schema>;

export const obpCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_obp_001',
  slug: 'obp-okul-puani',
  name: 'OBP Okul Puanı Hesaplama',
  shortDescription: 'Diploma notunuzdan OBP (Ortaöğretim Başarı Puanı) ve YKS yerleştirme puanına normal veya kırık OBP katkısını hesaplayın. (ÖSYM 2026-YKS Kılavuzu)',
  category: 'education',
  type: 'simple',
  metadata: {
    title: 'OBP Hesaplama — Ortaöğretim Başarı Puanı | Hesapera',
    description: 'Diploma notunuzdan OBP ve YKS katkınızı hesaplayın. Önceki yıl yerleşme durumuna göre kırık OBP katkısı (0.06) veya normal katkı (0.12) hesaplanır.',
    keywords: ['obp hesaplama', 'ortaöğretim başarı puanı', 'diploma notu obp', 'yks obp katkısı', 'kırık obp'],
    canonical: 'https://hesapera.com/obp-okul-puani',
    faq: [],
    relatedCalculators: ['lgs-puan', 'kpss-puan', 'ales-puan']
  },
  fields: [
    {
      id: 'diplomaNotu',
      label: 'Diploma Notu (0–100)',
      type: 'number',
      required: true,
      min: 0,
      max: 100
    },
    {
      id: 'useKirik',
      label: 'Önceki Yıl Yerleşme Durumu (Kırık OBP)',
      type: 'select',
      required: true,
      options: [
        { label: 'Önceki yıl yerleşmedim (Normal OBP - x0.12)', value: 'normal' },
        { label: 'Önceki yıl bir programa yerleştim (Kırık OBP - x0.06)', value: 'kirik' }
      ]
    }
  ],
  schema,
  calculate: (input) => {
    const result = calculateObp(input.diplomaNotu);
    return formatObpResult(result, input.useKirik === 'kirik');
  }
};
