import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoss } from '../formulas/loss';

const schema = z.object({
  cost: z.number().positive('Maliyet 0 dan büyük olmalıdır'),
  sellingPrice: z.number().min(0, 'Satış fiyatı negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const lossCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loss_001',
  slug: 'zarar-hesaplama',
  name: 'Zarar Hesaplama',
  shortDescription: 'Satıştan doğan zararı ve zarar oranını anında bulun.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Zarar Hesaplama Aracı | Hesapera',
    description: 'Satıştan doğan zararı ve zarar oranını anında bulun.',
    keywords: ["zarar hesaplama","zarar marjı","satış zararı"],
    canonical: 'https://hesapera.com/zarar-hesaplama',
    faq: [],
    relatedCalculators: ["kar-hesaplama","indirim-hesaplama"]
  },
  fields: [
  {
    "id": "cost",
    "label": "Maliyet",
    "type": "currency",
    "required": true
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
    return calculateLoss(
      input.cost, input.sellingPrice
    );
  }
};
