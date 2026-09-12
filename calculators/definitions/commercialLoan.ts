import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCommercialLoan } from '../formulas/commercialLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const commercialLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_commercialLoan_001',
  slug: 'ticari-kredi',
  status: 'draft',
  name: 'Ticari Kredi Hesaplama',
  shortDescription: 'Åirketiniz için kullanacağınız ticari kredinin genel geri ödeme ve faiz tablosunu hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Ticari Kredi Hesaplama Aracı | Hesapera',
    description: 'Åirketiniz için kullanacağınız ticari kredinin genel geri ödeme ve faiz tablosunu hesaplayın.',
    keywords: ["ticari kredi hesaplama","kurumsal kredi","şirket kredisi"],
    canonical: 'https://hesapera.com/ticari-kredi',
    faq: [],
    relatedCalculators: ["ticari-ihtiyac-kredisi","ticari-arac-kredisi","kredi-yapilandirma"]
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateCommercialLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};

