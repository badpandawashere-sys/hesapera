import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateGebelik } from '../formulas/gebelik';

const schema = z.object({
  sonAdetTarihi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Lütfen geçerli bir tarih seçiniz.')
});

type Input = z.infer<typeof schema>;

export const gebelikCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_gebelik_001',
  slug: 'gebelik',
  name: 'Gebelik Hesaplama',
  shortDescription: 'Son adet tarihinize göre (LMP) kaç haftalık hamile olduğunuzu, tahmini doğum tarihinizi ve hangi trimesterde olduğunuzu hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Gebelik Haftası ve Tahmini Doğum Tarihi Hesaplama | Hesapera',
    description: 'Son adet tarihinize göre yaklaşık gebelik haftanızı, gününüzü, trimester sınırlarını ve tahmini doğum tarihinizi (40 hafta) öğrenin.',
    keywords: ['gebelik hesaplama', 'kaç haftalık hamileyim', 'tahmini doğum tarihi', 'trimester hesaplama', 'hamilelik takvimi'],
    canonical: 'https://hesapera.com/gebelik',
    faq: [],
    relatedCalculators: ['adet-gunu', 'bebek-kilosu']
  },
  fields: [
    { id: 'sonAdetTarihi', label: 'Son Adet Başlangıç Tarihi', type: 'date', required: true }
  ],
  schema,
  calculate: (input) => calculateGebelik({ sonAdetTarihi: input.sonAdetTarihi, referansTarihi: new Date().toISOString().split('T')[0] })
};
