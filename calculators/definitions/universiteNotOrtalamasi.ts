import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateUniversiteNotOrtalamasi } from '../formulas/universiteNotOrtalamasi';

const schema = z.object({
  hesaplamaSistemi: z.enum(['Harf Sistemi', '100\'lük Sistem', '4\'lük Sistem']),
  dersler: z.array(z.object({
    dersAdi: z.string().optional(),
    kredi: z.number().min(0),
    harfNotu: z.string().optional(),
    sayisalNot: z.number().optional()
  })).min(1, "En az bir ders girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const universiteNotOrtalamasiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_universite_not_ortalamasi_001',
  slug: 'universite-not-ortalamasi',
  status: 'draft',
  name: 'Üniversite Not Ortalaması Hesaplama (GPA / GANO)',
  shortDescription: 'Üniversite ders kredilerinizle 4\'lük, 100\'lük veya harf sistemi (AA, BA) üzerinden GPA/GANO hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Üniversite Not Ortalaması Hesaplama (GPA / GANO) | Hesapera',
    description: 'Üniversite öğrencileri için 4\'lük, 100\'lük veya harf sistemiyle dönem ve genel akademik not ortalaması (GANO/GPA) hesaplayın.',
    keywords: ['üniversite not ortalaması hesaplama', 'gpa hesaplama', 'gano hesaplama', '4 lük sistem hesaplama', 'harf notu hesaplama'],
    canonical: 'https://hesapera.com/universite-not-ortalamasi',
    faq: [],
    relatedCalculators: ['lise-ortalama', 'ders-notu']
  },
  fields: [
    {
      id: 'hesaplamaSistemi',
      label: 'Hesaplama Sistemi',
      type: 'select',
      required: true,
      options: [
        { label: 'Harf Sistemi (AA, BA, vb.)', value: 'Harf Sistemi' },
        { label: '4\'lük Sistem (Örn: 3.5)', value: '4\'lük Sistem' },
        { label: '100\'lük Sistem (Örn: 85)', value: '100\'lük Sistem' }
      ],
      defaultValue: 'Harf Sistemi'
    },
    {
      id: 'dersler',
      label: 'Üniversite Dersleriniz',
      type: 'array',
      required: true,
      description: 'Lütfen ortalamaya katılacak derslerinizin kredisini (veya AKTS) ve notunu girin.',
      subFields: [
        { id: 'dersAdi', label: 'Ders Adı (İsteğe Bağlı)', type: 'text', required: false },
        { id: 'kredi', label: 'Kredi / AKTS', type: 'number', required: true, min: 0 },
        { 
          id: 'harfNotu', 
          label: 'Harf Notu', 
          type: 'select', 
          required: false,
          options: [
            { label: 'AA (4.0)', value: 'AA' },
            { label: 'BA (3.5)', value: 'BA' },
            { label: 'BB (3.0)', value: 'BB' },
            { label: 'CB (2.5)', value: 'CB' },
            { label: 'CC (2.0)', value: 'CC' },
            { label: 'DC (1.5)', value: 'DC' },
            { label: 'DD (1.0)', value: 'DD' },
            { label: 'FD (0.5)', value: 'FD' },
            { label: 'FF (0.0)', value: 'FF' }
          ]
        },
        { id: 'sayisalNot', label: 'Sayısal Not', type: 'number', required: false }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateUniversiteNotOrtalamasi(input)
};


