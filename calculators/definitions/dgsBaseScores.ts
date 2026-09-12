import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { queryDgsBaseScores } from '../formulas/dgsBaseScores';

const schema = z.object({
  year: z.string().optional().default(''),
  city: z.string().optional().default(''),
  university: z.string().optional().default(''),
  program: z.string().optional().default(''),
  scoreType: z.string().optional().default('ALL'),
  sortBy: z.string().optional().default('score_desc')
});

type Input = z.infer<typeof schema>;

export const dgsBaseScoresCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_dgs_base_scores_001',
  slug: 'dgs-taban-puanlari',
  status: 'draft',
  name: 'DGS Taban Puanları',
  shortDescription: 'DGS taban puanlarını yıl, üniversite ve program bazında inceleyin. (Demo veri)',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'DGS Taban Puanları | Hesapera',
    description: 'DGS taban puanlarını yıl, üniversite ve program bazında inceleyin.',
    keywords: ['dgs taban puan', 'dgs yerleştirme', 'dgs puan sorgula', 'dikey geçiş taban puan'],
    canonical: 'https://hesapera.com/dgs-taban-puanlari',
    faq: [],
    relatedCalculators: ['dgs-puan', 'ales-puan']
  },
  fields: [
    { id: 'year', label: 'Yıl', type: 'select', required: false, options: [
      { label: 'Tüm Yıllar', value: '' },
      { label: '2024', value: '2024' },
      { label: '2023', value: '2023' }
    ]},
    { id: 'scoreType', label: 'Puan Türü', type: 'select', required: false, options: [
      { label: 'Tümü', value: 'ALL' },
      { label: 'SAY (Sayısal)', value: 'SAY' },
      { label: 'SÖZ (Sözel)', value: 'SOZ' },
      { label: 'EA (Eşit Ağırlık)', value: 'EA' }
    ]},
    { id: 'city', label: 'Åehir (Arama)', type: 'text', required: false, placeholder: 'ör. Ankara' },
    { id: 'university', label: 'Üniversite (Arama)', type: 'text', required: false, placeholder: 'ör. ODTÜ' },
    { id: 'program', label: 'Program (Arama)', type: 'text', required: false, placeholder: 'ör. Bilgisayar' },
    { id: 'sortBy', label: 'Sıralama', type: 'select', required: false, options: [
      { label: 'Taban Puan (Azalan)', value: 'score_desc' },
      { label: 'Taban Puan (Artan)', value: 'score_asc' },
      { label: 'Üniversite (A-Z)', value: 'university' }
    ]}
  ],
  schema,
  calculate: (input) => {
    // Sync wrapper â€” returns a note; real data via server action
    const year = input.year ? parseInt(input.year) : undefined;
    const sortBy = (input.sortBy || 'score_desc') as 'score_asc' | 'score_desc' | 'university';
    return {
      primaryResult: 'Sonuçlar Listeleniyor',
      secondaryResults: {
        'Filtre: Yıl': input.year || 'Tüm Yıllar',
        'Filtre: Puan Türü': input.scoreType || 'Tümü',
        'Filtre: Åehir': input.city || 'Hepsi',
        'Filtre: Üniversite': input.university || 'Hepsi',
        'Filtre: Program': input.program || 'Hepsi'
      },
      notes: ['Bu araç Demo/Mock verilerle çalışmaktadır. Gerçek DGS taban puanları için ÖSYM resmi sitesini (osym.gov.tr) ziyaret ediniz.']
    };
  }
};

