import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMortgageLoan } from '../formulas/mortgageLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const mortgageLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_mortgageLoan_001',
  slug: 'konut-kredisi',
  name: 'Konut Kredisi Hesaplama',
  shortDescription: 'Ev sahibi olmak için çekeceğiniz konut kredisinin aylık ödemelerini ve faiz detaylarını görün.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Konut Kredisi Hesaplama Aracı | Hesapera',
    description: 'Konut kredisi tutarı, faiz oranı ve vade bilgilerinizi girerek aylık taksit tutarını, toplam geri ödemeyi ve toplam faiz maliyetini hesaplayın.',
    keywords: ["konut kredisi","ev kredisi","kredi hesaplama","mortgage"],
    canonical: 'https://hesapera.com/konut-kredisi',
    faq: [],
    relatedCalculators: ["ihtiyac-kredisi","is-yeri-kredisi"]
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateMortgageLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};
