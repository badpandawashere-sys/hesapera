import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoanLateFee } from '../formulas/loanLateFee';

const schema = z.object({
  overdueAmount: z.number().positive('Geciken tutar 0 dan büyük olmalıdır'),
  monthlyDelayRate: z.number().min(0, 'Gecikme oranı negatif olamaz'),
  delayMonths: z.number().positive('Gecikme süresi 0 dan büyük olmalıdır')
});

type Input = z.infer<typeof schema>;

export const loanLateFeeCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loanLateFee_001',
  slug: 'kredi-gecikme-faizi',
  name: 'Kredi Gecikme Faizi Hesaplama',
  shortDescription: 'Gecikmiş kredi taksitleriniz için uygulanacak gecikme faizi ve toplam ödeme tutarını bulun.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Gecikme Faizi Hesaplama Aracı | Hesapera',
    description: 'Gecikmiş kredi taksitleriniz için uygulanacak gecikme faizi ve toplam ödeme tutarını bulun.',
    keywords: ["gecikme faizi","kredi gecikmesi","temerrüt faizi"],
    canonical: 'https://hesapera.com/kredi-gecikme-faizi',
    faq: [],
    relatedCalculators: ["kredi-hesaplama"]
  },
  fields: [
  {
    "id": "overdueAmount",
    "label": "Geciken Tutar",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "monthlyDelayRate",
    "label": "Aylık Gecikme Faiz Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01,
    "description": "Kullanıcının girdiği oran üzerinden hesaplama yapılır."
  },
  {
    "id": "delayMonths",
    "label": "Gecikme Süresi (Ay)",
    "type": "number",
    "required": true,
    "min": 0
  }
],
  schema,
  calculate: (input) => {
    return calculateLoanLateFee(input.overdueAmount, input.monthlyDelayRate, input.delayMonths);
  }
};
