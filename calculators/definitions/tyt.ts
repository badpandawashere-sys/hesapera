import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateTyt } from '../formulas/tyt';

const schema = z.object({
  turkceCorrect: z.number().int().min(0).max(40),
  turkceWrong: z.number().int().min(0).max(40),
  sosyalCorrect: z.number().int().min(0).max(20),
  sosyalWrong: z.number().int().min(0).max(20),
  matematikCorrect: z.number().int().min(0).max(40),
  matematikWrong: z.number().int().min(0).max(40),
  fenCorrect: z.number().int().min(0).max(20),
  fenWrong: z.number().int().min(0).max(20)
});

type Input = z.infer<typeof schema>;

export const tytCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_tyt_001',
  slug: 'tyt-puan',
  status: 'published',
  name: 'TYT Puan Hesaplama',
  shortDescription: 'ÖSYM 2026-YKS Türkçe, Sosyal Bilimler, Matematik ve Fen Bilimleri test netlerinizi girerek TYT Sınav Puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'TYT Puan Hesaplama 2026 | Hesapera',
    description: '2026-YKS Temel Yeterlilik Testi (TYT) netlerinize göre standart sapma tahmini ile yaklaşık TYT sınav puanınızı hesaplayın.',
    keywords: ['tyt puan hesaplama', 'tyt net hesaplama', '2026 tyt', 'yks tyt puan'],
    canonical: 'https://hesapera.com.tr/hesaplama/tyt-puan',
    faq: [],
    relatedCalculators: ['obp-okul-puani', 'universite-yks-taban-puanlari']
  },
  fields: [
    { id: 'turkceCorrect', label: 'Türkçe Doğru (Maks 40)', type: 'number', required: true, min: 0, max: 40 },
    { id: 'turkceWrong', label: 'Türkçe Yanlış', type: 'number', required: true, min: 0, max: 40 },
    { id: 'sosyalCorrect', label: 'Sosyal Bilimler Doğru (Maks 20)', type: 'number', required: true, min: 0, max: 20 },
    { id: 'sosyalWrong', label: 'Sosyal Bilimler Yanlış', type: 'number', required: true, min: 0, max: 20 },
    { id: 'matematikCorrect', label: 'Temel Matematik Doğru (Maks 40)', type: 'number', required: true, min: 0, max: 40 },
    { id: 'matematikWrong', label: 'Temel Matematik Yanlış', type: 'number', required: true, min: 0, max: 40 },
    { id: 'fenCorrect', label: 'Fen Bilimleri Doğru (Maks 20)', type: 'number', required: true, min: 0, max: 20 },
    { id: 'fenWrong', label: 'Fen Bilimleri Yanlış', type: 'number', required: true, min: 0, max: 20 }
  ],
  schema,
  calculate: (input) => calculateTyt(
    input.turkceCorrect, input.turkceWrong,
    input.sosyalCorrect, input.sosyalWrong,
    input.matematikCorrect, input.matematikWrong,
    input.fenCorrect, input.fenWrong
  )
};


