import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateSuIhtiyaci } from '../formulas/suIhtiyaci';

const schema = z.object({
  kilo: z.number().min(20).max(300)
});

type Input = z.infer<typeof schema>;

export const gunlukSuIhtiyaciCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_gunluk_su_ihtiyaci_001',
  slug: 'gunluk-su-ihtiyaci',
  name: 'Günlük Su İhtiyacı Hesaplama',
  shortDescription: 'Vücut ağırlığınıza göre gün içinde ortalama olarak tüketmeniz gereken sıvı/su miktarını (Litre ve ml) hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Günlük Su İhtiyacı Hesaplama | Hesapera',
    description: 'Vücut ağırlığınıza göre günlük ortalama sıvı (su) ihtiyacınızı litre ve mililitre cinsinden genel tıbbi referanslarla hesaplayın.',
    keywords: ['günlük su ihtiyacı hesaplama', 'günde ne kadar su içmeliyim', 'su hesabı', 'sıvı ihtiyacı', 'kilo başına su hesabı'],
    canonical: 'https://hesapera.com/gunluk-su-ihtiyaci',
    faq: [],
    relatedCalculators: ['gunluk-kalori-ihtiyaci']
  },
  fields: [
    { id: 'kilo', label: 'Vücut Ağırlığınız (kg)', type: 'number', required: true, min: 20, max: 300 }
  ],
  schema,
  calculate: (input) => calculateSuIhtiyaci(input)
};
