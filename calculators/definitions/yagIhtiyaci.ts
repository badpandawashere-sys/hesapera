import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateYagIhtiyaci } from '../formulas/yagIhtiyaci';

const schema = z.object({
  kaloriHedefi: z.number().min(500).max(10000),
  yagYuzdesi: z.number().min(0).max(100)
});

type Input = z.infer<typeof schema>;

export const gunlukYagIhtiyaciCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_gunluk_yag_ihtiyaci_001',
  slug: 'gunluk-yag-ihtiyaci',
  status: 'draft',
  name: 'Günlük Yağ İhtiyacı Hesaplama',
  shortDescription: 'Günlük toplam kalori hedefinize ve belirlediğiniz yağ yüzdesine göre ihtiyacınız olan sağlıklı yağ miktarını (gram) hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Günlük Yağ İhtiyacı Hesaplama | Hesapera',
    description: 'Günlük enerji (kalori) ihtiyacınıza ve hedef yağ yüzdenize göre günlük almanız gereken yağ miktarını gram olarak hesaplayın.',
    keywords: ['günlük yağ ihtiyacı hesaplama', 'yağ hesabı', 'makro yağ', 'sağlıklı yağ oranı', 'kaloriden yağ hesaplama'],
    canonical: 'https://hesapera.com/gunluk-yag-ihtiyaci',
    faq: [],
    relatedCalculators: ['gunluk-makro-besin-ihtiyaci', 'gunluk-kalori-ihtiyaci']
  },
  fields: [
    { id: 'kaloriHedefi', label: 'Günlük Toplam Kalori (kcal)', type: 'number', required: true, min: 500, max: 10000 },
    { id: 'yagYuzdesi', label: 'Yağ Oranı Yüzdesi (%)', type: 'number', required: true, min: 0, max: 100, defaultValue: 30 }
  ],
  schema,
  calculate: (input) => calculateYagIhtiyaci(input)
};


