import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoanEarlyPayoffPenalty } from '../formulas/loanEarlyPayoffPenalty';

const schema = z.object({
  remainingPrincipal: z.number().positive('Kalan anapara 0 dan büyük olmalıdır'),
  penaltyRate: z.number().min(0, 'Ceza oranı negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const loanEarlyPayoffPenaltyCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loanEarlyPayoffPenalty_001',
  slug: 'kredi-erken-kapatma-cezasi',
  name: 'Kredi Erken Kapatma Cezası Hesaplama',
  shortDescription: 'Kredinizi vadesinden önce kapatmak istediğinizde ödemeniz gereken ceza tutarını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Erken Kapatma Cezası Hesaplama Aracı | Hesapera',
    description: 'Kredinizi vadesinden önce kapatmak istediğinizde ödemeniz gereken ceza tutarını hesaplayın.',
    keywords: ["erken kapatma cezası","kredi kapama","erken ödeme tazminatı"],
    canonical: 'https://hesapera.com/kredi-erken-kapatma-cezasi',
    faq: [],
    relatedCalculators: ["kredi-hesaplama","kredi-dosya-masrafi"]
  },
  fields: [
  {
    "id": "remainingPrincipal",
    "label": "Kalan Anapara",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "penaltyRate",
    "label": "Erken Kapatma Ceza Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01,
    "description": "Mevzuata veya sözleşmenize göre değişebilir, bankanızın belirttiği oranı girin."
  }
],
  schema,
  calculate: (input) => {
    return calculateLoanEarlyPayoffPenalty(input.remainingPrincipal, input.penaltyRate);
  }
};
