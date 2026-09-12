import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateConsumerLoan } from '../formulas/consumerLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const consumerLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_consumerLoan_001',
  slug: 'ihtiyac-kredisi',
  name: 'İhtiyaç Kredisi Hesaplama',
  shortDescription: 'Bireysel ihtiyaçlarınız için çekeceğiniz kredinin aylık taksitlerini ve ödeme planını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'İhtiyaç Kredisi Hesaplama Aracı | Hesapera',
    description: 'Bireysel ihtiyaç kredisi faiz oranlarını karşılaştırın, aylık taksit tutarını, toplam geri ödemeyi ve kredi ödeme planınızı detaylıca hesaplayın.',
    keywords: ["ihtiyaç kredisi","bireysel kredi","kredi hesaplama","ödeme planı"],
    canonical: 'https://hesapera.com/ihtiyac-kredisi',
    faq: [],
    relatedCalculators: ["is-yeri-kredisi","konut-kredisi"]
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateConsumerLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};
