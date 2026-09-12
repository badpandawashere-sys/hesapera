import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLiseYbp } from '../formulas/liseYbp';

const schema = z.object({
  dersler: z.array(z.object({
    dersAdi: z.string().optional(),
    puan: z.number().min(0).max(100),
    saat: z.number().min(1)
  })).min(1, "En az bir ders girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const liseYbpCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_lise_ybp_001',
  slug: 'lise-ybp',
  status: 'draft',
  name: 'Lise Yıl Sonu Başarı Puanı (YBP) Hesaplama',
  shortDescription: 'MEB güncel lise yönetmeliğine göre ders puanlarınız ve haftalık ders saatlerinizle Yıl Sonu Başarı Puanınızı (YBP) hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Lise Yıl Sonu Başarı Puanı (YBP) Hesaplama 2026 | Hesapera',
    description: 'Güncel MEB yönetmeliğine göre lise yıl sonu başarı puanınızı (YBP) ağırlıklı ortalama yöntemiyle hesaplayın.',
    keywords: ['lise ybp hesaplama', 'yıl sonu başarı puanı', 'meb ybp hesaplama', 'ybp lise hesaplama', 'yıl sonu ağırlıklı ortalama'],
    canonical: 'https://hesapera.com/lise-ybp',
    faq: [],
    relatedCalculators: ['lise-ortalama', 'lise-mezuniyet-puani', 'lise-sinif-gecme']
  },
  fields: [
    {
      id: 'dersler',
      label: 'Dersleriniz',
      type: 'array',
      required: true,
      description: 'Lütfen YBP hesaplaması için yıl sonu ders başarı puanlarınızı ve haftalık ders saatini girin.',
      subFields: [
        { id: 'dersAdi', label: 'Ders Adı (İsteğe Bağlı)', type: 'text', required: false },
        { id: 'puan', label: 'Yıl Sonu Ders Puanı (0-100)', type: 'number', required: true, min: 0, max: 100 },
        { id: 'saat', label: 'Haftalık Ders Saati', type: 'number', required: true, min: 1 }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateLiseYbp(input)
};


