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
  name: 'KÃ¢r Hesaplama',
  shortDescription: 'Bir satıştan elde ettiğiniz kÃ¢rı ve kÃ¢r marjını hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'KÃ¢r Hesaplama Aracı | Hesapera',
    description: 'Bir satıştan elde ettiğiniz kÃ¢rı ve kÃ¢r marjını hesaplayın.',
    keywords: ["kÃ¢r hesaplama","kÃ¢r marjı","satış kÃ¢rı"],
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


