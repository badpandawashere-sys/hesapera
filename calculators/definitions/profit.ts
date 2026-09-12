import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateProfit } from '../formulas/profit';

const schema = z.object({
  cost: z.number().min(0, 'Maliyet negatif olamaz'),
  sellingPrice: z.number().min(0, 'Satış fiyatı negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const profitCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_profit_001',
  slug: 'kar-hesaplama',
  status: 'draft',
  name: 'Kâr Hesaplama',
  shortDescription: 'Bir satıştan elde ettiğiniz kârı ve kâr marjını hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Kâr Hesaplama Aracı | Hesapera',
    description: 'Bir satıştan elde ettiğiniz kârı ve kâr marjını hesaplayın.',
    keywords: ["kâr hesaplama","kâr marjı","satış kârı"],
    canonical: 'https://hesapera.com/kar-hesaplama',
    faq: [],
    relatedCalculators: ["zarar-hesaplama","indirim-hesaplama"]
  },
  fields: [
  {
    "id": "cost",
    "label": "Maliyet",
    "type": "currency",
    "required": true,
    "defaultValue": 0
  },
  {
    "id": "sellingPrice",
    "label": "Satış Fiyatı",
    "type": "currency",
    "required": true
  }
],
  schema,
  calculate: (input) => {
    return calculateProfit(
      input.cost, input.sellingPrice
    );
  }
};


