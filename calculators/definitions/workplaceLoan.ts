import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateWorkplaceLoan } from '../formulas/workplaceLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const workplaceLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_workplaceLoan_001',
  slug: 'is-yeri-kredisi',
  name: 'İş Yeri Kredisi Hesaplama',
  shortDescription: 'İş yeri alımı veya ticari ihtiyaçlarınız için kredi taksitlerinizi ve maliyet tablosunu hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'İş Yeri Kredisi Hesaplama Aracı | Hesapera',
    description: 'İş yeri alımı veya ticari ihtiyaçlarınız için kredi taksitlerinizi ve maliyet tablosunu hesaplayın.',
    keywords: ["iş yeri kredisi","ticari kredi","kredi hesaplama","amortisman"],
    canonical: 'https://hesapera.com/is-yeri-kredisi',
    faq: [],
    relatedCalculators: ["ihtiyac-kredisi","konut-kredisi"]
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateWorkplaceLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};
