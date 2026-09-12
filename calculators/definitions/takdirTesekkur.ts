import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateTakdirTesekkur } from '../formulas/takdirTesekkur';

const schema = z.object({
  egitimSeviyesi: z.enum(['Ortaokul', 'Lise']),
  donemOrtalamasi: z.number().min(0).max(100),
  basarisizDersVarMi: z.boolean(),
  ozursuzDevamsizlik: z.number().min(0),
  disiplinCezasiVarMi: z.boolean(),
  turkceDersiNotu: z.number().min(0).max(100).optional()
});

type Input = z.infer<typeof schema>;

export const takdirTesekkurCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_takdir_tesekkur_001',
  slug: 'takdir-tesekkur',
  status: 'published',
  name: 'Takdir / Teşekkür Belgesi Hesaplama',
  shortDescription: 'Dönem ortalamanız, devamsızlık ve ders başarınıza göre MEB takdir veya teşekkür belgesi alma durumunuzu hesaplayın.',
  category: 'education',
  type: 'simple',
  metadata: {
    title: 'Takdir Teşekkür Hesaplama (Ortaokul & Lise 2026) | Hesapera',
    description: 'Güncel MEB yönetmeliğiyle ortaokul veya lisede takdir, teşekkür belgesi alıp alamayacağınızı devamsızlık ve zayıf kontrolüyle öğrenin.',
    keywords: ['takdir teşekkür hesaplama', 'takdir hesaplama', 'teşekkür hesaplama', 'belge hesaplama meb', 'lise takdir teşekkür', 'ortaokul takdir teşekkür'],
    canonical: 'https://hesapera.com.tr/hesaplama/takdir-tesekkur',
    faq: [],
    relatedCalculators: ['lise-ortalama', 'e-okul-not']
  },
  fields: [
    {
      id: 'egitimSeviyesi',
      label: 'Eğitim Seviyesi',
      type: 'select',
      required: true,
      options: [
        { label: 'Ortaokul (5, 6, 7, 8. Sınıf)', value: 'Ortaokul' },
        { label: 'Lise (9, 10, 11, 12. Sınıf)', value: 'Lise' }
      ],
      defaultValue: 'Lise'
    },
    { id: 'donemOrtalamasi', label: 'Dönem Ağırlıklı Ortalamanız (0-100)', type: 'number', required: true, min: 0, max: 100 },
    { id: 'basarisizDersVarMi', label: 'Herhangi Bir Dersten Başarısız (Zayıf) Oldunuz mu?', type: 'checkbox', required: true, defaultValue: false },
    { id: 'ozursuzDevamsizlik', label: 'Özürsüz Devamsızlık (Gün)', type: 'number', required: true, min: 0, defaultValue: 0 },
    { id: 'disiplinCezasiVarMi', label: 'Dönem İçinde Disiplin Cezası Aldınız mı?', type: 'checkbox', required: true, defaultValue: false },
    {
      id: 'turkceDersiNotu',
      label: 'Türkçe Dersi Dönem Notu (0-100)',
      type: 'number',
      required: false,
      min: 0,
      max: 100,
      defaultValue: 100,
      conditions: [
        { fieldId: 'egitimSeviyesi', operator: 'equals', value: 'Ortaokul' }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateTakdirTesekkur(input)
};


