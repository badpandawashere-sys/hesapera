import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLiseDersPuani } from '../formulas/liseDersPuani';

const schema = z.object({
  notlar: z.array(z.object({
    tur: z.string().min(1, "Not türü gereklidir"),
    not: z.number().min(0).max(100)
  })).min(1, "En az bir not girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const liseDersPuaniCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_lise_ders_puani_001',
  slug: 'lise-ders-puani',
  status: 'draft',
  name: 'Lise Ders Puanı Hesaplama',
  shortDescription: 'MEB 2026 lise yönetmeliğine göre sınav, performans ve proje notlarınızla bir dersin yıl sonu başarı puanını hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Lise Ders Puanı Hesaplama 2026 | Hesapera',
    description: 'Güncel MEB Ortaöğretim Kurumları Yönetmeliğine göre lise dersleriniz için sınav, performans ve proje ortalamanızı hesaplayın.',
    keywords: ['lise ders puanı', 'lise ders ortalaması', 'performans notu hesaplama', 'proje notu hesaplama', 'meb lise not hesaplama'],
    canonical: 'https://hesapera.com/lise-ders-puani',
    faq: [],
    relatedCalculators: ['lise-ortalama', 'lise-sinif-gecme']
  },
  fields: [
    {
      id: 'notlar',
      label: 'Ders Notlarınız',
      type: 'array',
      required: true,
      description: 'Lütfen ders için hesaplamaya dahil edilecek sınav, performans ve proje notlarınızı girin.',
      subFields: [
        { 
          id: 'tur', 
          label: 'Not Türü', 
          type: 'select', 
          required: true,
          options: [
            { label: 'Yazılı Sınav', value: 'Yazılı Sınav' },
            { label: 'Performans Çalışması', value: 'Performans Çalışması' },
            { label: 'Proje', value: 'Proje' }
          ]
        },
        { id: 'not', label: 'Not (0-100)', type: 'number', required: true, min: 0, max: 100 }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateLiseDersPuani(input)
};


