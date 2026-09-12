import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateSavings } from '../formulas/savings';

const schema = z.object({
  initialDeposit: z.number().min(0, 'Başlangıç tutarı negatif olamaz'),
  periodicContribution: z.number().min(0, 'Aylık katkı negatif olamaz'),
  annualInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz'),
  termMonths: z.number().int().positive('Süre pozitif olmalıdır')
});

type Input = z.infer<typeof schema>;

export const savingsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_savings_001',
  slug: 'birikim',
  status: 'published',
  name: 'Birikim Hesaplama',
  shortDescription: 'Başlangıç sermayeniz ve düzenli aylık katkılarınızla, varsayımsal bir getiri oranı üzerinden gelecekteki birikiminizi hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Birikim Hesaplama Aracı | Hesapera',
    description: 'Başlangıç sermayeniz ve düzenli aylık katkılarınızla, varsayımsal bir getiri oranı üzerinden gelecekteki birikiminizi hesaplayın.',
    keywords: ["birikim hesaplama","düzenli yatırım","mevduat hesaplama","yatırım getirisi"],
    canonical: 'https://hesapera.com.tr/hesaplama/birikim',
    faq: [],
    relatedCalculators: ["bilesik-buyume","altin"]
  },
  fields: [
  {
    "id": "initialDeposit",
    "label": "Başlangıç Birikimi (TL)",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "periodicContribution",
    "label": "Aylık Düzenli Katkı (TL)",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "annualInterestRate",
    "label": "Beklenen Yıllık Getiri Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01,
    "description": "Bankaların sunduğu faiz değil, sizin öngördüğünüz tahmini brüt getiri oranıdır."
  },
  {
    "id": "termMonths",
    "label": "Süre (Ay)",
    "type": "number",
    "required": true,
    "min": 1,
    "max": 1200
  }
],
  schema,
  calculate: (input) => {
    return calculateSavings(input.initialDeposit, input.periodicContribution, input.annualInterestRate, input.termMonths);
  }
};

