import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMsu } from '../formulas/msu';

const schema = z.object({
  scoreType: z.enum(['SAY', 'SOZ', 'EA', 'GENEL']),
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

export const msuCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_msu_001',
  slug: 'msu-puan',
  status: 'draft',
  name: 'MSÜ Puan Hesaplama',
  shortDescription: '2026-MSÜ Türkçe (40), Sosyal (20), Matematik (40) ve Fen (20) doğru/yanlış sayılarınıza göre yaklaşık puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'MSÜ Puan Hesaplama â€” MillÃ® Savunma Üniversitesi Sınavı 2026 | Hesapera',
    description: '2026-MSÜ Türkçe (40), Sosyal (20), Matematik (40) ve Fen (20) netlerinize göre MSÜ-SAY, SÖZ, EA ve GENEL yaklaşık puanınızı hesaplayın.',
    keywords: ['msü puan hesaplama', 'msu puan 2026', 'milli savunma universitesi sinavi', 'msü say söz ea genel'],
    canonical: 'https://hesapera.com/msu-puan',
    faq: [],
    relatedCalculators: ['hmgs-puan', 'kpss-puan']
  },
  fields: [
    {
      id: 'scoreType',
      label: 'Puan Türü',
      type: 'select',
      required: true,
      options: [
        { label: 'MSÜ-SAY (Sayısal)', value: 'SAY' },
        { label: 'MSÜ-SÖZ (Sözel)', value: 'SOZ' },
        { label: 'MSÜ-EA (Eşit Ağırlık)', value: 'EA' },
        { label: 'MSÜ-GENEL (Genel)', value: 'GENEL' }
      ]
    },
    { id: 'turkceCorrect', label: 'Türkçe Doğru (Maks 40)', type: 'number', required: true, min: 0, max: 40 },
    { id: 'turkceWrong', label: 'Türkçe Yanlış (Maks 40)', type: 'number', required: true, min: 0, max: 40 },
    { id: 'sosyalCorrect', label: 'Sosyal Bilimler Doğru (Maks 20)', type: 'number', required: true, min: 0, max: 20 },
    { id: 'sosyalWrong', label: 'Sosyal Bilimler Yanlış (Maks 20)', type: 'number', required: true, min: 0, max: 20 },
    { id: 'matematikCorrect', label: 'Temel Matematik Doğru (Maks 40)', type: 'number', required: true, min: 0, max: 40 },
    { id: 'matematikWrong', label: 'Temel Matematik Yanlış (Maks 40)', type: 'number', required: true, min: 0, max: 40 },
    { id: 'fenCorrect', label: 'Fen Bilimleri Doğru (Maks 20)', type: 'number', required: true, min: 0, max: 20 },
    { id: 'fenWrong', label: 'Fen Bilimleri Yanlış (Maks 20)', type: 'number', required: true, min: 0, max: 20 }
  ],
  schema,
  calculate: (input) => calculateMsu(
    input.scoreType,
    input.turkceCorrect, input.turkceWrong,
    input.sosyalCorrect, input.sosyalWrong,
    input.matematikCorrect, input.matematikWrong,
    input.fenCorrect, input.fenWrong
  )
};


