import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAverageMaturity } from '../formulas/averageMaturity';

const schema = z.object({
  items: z.array(z.object({
    amount: z.number().positive('Tutar 0 dan büyük olmalıdır'),
    days: z.number().min(0, 'Gün negatif olamaz')
  })).min(1, 'En az 1 satır giriniz')
});

type Input = z.infer<typeof schema>;

export const averageMaturityCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_averageMaturity_001',
  slug: 'ortalama-vade',
  status: 'draft',
  name: 'Ortalama Vade Hesaplama',
  shortDescription: 'Farklı tutarlardaki ödeme veya alacaklarınızın ağırlıklı ortalama vadesini (gün olarak) hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Ortalama Vade Hesaplama Aracı | Hesapera',
    description: 'Farklı tutarlardaki ödeme veya alacaklarınızın ağırlıklı ortalama vadesini (gün olarak) hesaplayın.',
    keywords: ["ortalama vade","ağırlıklı vade","vade hesaplama"],
    canonical: 'https://hesapera.com/ortalama-vade',
    faq: [],
    relatedCalculators: ["bono","ic-ve-dis-iskonto","faiz"]
  },
  fields: [
  {
    "id": "items",
    "label": "İşlem Kalemleri",
    "type": "array",
    "required": true,
    "subFields": [
      {
        "id": "amount",
        "label": "Tutar",
        "type": "number",
        "required": true,
        "min": 0
      },
      {
        "id": "days",
        "label": "Gün",
        "type": "number",
        "required": true,
        "min": 0
      }
    ]
  }
],
  schema,
  calculate: (input) => {
    return calculateAverageMaturity(input.items);
  }
};

