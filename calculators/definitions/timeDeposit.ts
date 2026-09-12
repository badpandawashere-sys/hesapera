import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateTimeDeposit } from '../formulas/timeDeposit';

const schema = z.object({
  principal: z.number().positive('Anapara 0 dan büyük olmalıdır'),
  interestRate: z.number().min(0, 'Faiz negatif olamaz'),
  maturityType: z.enum(['days', 'months']),
  maturity: z.number().int().positive('Vade 0 dan büyük tam sayı olmalıdır'),
  taxRate: z.number().min(0).max(100)
});

type Input = z.infer<typeof schema>;

export const timeDepositCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_timeDeposit_001',
  slug: 'vadeli-mevduat-faizi',
  status: 'published',
  name: 'Vadeli Mevduat Faizi Hesaplama',
  shortDescription: 'Vadeli mevduatınızın anapara, faiz oranı, vade ve stopaj oranına göre net getirisini ve vade sonu bakiyesini hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Vadeli Mevduat Faizi Hesaplama Aracı | Hesapera',
    description: 'Vadeli mevduatınızın anapara, faiz oranı, vade ve stopaj oranına göre net getirisini ve vade sonu bakiyesini hesaplayın.',
    keywords: ["mevduat faizi","vadeli hesap","net faiz","stopajlı mevduat","vade sonu bakiye"],
    canonical: 'https://hesapera.com.tr/hesaplama/vadeli-mevduat-faizi',
    faq: [],
    relatedCalculators: ["faiz","bilesik-faiz-hesaplama","repo"]
  },
  fields: [
  {
    "id": "principal",
    "label": "Anapara (TL)",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "interestRate",
    "label": "Yıllık Faiz Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  },
  {
    "id": "maturityType",
    "label": "Vade Birimi",
    "type": "select",
    "required": true,
    "options": [
      {
        "label": "Gün",
        "value": "days"
      },
      {
        "label": "Ay",
        "value": "months"
      }
    ]
  },
  {
    "id": "maturity",
    "label": "Vade Süresi",
    "type": "number",
    "required": true,
    "min": 1
  },
  {
    "id": "taxRate",
    "label": "Stopaj Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "max": 100,
    "step": 0.01,
    "defaultValue": 15
  }
],
  schema,
  calculate: (input) => {
    return calculateTimeDeposit(input.principal, input.interestRate, input.maturityType, input.maturity, input.taxRate);
  }
};

