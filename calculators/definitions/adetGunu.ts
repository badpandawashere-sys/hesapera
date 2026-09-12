import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAdetGunu } from '../formulas/adetGunu';

const schema = z.object({
  sonAdetTarihi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Lütfen geçerli bir tarih seçiniz.'),
  donguUzunlugu: z.number().min(20).max(45)
});

type Input = z.infer<typeof schema>;

export const adetGunuCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_adet_gunu_001',
  slug: 'adet-gunu',
  name: 'Adet Günü Hesaplama',
  shortDescription: 'Son adet tarihinize ve döngü uzunluğunuza göre tahmini bir sonraki adet gününüzü ve yumurtlama döneminizi hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Adet Günü Hesaplama (Tahmini Regl Takvimi) | Hesapera',
    description: 'Son adet kanaması tarihinizle bir sonraki beklenen adet gününüzü ve yumurtlama (ovulasyon) tarihinizi hesaplayın.',
    keywords: ['adet günü hesaplama', 'regl takvimi', 'yumurtlama dönemi hesaplama', 'ovulasyon hesaplama', 'sonraki adet tarihi'],
    canonical: 'https://hesapera.com/adet-gunu',
    faq: [],
    relatedCalculators: []
  },
  fields: [
    { id: 'sonAdetTarihi', label: 'Son Adet Başlangıç Tarihi', type: 'date', required: true },
    { id: 'donguUzunlugu', label: 'Ortalama Döngü Uzunluğu (Gün)', type: 'number', required: true, min: 20, max: 45, defaultValue: 28 }
  ],
  schema,
  calculate: (input) => calculateAdetGunu(input)
};
