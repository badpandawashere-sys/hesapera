import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKaloriIhtiyaci } from '../formulas/kaloriIhtiyaci';

const schema = z.object({
  cinsiyet: z.enum(['Erkek', 'Kadın']),
  yas: z.number().min(1).max(120),
  boy: z.number().min(50).max(250),
  kilo: z.number().min(20).max(300),
  aktiviteFaktoru: z.number()
});

type Input = z.infer<typeof schema>;

export const gunlukKaloriIhtiyaciCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_gunluk_kalori_ihtiyaci_001',
  slug: 'gunluk-kalori-ihtiyaci',
  status: 'published',
  name: 'Günlük Kalori İhtiyacı Hesaplama',
  shortDescription: 'Bazal Metabolizma Hızınızı (BMR) ve aktivite faktörünüzü kullanarak tahmini Günlük Toplam Enerji Harcamanızı (TDEE) hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Günlük Kalori İhtiyacı Hesaplama (TDEE) | Hesapera',
    description: 'Mifflin-St Jeor formülü ve fiziksel aktivite seviyeniz ile tahmini günlük kalori ihtiyacınızı (TDEE) bilimsel olarak hesaplayın.',
    keywords: ['günlük kalori ihtiyacı hesaplama', 'tdee hesaplama', 'kalori hesabı', 'günlük enerji ihtiyacı', 'zayıflamak için kalori'],
    canonical: 'https://hesapera.com/gunluk-kalori-ihtiyaci',
    faq: [],
    relatedCalculators: ['bazal-metabolizma-hizi', 'gunluk-makro-besin-ihtiyaci']
  },
  fields: [
    {
      id: 'cinsiyet',
      label: 'Cinsiyet',
      type: 'select',
      required: true,
      options: [
        { label: 'Erkek', value: 'Erkek' },
        { label: 'Kadın', value: 'Kadın' }
      ]
    },
    { id: 'yas', label: 'Yaş', type: 'number', required: true, min: 1, max: 120 },
    { id: 'boy', label: 'Boy (cm)', type: 'number', required: true, min: 50, max: 250 },
    { id: 'kilo', label: 'Kilo (kg)', type: 'number', required: true, min: 20, max: 300 },
    {
      id: 'aktiviteFaktoru',
      label: 'Fiziksel Aktivite Seviyesi',
      type: 'select',
      required: true,
      options: [
        { label: 'Sedanter (Masa başı iş, az egzersiz)', value: 1.2 },
        { label: 'Hafif Aktif (Haftada 1-3 gün hafif egzersiz)', value: 1.375 },
        { label: 'Orta Aktif (Haftada 3-5 gün orta şiddette egzersiz)', value: 1.55 },
        { label: 'Çok Aktif (Haftada 6-7 gün ağır egzersiz)', value: 1.725 },
        { label: 'Çok Yoğun Aktif (Fiziksel güç gerektiren iş veya profesyonel antrenman)', value: 1.9 }
      ],
      defaultValue: 1.2
    }
  ],
  schema,
  calculate: (input) => calculateKaloriIhtiyaci(input)
};


