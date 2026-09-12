import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculatePybs } from '../formulas/pybs';

const schema = z.object({
  sinifLevel: z.enum(['5', '6', '7', '8', 'Hazirlik', '9', '10', '11']),
  turkceCorrect: z.number().int().min(0).max(25),
  turkceWrong: z.number().int().min(0).max(25),
  matematikCorrect: z.number().int().min(0).max(25),
  matematikWrong: z.number().int().min(0).max(25),
  fenCorrect: z.number().int().min(0).max(25),
  fenWrong: z.number().int().min(0).max(25),
  sosyalCorrect: z.number().int().min(0).max(25),
  sosyalWrong: z.number().int().min(0).max(25)
});

type Input = z.infer<typeof schema>;

export const pybsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_pybs_001',
  slug: 'pybs-puan',
  name: 'PYBS (İOKBS) Puan Hesaplama',
  shortDescription: 'MEB 2026 İlköğretim ve Ortaöğretim Kurumları Bursluluk Sınavı (İOKBS/PYBS) netlerinizi hesaplayın ve yaklaşık puanınızı (100-500) öğrenin.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'PYBS / İOKBS Puan Hesaplama 2026 | Hesapera',
    description: '2026 PYBS (İOKBS) Bursluluk sınavı için netlerinizi ve MEB 100-500 aralığındaki yaklaşık Ağırlıklı Standart Puanınızı (TASP) hesaplayın.',
    keywords: ['pybs puan hesaplama', 'iokbs puan hesaplama', 'bursluluk sınavı puan', 'meb iokbs 2026'],
    canonical: 'https://hesapera.com/pybs-puan',
    faq: [],
    relatedCalculators: ['lgs-puan', 'lise-lgs-taban-puanlari']
  },
  fields: [
    {
      id: 'sinifLevel',
      label: 'Sınıf Seviyesi',
      type: 'select',
      required: true,
      options: [
        { label: '5. Sınıf', value: '5' },
        { label: '6. Sınıf', value: '6' },
        { label: '7. Sınıf', value: '7' },
        { label: '8. Sınıf', value: '8' },
        { label: 'Hazırlık Sınıfı', value: 'Hazirlik' },
        { label: '9. Sınıf', value: '9' },
        { label: '10. Sınıf', value: '10' },
        { label: '11. Sınıf', value: '11' }
      ]
    },
    { id: 'turkceCorrect', label: 'Türkçe / TDE Doğru (Maks 25)', type: 'number', required: true, min: 0, max: 25 },
    { id: 'turkceWrong', label: 'Türkçe / TDE Yanlış', type: 'number', required: true, min: 0, max: 25 },
    { id: 'matematikCorrect', label: 'Matematik Doğru (Maks 25)', type: 'number', required: true, min: 0, max: 25 },
    { id: 'matematikWrong', label: 'Matematik Yanlış', type: 'number', required: true, min: 0, max: 25 },
    { id: 'fenCorrect', label: 'Fen Bilimleri Doğru (Maks 25)', type: 'number', required: true, min: 0, max: 25 },
    { id: 'fenWrong', label: 'Fen Bilimleri Yanlış', type: 'number', required: true, min: 0, max: 25 },
    { id: 'sosyalCorrect', label: 'Sosyal Bilgiler Doğru (Maks 25)', type: 'number', required: true, min: 0, max: 25 },
    { id: 'sosyalWrong', label: 'Sosyal Bilgiler Yanlış', type: 'number', required: true, min: 0, max: 25 }
  ],
  schema,
  calculate: (input) => calculatePybs(
    input.turkceCorrect, input.turkceWrong,
    input.matematikCorrect, input.matematikWrong,
    input.fenCorrect, input.fenWrong,
    input.sosyalCorrect, input.sosyalWrong
  )
};
