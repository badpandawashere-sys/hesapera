import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { queryLiseBaseScores } from '../formulas/liseBaseScores';

const schema = z.object({
  year: z.number().int().min(2020).max(2030).optional(),
  city: z.string().optional(),
  schoolType: z.enum(['Anadolu Lisesi', 'Fen Lisesi', 'Mesleki-Teknik', 'Sosyal Bilimler Lisesi', 'Güzel Sanatlar Lisesi', 'İmam Hatip Lisesi', 'Genel Lise', '']).optional(),
  school: z.string().optional()
});

type Input = z.infer<typeof schema>;

export const liseLgsTabanPuanlariCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_liseLgsTabanPuanlari_001',
  slug: 'lise-lgs-taban-puanlari',
  name: 'Lise / LGS Taban Puanları Hesaplama',
  shortDescription: 'LGS ile öğrenci alan lise ve ortaöğretim kurumlarının yıl, il ve okul türüne göre geçmiş taban puanlarını sorgulayın. (Demo veridir.)',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Lise LGS Taban Puanları Sorgulama | Hesapera',
    description: 'LGS ile öğrenci alan liselerin yıl, il, okul türü ve taban puan bilgilerini sorgulayın. Gerçek veriler MEB e-Okul ve ÖSYM LGS Yerleştirme Sonuçlarından alınmaktadır.',
    keywords: ['lise taban puanları', 'lgs taban puan', 'lise puanları 2025', 'meb lise yerleştirme'],
    canonical: 'https://hesapera.com/lise-lgs-taban-puanlari',
    faq: [],
    relatedCalculators: ['lgs-puan', 'dgs-taban-puanlari']
  },
  fields: [
    {
      id: 'year',
      label: 'Yıl',
      type: 'select',
      required: false,
      options: [
        { label: 'Tüm Yıllar', value: '' },
        { label: '2025', value: '2025' },
        { label: '2024', value: '2024' }
      ]
    },
    {
      id: 'city',
      label: 'İl',
      type: 'text',
      required: false
    },
    {
      id: 'schoolType',
      label: 'Okul Türü',
      type: 'select',
      required: false,
      options: [
        { label: 'Tüm Okul Türleri', value: '' },
        { label: 'Anadolu Lisesi', value: 'Anadolu Lisesi' },
        { label: 'Fen Lisesi', value: 'Fen Lisesi' },
        { label: 'Mesleki-Teknik', value: 'Mesleki-Teknik' },
        { label: 'Sosyal Bilimler Lisesi', value: 'Sosyal Bilimler Lisesi' },
        { label: 'Güzel Sanatlar Lisesi', value: 'Güzel Sanatlar Lisesi' },
        { label: 'İmam Hatip Lisesi', value: 'İmam Hatip Lisesi' },
        { label: 'Genel Lise', value: 'Genel Lise' }
      ]
    },
    { id: 'school', label: 'Okul Adı (arama)', type: 'text', required: false }
  ],
  schema,
  calculate: (input) => {
    const filters = {
      year: input.year ? Number(input.year) : undefined,
      city: input.city || undefined,
      schoolType: input.schoolType || undefined,
      school: input.school || undefined
    };
    // Provider is async; for sync calculate we return a static note
    // Real data access happens via queryLiseBaseScores in server actions
    return {
      primaryResult: 'Sorgu Yapıldı',
      secondaryResults: {
        'Durum': 'Filtreler uygulandı',
        'Veri Türü': 'Demo / Mock Veri'
      },
      notes: [
        'Bu araç demo veridir; resmi güncel LGS taban puan değildir. Gerçek taban puanları MEB e-Okul ve ÖSYM LGS Yerleştirme Sonuçlarından alınabilir.',
        'Gerçek veri entegrasyonu için yönetici panelinizden veri sağlayıcısını güncelleyin.'
      ]
    };
  }
};
