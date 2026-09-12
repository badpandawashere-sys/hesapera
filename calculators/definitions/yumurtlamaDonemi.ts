import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateYumurtlamaDonemi } from '../formulas/yumurtlamaDonemi';

const schema = z.object({
  sonAdetTarihi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Lütfen YYYY-MM-DD formatında bir tarih giriniz.'),
  donguSuresi: z.number().min(20).max(45)
});

type Input = z.infer<typeof schema>;

export const yumurtlamaDonemiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_yumurtlama_donemi_001',
  slug: 'yumurtlama-donemi',
  name: 'Yumurtlama Dönemi (Ovülasyon) Hesaplama',
  shortDescription: 'Son adet tarihinizi ve döngü sürenizi girerek tahmini yumurtlama (ovülasyon) gününüzü ve verimli döneminizi hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Yumurtlama Dönemi Hesaplama (Ovülasyon Takvimi) | Hesapera',
    description: 'Adet döngünüze göre doğurganlığın en yüksek olduğu ovülasyon (yumurtlama) gününüzü ve verimli (hamile kalma) döneminizi hesaplayın.',
    keywords: ['yumurtlama dönemi hesaplama', 'ovülasyon hesaplama', 'hamile kalma günleri', 'verimli dönem hesabı', 'adet döngüsü hesaplama'],
    canonical: 'https://hesapera.com/yumurtlama-donemi',
    faq: [],
    relatedCalculators: ['gebelik', 'adet-gunu']
  },
  fields: [
    { id: 'sonAdetTarihi', label: 'Son Adetinizin Başlangıç Tarihi', type: 'date', required: true },
    { id: 'donguSuresi', label: 'Ortalama Adet Döngüsü Süresi (Gün)', type: 'number', required: true, min: 20, max: 45, defaultValue: 28 }
  ],
  schema,
  calculate: (input) => calculateYumurtlamaDonemi(input)
};
