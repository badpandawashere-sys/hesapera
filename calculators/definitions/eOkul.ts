import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateEOkul } from '../formulas/eOkul';

const schema = z.object({
  egitimSeviyesi: z.enum(['ilkogretim', 'ortaogretim']),
  dersler: z.array(z.object({
    dersAdi: z.string().optional(),
    haftalikSaat: z.number().min(1),
    sinav1: z.number().min(0).max(100).optional(),
    sinav2: z.number().min(0).max(100).optional(),
    performans1: z.number().min(0).max(100).optional(),
    performans2: z.number().min(0).max(100).optional(),
    proje: z.number().min(0).max(100).optional()
  })).min(1, "En az bir ders girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const eOkulNotCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_e_okul_001',
  slug: 'e-okul-not',
  status: 'draft',
  name: 'E-Okul Not Hesaplama',
  shortDescription: 'MEB güncel yönetmeliğine göre e-okul dönem sonu ortalamanızı, belge durumunuzu ve ders bazlı başarı notunuzu hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'E-Okul Ortalama ve Takdir/Teşekkür Hesaplama 2026 | Hesapera',
    description: 'İlkokul, Ortaokul ve Lise öğrencileri için güncel e-okul dönem ortalaması, belge (takdir/teşekkür) durumu ve ders notu hesaplama aracı.',
    keywords: ['e-okul not hesaplama', 'dönem ortalaması hesaplama', 'takdir teşekkür hesaplama', 'meb not hesaplama', 'lise ortalama hesaplama'],
    canonical: 'https://hesapera.com/e-okul-not',
    faq: [],
    relatedCalculators: ['ders-notu', 'obp-okul-puani']
  },
  fields: [
    {
      id: 'egitimSeviyesi',
      label: 'Eğitim Seviyesi',
      type: 'select',
      required: true,
      options: [
        { label: 'İlköğretim / Ortaokul', value: 'ilkogretim' },
        { label: 'Lise (Ortaöğretim)', value: 'ortaogretim' }
      ]
    },
    {
      id: 'dersler',
      label: 'Dersleriniz',
      type: 'array',
      required: true,
      description: 'Lütfen dönem içindeki derslerinizi ve aldığınız notları girin. Girilmeyen notlar hesaplamaya dahil edilmez.',
      subFields: [
        { id: 'dersAdi', label: 'Ders Adı (Örn: Mat)', type: 'text', required: false },
        { id: 'haftalikSaat', label: 'Haftalık Ders Saati', type: 'number', required: true, min: 1 },
        { id: 'sinav1', label: '1. Sınav', type: 'number', required: false, min: 0, max: 100 },
        { id: 'sinav2', label: '2. Sınav', type: 'number', required: false, min: 0, max: 100 },
        { id: 'performans1', label: '1. Performans', type: 'number', required: false, min: 0, max: 100 },
        { id: 'performans2', label: '2. Performans', type: 'number', required: false, min: 0, max: 100 },
        { id: 'proje', label: 'Proje Notu', type: 'number', required: false, min: 0, max: 100 }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateEOkul(input.dersler as any[], input.egitimSeviyesi)
};


