import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoanAnnualCostRate } from '../formulas/loanAnnualCostRate';

const schema = z.object({
  principalReceived: z.number().positive('Elinize geçen tutar 0 dan büyük olmalıdır'),
  monthlyPayment: z.number().positive('Aylık taksit 0 dan büyük olmalıdır'),
  termMonths: z.number().int().positive('Vade pozitif olmalıdır'),
  upfrontFees: z.number().min(0, 'Peşin masraf negatif olamaz')
}).refine(data => data.upfrontFees < data.principalReceived, { message: 'Peşin masraf, alınan tutardan küçük olmalıdır', path: ['upfrontFees'] });

type Input = z.infer<typeof schema>;

export const loanAnnualCostRateCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loanAnnualCostRate_001',
  slug: 'kredi-yillik-maliyet-orani',
  status: 'published',
  name: 'Kredi Yıllık Maliyet Oranı Hesaplama',
  shortDescription: 'Kullanılan net anapara ve ödenen taksitleri dikkate alarak efektif yıllık maliyet oranını (IRR) simüle edin.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Yıllık Maliyet Oranı Hesaplama Aracı | Hesapera',
    description: 'Kullanılan net anapara ve ödenen taksitleri dikkate alarak efektif yıllık maliyet oranını (IRR) simüle edin.',
    keywords: ["yıllık maliyet oranı","efektif faiz","kredi maliyeti","IRR hesaplama"],
    canonical: 'https://hesapera.com/kredi-yillik-maliyet-orani',
    faq: [],
    relatedCalculators: ["kredi-hesaplama"]
  },
  fields: [
  {
    "id": "principalReceived",
    "label": "Elinize Geçen Net Tutar",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "monthlyPayment",
    "label": "Aylık Taksit Tutarı",
    "type": "currency",
    "required": true,
    "min": 0
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
    "id": "upfrontFees",
    "label": "Peşin Ödenen Masraflar",
    "type": "currency",
    "required": true,
    "min": 0
  }
],
  schema,
  calculate: (input) => {
    return calculateLoanAnnualCostRate(input.principalReceived, input.monthlyPayment, input.termMonths, input.upfrontFees);
  }
};


