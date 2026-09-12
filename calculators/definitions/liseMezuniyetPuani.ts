import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLiseMezuniyetPuani } from '../formulas/liseMezuniyetPuani';

const schema = z.object({
  yillar: z.array(z.object({
    yil: z.string().min(1, "Sınıf/Yıl gereklidir"),
    puan: z.number().min(0).max(100)
  })).min(1, "En az bir yıl sonu puanı girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const liseMezuniyetPuaniCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_lise_mezuniyet_puani_001',
  slug: 'lise-mezuniyet-puani',
  name: 'Lise Mezuniyet Puanı Hesaplama',
  shortDescription: 'Lise öğreniminiz boyunca elde ettiğiniz yıl sonu başarı puanlarıyla diploma puanınızı ve tahmini OBP\'nizi hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Lise Mezuniyet ve Diploma Puanı Hesaplama 2026 | Hesapera',
    description: '9, 10, 11 ve 12. sınıf yıl sonu başarı puanlarınızla lise mezuniyet (diploma) puanınızı ve YKS OBP değerinizi hesaplayın.',
    keywords: ['lise mezuniyet puanı', 'diploma puanı hesaplama', 'obp hesaplama', 'yks ortaöğretim başarı puanı', 'lise diploma notu'],
    canonical: 'https://hesapera.com/lise-mezuniyet-puani',
    faq: [],
    relatedCalculators: ['obp-okul-puani', 'lise-ortalama']
  },
  fields: [
    {
      id: 'yillar',
      label: 'Yıl Sonu Başarı Puanları',
      type: 'array',
      required: true,
      description: 'Lütfen tamamladığınız sınıflara ait yıl sonu başarı puanlarınızı girin (Örn: 9. Sınıf Puanınız).',
      subFields: [
        { 
          id: 'yil', 
          label: 'Sınıf / Yıl', 
          type: 'select', 
          required: true,
          options: [
            { label: '9. Sınıf', value: '9. Sınıf' },
            { label: '10. Sınıf', value: '10. Sınıf' },
            { label: '11. Sınıf', value: '11. Sınıf' },
            { label: '12. Sınıf', value: '12. Sınıf' }
          ]
        },
        { id: 'puan', label: 'Yıl Sonu Başarı Puanı (0-100)', type: 'number', required: true, min: 0, max: 100 }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateLiseMezuniyetPuani(input)
};
