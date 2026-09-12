import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateEus } from '../formulas/eus';

const schema = z.object({
  temelCorrect: z.number().int().min(0).max(60),
  temelWrong: z.number().int().min(0).max(60),
  klinikCorrect: z.number().int().min(0).max(60),
  klinikWrong: z.number().int().min(0).max(60)
});

type Input = z.infer<typeof schema>;

export const eusCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_eus_001',
  slug: 'eus-puan',
  name: 'EUS Puan Hesaplama',
  shortDescription: '2026-EUS (Eczacılıkta Uzmanlık Eğitimi Giriş Sınavı) Temel Eczacılık ve Klinik/Uygulamalı Eczacılık testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın. (7 Kasım 2026)',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'EUS Puan Hesaplama — Eczacılıkta Uzmanlık Eğitimi Giriş Sınavı | Hesapera',
    description: '2026-EUS (Eczacılıkta Uzmanlık Eğitimi Giriş Sınavı, 7 Kasım 2026) Temel Eczacılık ve Klinik/Uygulamalı Eczacılık testleri doğru/yanlış sayılarınıza göre tahmini puanınızı hesaplayın.',
    keywords: ["eus puan hesaplama","eczacılık uzmanlık sınavı","eus 2026","eus hesabı"],
    canonical: 'https://hesapera.com/eus-puan',
    faq: [],
    relatedCalculators: ["dus-puan","ales-puan"]
  },
  fields: [
  {
    "id": "temelCorrect",
    "label": "Temel Eczacılık Doğru",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 60
  },
  {
    "id": "temelWrong",
    "label": "Temel Eczacılık Yanlış",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 60
  },
  {
    "id": "klinikCorrect",
    "label": "Klinik/Uygulamalı Eczacılık Doğru",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 60
  },
  {
    "id": "klinikWrong",
    "label": "Klinik/Uygulamalı Eczacılık Yanlış",
    "type": "number",
    "required": true,
    "min": 0,
    "max": 60
  }
],
  schema,
  calculate: (input) => {
    return calculateEus(input.temelCorrect, input.temelWrong, input.klinikCorrect, input.klinikWrong);
  }
};