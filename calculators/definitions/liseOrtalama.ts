import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLiseOrtalama } from '../formulas/liseOrtalama';

const schema = z.object({
  dersler: z.array(z.object({
    dersAdi: z.string().optional(),
    puan: z.number().min(0).max(100),
    saat: z.number().min(1)
  })).min(1, "En az bir ders girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const liseOrtalamaCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_lise_ortalama_001',
  slug: 'lise-ortalama',
  status: 'draft',
  name: 'Lise Ortalama Hesaplama',
  shortDescription: 'Lise derslerinizin puanı ve haftalık ders saatiyle dönem veya yıl sonu ağırlıklı ortalamanızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Lise Ortalama ve Takdir/Teşekkür Hesaplama 2026 | Hesapera',
    description: 'Güncel MEB yönetmeliğine göre lise ağırlıklı not ortalamanızı hesaplayın. Takdir ve teşekkür belgesi durumunuzu öğrenin.',
    keywords: ['lise ortalama hesaplama', 'ağırlıklı ortalama lise', 'lise takdir teşekkür hesaplama', 'meb ortalama hesaplama', 'dönem sonu puanı'],
    canonical: 'https://hesapera.com/lise-ortalama',
    faq: [],
    relatedCalculators: ['lise-sinif-gecme', 'e-okul-not']
  },
  fields: [
    {
      id: 'dersler',
      label: 'Dersleriniz',
      type: 'array',
      required: true,
      description: 'Lütfen ortalamaya dahil edilecek derslerinizin başarı puanını ve haftalık ders saatini (kredisini) girin.',
      subFields: [
        { id: 'dersAdi', label: 'Ders Adı (İsteğe Bağlı)', type: 'text', required: false },
        { id: 'puan', label: 'Ders Puanı (0-100)', type: 'number', required: true, min: 0, max: 100 },
        { id: 'saat', label: 'Haftalık Ders Saati', type: 'number', required: true, min: 1 }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateLiseOrtalama(input)
};


