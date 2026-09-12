import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateVat } from '../formulas/vat';

const schema = z.object({
  amount: z.number().min(0, 'Tutar negatif olamaz'),
  rate: z.number().min(0, 'Oran negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const vatCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_vat_001',
  slug: 'kdv-hesaplama',
  status: 'draft',
  name: 'KDV Hesaplama',
  shortDescription: 'KDV dahil ve KDV hariç tutarları hızlıca hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'KDV Hesaplama Aracı | Hesapera',
    description: 'KDV dahil ve KDV hariç tutarları hızlıca hesaplayın.',
    keywords: ["kdv hesaplama","kdv dahil","kdv hariç","vergi hesaplama"],
    canonical: 'https://hesapera.com/kdv-hesaplama',
    faq: [],
    relatedCalculators: ["yuzde-hesaplama","indirim-hesaplama"]
  },
  fields: [
  {
    "id": "amount",
    "label": "Tutar",
    "type": "currency",
    "required": true
  },
  {
    "id": "rate",
    "label": "KDV Oranı (%)",
    "type": "percentage",
    "required": true
  }
],
  schema,
  calculate: (input) => {
    return calculateVat(
      input.amount, input.rate
    );
  }
};


