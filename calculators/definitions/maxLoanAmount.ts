import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMaxLoanAmount } from '../formulas/maxLoanAmount';

const schema = z.object({
  maxMonthlyPayment: z.number().positive('Maksimum aylık ödeme 0 dan büyük olmalıdır'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz'),
  termMonths: z.number().int().positive('Vade pozitif olmalıdır'),
  existingMonthlyDebt: z.number().min(0, 'Mevcut borç negatif olamaz')
}).refine(data => data.existingMonthlyDebt <= data.maxMonthlyPayment, { message: 'Mevcut aylık borcunuz maksimum kapasiteden büyük olamaz.', path: ['existingMonthlyDebt'] });

type Input = z.infer<typeof schema>;

export const maxLoanAmountCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_maxLoanAmount_001',
  slug: 'ne-kadar-kredi-alabilirim',
  name: 'Ne Kadar Kredi Alabilirim Hesaplama',
  shortDescription: 'Ödeyebileceğiniz aylık taksit kapasitesine göre bankalardan teorik olarak çekebileceğiniz maksimum kredi miktarını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Ne Kadar Kredi Alabilirim Hesaplama Aracı | Hesapera',
    description: 'Ödeyebileceğiniz aylık taksit kapasitesine göre bankalardan teorik olarak çekebileceğiniz maksimum kredi miktarını hesaplayın.',
    keywords: ["ne kadar kredi alabilirim","kredi limiti hesaplama","aylık ödeme kapasitesi"],
    canonical: 'https://hesapera.com/ne-kadar-kredi-alabilirim',
    faq: [],
    relatedCalculators: ["ihtiyac-kredisi","konut-kredisi"]
  },
  fields: [
  {
    "id": "maxMonthlyPayment",
    "label": "Maksimum Aylık Ödeyebileceğiniz Tutar",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "monthlyInterestRate",
    "label": "Aylık Faiz Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  },
  {
    "id": "termMonths",
    "label": "Vade (Ay)",
    "type": "number",
    "required": true,
    "min": 1,
    "max": 360
  },
  {
    "id": "existingMonthlyDebt",
    "label": "Mevcut Aylık Kredi / Kredi Kartı Borcunuz",
    "type": "currency",
    "required": true,
    "min": 0,
    "defaultValue": 0
  }
],
  schema,
  calculate: (input) => {
    return calculateMaxLoanAmount(input.maxMonthlyPayment, input.monthlyInterestRate, input.termMonths, input.existingMonthlyDebt);
  }
};
