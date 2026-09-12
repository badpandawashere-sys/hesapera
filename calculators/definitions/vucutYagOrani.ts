import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateVucutYagOrani } from '../formulas/vucutYagOrani';

const schema = z.object({
  cinsiyet: z.enum(['Erkek', 'Kadın']),
  boy: z.number().min(100).max(250),
  bel: z.number().min(40).max(200),
  boyun: z.number().min(20).max(100),
  kalca: z.number().min(50).max(250).optional()
}).superRefine((data, ctx) => {
  if (data.cinsiyet === 'Kadın' && !data.kalca) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Kadınlar için kalça çevresi ölçüsü zorunludur.", path: ['kalca'] });
  }
  if (data.cinsiyet === 'Erkek' && data.bel <= data.boyun) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bel çevresi, boyun çevresinden büyük olmalıdır.", path: ['bel'] });
  }
  if (data.cinsiyet === 'Kadın' && data.kalca && (data.bel + data.kalca <= data.boyun)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bel ve kalça toplamı, boyun çevresinden büyük olmalıdır.", path: ['bel'] });
  }
});

type Input = z.infer<typeof schema>;

export const vucutYagOraniCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_vucut_yag_orani_001',
  slug: 'vucut-yag-orani',
  name: 'Vücut Yağ Oranı Hesaplama',
  shortDescription: 'Mezura ölçümlerinizi kullanarak Amerikan Donanması (U.S. Navy) metodu ile tahmini vücut yağ oranınızı hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Vücut Yağ Oranı Hesaplama (U.S. Navy Metodu) | Hesapera',
    description: 'Boy, boyun, bel ve (kadınlar için) kalça çevre ölçümlerinizi kullanarak vücut yağ oranınızı Amerikan Donanması formülü ile hesaplayın.',
    keywords: ['vücut yağ oranı hesaplama', 'yağ yüzdesi hesaplama', 'yağ oranı ölçme', 'navy body fat calculator', 'mezura ile yağ hesabı'],
    canonical: 'https://hesapera.com/vucut-yag-orani',
    faq: [],
    relatedCalculators: ['vucut-kitle-endeksi', 'ideal-kilo', 'bazal-metabolizma-hizi']
  },
  fields: [
    {
      id: 'cinsiyet',
      label: 'Cinsiyet',
      type: 'select',
      required: true,
      options: [
        { label: 'Erkek', value: 'Erkek' },
        { label: 'Kadın', value: 'Kadın' }
      ]
    },
    { id: 'boy', label: 'Boyunuz (cm)', type: 'number', required: true, min: 100, max: 250 },
    { id: 'boyun', label: 'Boyun Çevresi (cm - Adem elmasının hemen altı)', type: 'number', required: true, min: 20, max: 100 },
    { id: 'bel', label: 'Bel Çevresi (cm - Göbek deliği hizası)', type: 'number', required: true, min: 40, max: 200 },
    { id: 'kalca', label: 'Kalça Çevresi (cm - Sadece kadınlar için, en geniş nokta)', type: 'number', required: false, min: 50, max: 250 }
  ],
  schema,
  calculate: (input) => calculateVucutYagOrani(input)
};
