import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateDersNotu } from '../formulas/dersNotu';

const schema = z.object({
  hesaplamaTuru: z.enum(['basit', 'agirlikli']),
  notlar: z.array(z.object({
    not: z.number().min(0).max(100),
    agirlik: z.number().min(0).optional()
  })).min(1, "En az bir not girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const dersNotuCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ders_notu_001',
  slug: 'ders-notu',
  status: 'published',
  name: 'Ders Notu Hesaplama',
  shortDescription: 'Bir derse ait sınav, proje veya performans notlarınızı girerek basit veya ağırlıklı ders ortalamanızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Ders Notu ve Ortalama Hesaplama | Hesapera',
    description: 'Vize, final, proje veya performans notlarınızı kullanarak ders başarı durumunuzu ve genel ortalamanızı hesaplayın. Ağırlıklı hesaplama seçeneği mevcuttur.',
    keywords: ['ders notu hesaplama', 'ağırlıklı ortalama hesaplama', 'vize final hesaplama', 'ders ortalaması'],
    canonical: 'https://hesapera.com.tr/hesaplama/ders-notu',
    faq: [],
    relatedCalculators: ['e-okul-not']
  },
  fields: [
    {
      id: 'hesaplamaTuru',
      label: 'Hesaplama Türü',
      type: 'select',
      required: true,
      options: [
        { label: 'Basit Ortalama (Tüm notlar eşit değerde)', value: 'basit' },
        { label: 'Ağırlıklı Ortalama (Kredi veya yüzde ile)', value: 'agirlikli' }
      ]
    },
    {
      id: 'notlar',
      label: 'Ders Notları',
      type: 'array',
      required: true,
      description: 'Lütfen hesaplamak istediğiniz notları girin.',
      subFields: [
        { id: 'not', label: 'Not (0-100)', type: 'number', required: true, min: 0, max: 100 },
        { 
          id: 'agirlik', 
          label: 'Ağırlık / Kredi', 
          type: 'number', 
          required: false, 
          min: 0,
          conditions: [{ fieldId: 'hesaplamaTuru', operator: 'equals', value: 'agirlikli' }] 
        }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateDersNotu(input.notlar, input.hesaplamaTuru === 'agirlikli')
};


