import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateHmgs } from '../formulas/hmgs';

const schema = z.object({
  medeniBorclarCorrect: z.number().int().min(0).max(40),
  medeniBorclarWrong: z.number().int().min(0).max(40),
  ticaretUsulCorrect: z.number().int().min(0).max(40),
  ticaretUsulWrong: z.number().int().min(0).max(40)
});

type Input = z.infer<typeof schema>;

export const hmgsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_hmgs_001',
  slug: 'hmgs-puan',
  name: 'HMGS Puan Hesaplama',
  shortDescription: '2026-HMGS (Hukuk Mesleklerine Giriş Sınavı) Medeni-Borçlar Hukuku ve Ticaret-Usul Hukuku testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'HMGS Puan Hesaplama — Hukuk Mesleklerine Giriş Sınavı | Hesapera',
    description: '2026-HMGS (Hukuk Mesleklerine Giriş Sınavı) doğru/yanlış sayılarınıza göre Medeni Hukuk, Borçlar Hukuku, Ticaret Hukuku ve Usul Hukuku testleri üzerinden tahmini puanınızı hesaplayın.',
    keywords: ["hmgs puan hesaplama", "hmgs 2026", "hukuk mesleklerine giriş sınavı", "hmgs hesabı", "hukuk sınavı puan"],
    canonical: 'https://hesapera.com/hmgs-puan',
    faq: [],
    relatedCalculators: ["h-kim-ve-savci-yardimciligi-sinavi-puan", "ales-puan", "ekpss-puan"]
  },
  fields: [
    {
      id: 'medeniBorclarCorrect',
      label: 'Medeni Hukuk ve Borçlar Hukuku Doğru',
      type: 'number',
      required: true,
      min: 0,
      max: 40
    },
    {
      id: 'medeniBorclarWrong',
      label: 'Medeni Hukuk ve Borçlar Hukuku Yanlış',
      type: 'number',
      required: true,
      min: 0,
      max: 40
    },
    {
      id: 'ticaretUsulCorrect',
      label: 'Ticaret Hukuku ve Usul Hukuku Doğru',
      type: 'number',
      required: true,
      min: 0,
      max: 40
    },
    {
      id: 'ticaretUsulWrong',
      label: 'Ticaret Hukuku ve Usul Hukuku Yanlış',
      type: 'number',
      required: true,
      min: 0,
      max: 40
    }
  ],
  schema,
  calculate: (input) => {
    return calculateHmgs(
      input.medeniBorclarCorrect,
      input.medeniBorclarWrong,
      input.ticaretUsulCorrect,
      input.ticaretUsulWrong
    );
  }
};