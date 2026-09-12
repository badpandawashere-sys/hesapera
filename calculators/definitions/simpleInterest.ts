import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateSimpleInterest } from '../formulas/simpleInterest';

const schema = z.object({
  principal: z.number().positive('Anapara 0 dan büyük olmalıdır'),
  annualRate: z.number().min(0, 'Oran negatif olamaz'),
  termYears: z.number().positive('Vade 0 dan büyük olmalıdır')
});

type Input = z.infer<typeof schema>;

export const simpleInterestCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_simpleInterest_001',
  slug: 'basit-faiz',
  name: 'Basit Faiz Hesaplama',
  shortDescription: 'Anapara, faiz oranı ve vade ile basit faiz getirisini hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Basit Faiz Hesaplama Aracı | Hesapera',
    description: 'Anapara, faiz oranı ve vade ile basit faiz getirisini hesaplayın.',
    keywords: ["basit faiz","faiz getirisi","kredi faizi"],
    canonical: 'https://hesapera.com/basit-faiz-hesaplama',
    faq: [],
    relatedCalculators: ["yuzde-hesaplama","bilesik-faiz-hesaplama"]
  },
  fields: [
  {
    "id": "principal",
    "label": "Anapara",
    "type": "currency",
    "required": true
  },
  {
    "id": "annualRate",
    "label": "Yıllık Faiz Oranı (%)",
    "type": "percentage",
    "required": true
  },
  {
    "id": "termYears",
    "label": "Vade (Yıl)",
    "type": "number",
    "required": true
  }
],
  schema,
  calculate: (input) => {
    return calculateSimpleInterest(
      input.principal, input.annualRate, input.termYears
    );
  }
};
