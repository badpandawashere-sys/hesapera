import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMakroBesin } from '../formulas/makroBesin';

const schema = z.object({
  kaloriHedefi: z.number().min(500).max(10000),
  proteinYuzdesi: z.number().min(0).max(100),
  karbonhidratYuzdesi: z.number().min(0).max(100),
  yagYuzdesi: z.number().min(0).max(100)
}).superRefine((data, ctx) => {
  const total = data.proteinYuzdesi + data.karbonhidratYuzdesi + data.yagYuzdesi;
  if (Math.round(total) !== 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Yüzdelerin toplamı tam 100 olmalıdır. Åu anki toplam: ${Math.round(total)}`, path: ['proteinYuzdesi'] });
  }
});

type Input = z.infer<typeof schema>;

export const gunlukMakroBesinIhtiyaciCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_gunluk_makro_besin_ihtiyaci_001',
  slug: 'gunluk-makro-besin-ihtiyaci',
  status: 'draft',
  name: 'Günlük Makro Besin İhtiyacı Hesaplama',
  shortDescription: 'Toplam kalori hedefinize ve belirlediğiniz yüzdelik dağılıma göre günlük ihtiyacınız olan protein, karbonhidrat ve yağ miktarını (gram olarak) hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Günlük Makro Besin İhtiyacı Hesaplama | Hesapera',
    description: 'Günlük kalori hedefinize uygun olarak protein, karbonhidrat ve yağ dağılımınızı (makro) gram bazında bilimsel 4-4-9 katsayılarıyla hesaplayın.',
    keywords: ['makro besin hesaplama', 'günlük protein ihtiyacı', 'makro hesapla', 'kaloriden gram hesaplama', 'karbonhidrat yağ protein hesabı'],
    canonical: 'https://hesapera.com/gunluk-makro-besin-ihtiyaci',
    faq: [],
    relatedCalculators: ['gunluk-kalori-ihtiyaci', 'gunluk-karbonhidrat-ihtiyaci']
  },
  fields: [
    { id: 'kaloriHedefi', label: 'Günlük Kalori Hedefi (kcal)', type: 'number', required: true, min: 500, max: 10000 },
    { id: 'proteinYuzdesi', label: 'Protein Yüzdesi (%)', type: 'number', required: true, min: 0, max: 100, defaultValue: 30 },
    { id: 'karbonhidratYuzdesi', label: 'Karbonhidrat Yüzdesi (%)', type: 'number', required: true, min: 0, max: 100, defaultValue: 40 },
    { id: 'yagYuzdesi', label: 'Yağ Yüzdesi (%)', type: 'number', required: true, min: 0, max: 100, defaultValue: 30 }
  ],
  schema,
  calculate: (input) => calculateMakroBesin(input)
};


