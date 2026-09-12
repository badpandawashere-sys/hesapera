import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCommercialConsumerLoan } from '../formulas/commercialConsumerLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const commercialConsumerLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_commercialConsumerLoan_001',
  slug: 'ticari-ihtiyac-kredisi',
  name: 'Ticari İhtiyaç Kredisi Hesaplama',
  shortDescription: 'İşletmenizin kısa ve orta vadeli nakit ihtiyaçları için kullanacağınız ticari ihtiyaç kredisini parametrik olarak simüle edin.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Ticari İhtiyaç Kredisi Hesaplama Aracı | Hesapera',
    description: 'İşletmenizin kısa ve orta vadeli nakit ihtiyaçları için kullanacağınız ticari ihtiyaç kredisini parametrik olarak simüle edin.',
    keywords: ["ticari ihtiyaç kredisi","esnaf kredisi","kobi kredisi","işletme kredisi"],
    canonical: 'https://hesapera.com/ticari-ihtiyac-kredisi',
    faq: [],
    relatedCalculators: ["ticari-kredi","is-yeri-kredisi","ihtiyac-kredisi"]
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateCommercialConsumerLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};