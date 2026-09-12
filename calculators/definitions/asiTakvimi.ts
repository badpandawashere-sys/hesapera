import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAsiTakvimi } from '../formulas/asiTakvimi';

const schema = z.object({
  dogumTarihi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Lütfen geçerli bir tarih seçiniz.')
});

type Input = z.infer<typeof schema>;

export const asiTakvimiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_asi_takvimi_001',
  slug: 'asi-takvimi',
  status: 'draft',
  name: 'Aşı Takvimi Hesaplama',
  shortDescription: 'T.C. Sağlık Bakanlığı 2026 güncel Ulusal Çocukluk Dönemi Aşılama Takvimi verilerine göre çocuğunuzun aşı takvimini hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Aşı Takvimi Hesaplama (Güncel MEB/Sağlık Bakanlığı 2026) | Hesapera',
    description: 'Doğum tarihine göre bebek ve çocukların T.C. Sağlık Bakanlığı onaylı güncel aşı takvimini öğrenin. 48. ay suçiçeği eklemesi dÃ¢hildir.',
    keywords: ['aşı takvimi hesaplama', 'bebek aşı takvimi', 'çocuk aşı takvimi', '2026 aşı takvimi', 'suçiçeği aşısı 48 ay'],
    canonical: 'https://hesapera.com/asi-takvimi',
    faq: [],
    relatedCalculators: ['bebek-boyu']
  },
  fields: [
    { id: 'dogumTarihi', label: 'Çocuğunuzun Doğum Tarihi', type: 'date', required: true }
  ],
  schema,
  calculate: (input) => calculateAsiTakvimi({ dogumTarihi: input.dogumTarihi, referansTarihi: new Date().toISOString().split('T')[0] })
};


