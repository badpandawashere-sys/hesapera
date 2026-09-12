import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLgs } from '../formulas/lgs';

const schema = z.object({
  turkceCorrect:    z.number().int().min(0).max(20),
  turkceWrong:      z.number().int().min(0).max(20),
  matematikCorrect: z.number().int().min(0).max(20),
  matematikWrong:   z.number().int().min(0).max(20),
  fenCorrect:       z.number().int().min(0).max(20),
  fenWrong:         z.number().int().min(0).max(20),
  inkılapCorrect:   z.number().int().min(0).max(10),
  inkılapWrong:     z.number().int().min(0).max(10),
  dinCorrect:       z.number().int().min(0).max(10),
  dinWrong:         z.number().int().min(0).max(10),
  yabancıDilCorrect:z.number().int().min(0).max(10),
  yabancıDilWrong:  z.number().int().min(0).max(10)
});

type Input = z.infer<typeof schema>;

export const lgsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_lgs_001',
  slug: 'lgs-puan',
  name: 'LGS Puan Hesaplama',
  shortDescription: '2026 LGS (Liselere Giriş Sınavı) 6 test doğru/yanlış sayılarınıza göre yaklaşık puanınızı (100–500) hesaplayın. MEB resmi kılavuzu esas alınmıştır.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'LGS Puan Hesaplama 2026 — Liselere Giriş Sınavı | Hesapera',
    description: '2026 LGS Türkçe, Matematik, Fen, İnkılap, Din Kültürü ve Yabancı Dil testleri doğru/yanlış sayılarınıza göre yaklaşık LGS puanınızı hesaplayın.',
    keywords: ['lgs puan hesaplama', 'lgs 2026', 'liselere giriş sınavı puan', 'lgs net hesaplama'],
    canonical: 'https://hesapera.com/lgs-puan',
    faq: [],
    relatedCalculators: ['dgs-puan', 'ales-puan']
  },
  fields: [
    { id: 'turkceCorrect',    label: 'Türkçe Doğru',                            type: 'number', required: true, min: 0, max: 20 },
    { id: 'turkceWrong',      label: 'Türkçe Yanlış',                            type: 'number', required: true, min: 0, max: 20 },
    { id: 'matematikCorrect', label: 'Matematik Doğru',                          type: 'number', required: true, min: 0, max: 20 },
    { id: 'matematikWrong',   label: 'Matematik Yanlış',                         type: 'number', required: true, min: 0, max: 20 },
    { id: 'fenCorrect',       label: 'Fen Bilimleri Doğru',                      type: 'number', required: true, min: 0, max: 20 },
    { id: 'fenWrong',         label: 'Fen Bilimleri Yanlış',                     type: 'number', required: true, min: 0, max: 20 },
    { id: 'inkılapCorrect',   label: 'T.C. İnkılap Tarihi ve Atatürkçülük Doğru', type: 'number', required: true, min: 0, max: 10 },
    { id: 'inkılapWrong',     label: 'T.C. İnkılap Tarihi ve Atatürkçülük Yanlış', type: 'number', required: true, min: 0, max: 10 },
    { id: 'dinCorrect',       label: 'Din Kültürü ve Ahlak Bilgisi Doğru',       type: 'number', required: true, min: 0, max: 10 },
    { id: 'dinWrong',         label: 'Din Kültürü ve Ahlak Bilgisi Yanlış',      type: 'number', required: true, min: 0, max: 10 },
    { id: 'yabancıDilCorrect', label: 'Yabancı Dil (İngilizce) Doğru',           type: 'number', required: true, min: 0, max: 10 },
    { id: 'yabancıDilWrong',  label: 'Yabancı Dil (İngilizce) Yanlış',           type: 'number', required: true, min: 0, max: 10 }
  ],
  schema,
  calculate: (input) => calculateLgs({
    turkceC: input.turkceCorrect,     turkceW: input.turkceWrong,
    matematikC: input.matematikCorrect, matematikW: input.matematikWrong,
    fenC: input.fenCorrect,           fenW: input.fenWrong,
    inkılapC: input.inkılapCorrect,   inkılapW: input.inkılapWrong,
    dinC: input.dinCorrect,           dinW: input.dinWrong,
    yabancıDilC: input.yabancıDilCorrect, yabancıDilW: input.yabancıDilWrong
  })
};