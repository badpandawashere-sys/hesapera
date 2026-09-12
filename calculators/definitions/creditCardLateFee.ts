import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCreditCardLateFee } from '../formulas/creditCardLateFee';

const schema = z.object({
  overdueAmount: z.number().positive('Geciken tutar 0 dan büyük olmalıdır'),
  monthlyDelayRate: z.number().min(0, 'Oran negatif olamaz'),
  delayMonths: z.number().positive('Süre 0 dan büyük olmalıdır')
});

type Input = z.infer<typeof schema>;

export const creditCardLateFeeCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_creditCardLateFee_001',
  slug: 'kredi-karti-gecikme-faizi',
  status: 'published',
  name: 'Kredi Kartı Gecikme Faizi Hesaplama',
  shortDescription: 'Kredi kartı dönem borcunuzu geciktirdiğinizde doğacak gecikme faizi ve toplam borcu parametrik olarak hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Kartı Gecikme Faizi Hesaplama Aracı | Hesapera',
    description: 'Kredi kartı dönem borcunuzu geciktirdiğinizde doğacak gecikme faizi ve toplam borcu parametrik olarak hesaplayın.',
    keywords: ["kredi kartı gecikme faizi","gecikme zammı","temerrüt","kredi kartı borcu"],
    canonical: 'https://hesapera.com/kredi-karti-gecikme-faizi',
    faq: [],
    relatedCalculators: ["kredi-gecikme-faizi","kredi-karti-asgari-odeme-tutari"]
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
    "description": "Bankanızın uyguladığı güncel gecikme faizi oranını giriniz."
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
    return calculateCreditCardLateFee(input.overdueAmount, input.monthlyDelayRate, input.delayMonths);
  }
};


