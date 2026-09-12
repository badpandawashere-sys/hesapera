import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateVehicleLoan } from '../formulas/vehicleLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const vehicleLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_vehicleLoan_001',
  slug: 'tasit-kredisi',
  name: 'Taşıt Kredisi Hesaplama',
  shortDescription: 'Otomobil veya diğer taşıt alımlarınız için kullanacağınız kredinin taksit ve ödeme planını anında hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Taşıt Kredisi Hesaplama Aracı | Hesapera',
    description: 'Otomobil veya diğer taşıt alımlarınız için kullanacağınız kredinin taksit ve ödeme planını anında hesaplayın.',
    keywords: ["taşıt kredisi","araç kredisi","araba kredisi hesaplama","kredi taksiti"],
    canonical: 'https://hesapera.com.tr/hesaplama/tasit-kredisi',
    faq: [],
    relatedCalculators: ["ticari-arac-kredisi","kredi-hesaplama","ihtiyac-kredisi"]
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateVehicleLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};