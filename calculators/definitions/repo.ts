import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateRepo } from '../formulas/repo';

const schema = z.object({
  principal: z.number().positive('Tutar 0 dan büyük olmalıdır'),
  repoRate: z.number().min(0, 'Oran negatif olamaz'),
  days: z.number().int().positive('Gün sayısı 0 dan büyük olmalıdır'),
  taxRate: z.number().min(0).max(100)
});

type Input = z.infer<typeof schema>;

export const repoCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_repo_001',
  slug: 'repo',
  status: 'draft',
  name: 'Repo Hesaplama',
  shortDescription: 'Repo işleminizin anapara, faiz oranı ve vade gününe göre vade sonu net getirisini ve stopaj tutarını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Repo Hesaplama Aracı | Hesapera',
    description: 'Repo işleminizin anapara, faiz oranı ve vade gününe göre vade sonu net getirisini ve stopaj tutarını hesaplayın.',
    keywords: ["repo hesaplama","repo getirisi","ters repo","stopajlı repo"],
    canonical: 'https://hesapera.com/repo',
    faq: [],
    relatedCalculators: ["faiz","bono","ic-verim-orani"]
  },
  fields: [
  {
    "id": "principal",
    "label": "Repo Tutarı (Anapara)",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "repoRate",
    "label": "Repo Faiz Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  },
  {
    "id": "days",
    "label": "Vade (Gün)",
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
    return calculateRepo(input.principal, input.repoRate, input.days, input.taxRate);
  }
};

