import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateTus } from '../formulas/tus';

const schema = z.object({
  mezuniyet: z.enum(['tip', 'tip_disi']),
  ttbtCorrect: z.number().int().min(0).max(120),
  ttbtWrong: z.number().int().min(0).max(120),
  ktbtCorrect: z.number().int().min(0).max(120).optional(),
  ktbtWrong: z.number().int().min(0).max(120).optional()
});

type Input = z.infer<typeof schema>;

export const tusCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_tus_001',
  slug: 'tus-puan',
  status: 'draft',
  name: 'TUS Puan Hesaplama',
  shortDescription: 'TUS (Tıpta Uzmanlık Eğitimi Giriş Sınavı) Temel ve Klinik Tıp Bilimleri netlerinizi girerek T ve K puanınızı yaklaşık olarak hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'TUS Puan Hesaplama 2026 | Hesapera',
    description: '2026 TUS Temel Tıp Bilimleri Testi (TTBT) ve Klinik Tıp Bilimleri Testi (KTBT) netlerinize göre yaklaşık T ve K puanınızı hesaplayın.',
    keywords: ['tus puan hesaplama', 'tıpta uzmanlık sınavı', 'tus k puanı', 'tus t puanı', 'tus net hesaplama'],
    canonical: 'https://hesapera.com/tus-puan',
    faq: [],
    relatedCalculators: ['dus-puan', 'eus-puan']
  },
  fields: [
    {
      id: 'mezuniyet',
      label: 'Mezuniyet Durumu',
      type: 'select',
      required: true,
      options: [
        { label: 'Tıp Fakültesi Mezunu', value: 'tip' },
        { label: 'Tıp Dışı Meslekler (Veteriner, Eczacılık vb.)', value: 'tip_disi' }
      ]
    },
    { id: 'ttbtCorrect', label: 'Temel Tıp (TTBT) Doğru Sayısı (Maks 120)', type: 'number', required: true, min: 0, max: 120 },
    { id: 'ttbtWrong', label: 'Temel Tıp (TTBT) Yanlış Sayısı', type: 'number', required: true, min: 0, max: 120 },
    {
      id: 'ktbtCorrect',
      label: 'Klinik Tıp (KTBT) Doğru Sayısı (Maks 120)',
      type: 'number',
      required: false,
      min: 0,
      max: 120,
      conditions: [{ fieldId: 'mezuniyet', operator: 'equals', value: 'tip' }]
    },
    {
      id: 'ktbtWrong',
      label: 'Klinik Tıp (KTBT) Yanlış Sayısı',
      type: 'number',
      required: false,
      min: 0,
      max: 120,
      conditions: [{ fieldId: 'mezuniyet', operator: 'equals', value: 'tip' }]
    }
  ],
  schema,
  calculate: (input) => calculateTus(
    input.ttbtCorrect, input.ttbtWrong,
    input.ktbtCorrect || 0, input.ktbtWrong || 0,
    input.mezuniyet
  )
};


