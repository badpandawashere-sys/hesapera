import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateVki } from '../formulas/vki';

const schema = z.object({
  boy: z.number().min(50).max(250),
  kilo: z.number().min(20).max(400)
});

type Input = z.infer<typeof schema>;

export const vkiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_vki_001',
  slug: 'vucut-kitle-endeksi',
  status: 'published',
  name: 'Vücut Kitle Endeksi (VKİ) Hesaplama',
  shortDescription: 'Boyunuza ve kilonuza göre Vücut Kitle Endeksinizi (VKİ/BMI) hesaplayın ve WHO standartlarına göre kilonuzun durumunu öğrenin.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Vücut Kitle Endeksi (VKİ / BMI) Hesaplama | Hesapera',
    description: 'Boy ve kilo ölçüleriniz ile Vücut Kitle Endeksinizi (VKİ) hesaplayın. Dünya Sağlık Örgütü (WHO) standartlarında kilonuzun hangi kategoride olduğunu öğrenin.',
    keywords: ['vücut kitle endeksi hesaplama', 'vki hesaplama', 'bmi hesaplama', 'boy kilo endeksi', 'obezite testi'],
    canonical: 'https://hesapera.com.tr/hesaplama/vucut-kitle-endeksi',
    icon: 'HeartPulse',
    faq: [],
    features: [
      { label: 'Obezite Testi', icon: 'Activity' },
      { label: 'Sağlık Skoru', icon: 'Heart' },
      { label: 'WHO Standartları', icon: 'Globe' }
    ],
    infoBox: {
      title: 'Sağlıklı Bir Beden',
      text: 'Vücudunuzun sinyallerini dinleyin.',
      icon: 'Activity'
    },
    relatedCalculators: ['ideal-kilo', 'bazal-metabolizma-hizi', 'vucut-yag-orani']
  },
  fields: [
    { id: 'boy', label: 'Boyunuz (cm)', type: 'number', required: true, min: 50, max: 250 },
    { id: 'kilo', label: 'Kilonuz (kg)', type: 'number', required: true, min: 20, max: 400 }
  ],
  schema,
  calculate: (input) => calculateVki(input)
};


