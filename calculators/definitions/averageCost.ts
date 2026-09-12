import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAverageCost } from '../formulas/averageCost';

const schema = z.object({
  items: z.array(
    z.object({
      quantity: z.number().min(0, 'Miktar negatif olamaz'),
      unitPrice: z.number().min(0, 'Fiyat negatif olamaz')
    })
  ).min(1, 'En az bir kalem girmelisiniz')
}).refine(data => {
  const sumQ = data.items.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  return sumQ > 0;
}, { message: "Toplam miktar 0'dan büyük olmalıdır", path: ['items'] });

type Input = z.infer<typeof schema>;

export const averageCostCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_averageCost_001',
  slug: 'ortalama-maliyet-hesaplama',
  status: 'draft',
  name: 'Ortalama Maliyet Hesaplama',
  shortDescription: 'Farklı fiyatlardan alınan ürünlerin toplam ortalama maliyetini bulun.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Ortalama Maliyet Hesaplama Aracı | Hesapera',
    description: 'Farklı fiyatlardan alınan ürünlerin toplam ortalama maliyetini bulun.',
    keywords: ["ortalama maliyet","paçal hesaplama","birim maliyet"],
    canonical: 'https://hesapera.com/ortalama-maliyet-hesaplama',
    faq: [],
    relatedCalculators: ["kar-hesaplama","zarar-hesaplama"]
  },
  fields: [
  {
    "id": "items",
    "label": "Alımlar",
    "type": "array",
    "required": true,
    "defaultValue": [
      {
        "quantity": 100,
        "unitPrice": 20
      },
      {
        "quantity": 200,
        "unitPrice": 25
      }
    ],
    "subFields": [
      {
        "id": "quantity",
        "label": "Miktar",
        "type": "number",
        "required": true
      },
      {
        "id": "unitPrice",
        "label": "Birim Fiyat",
        "type": "currency",
        "required": true
      }
    ]
  }
],
  schema,
  calculate: (input) => {
    return calculateAverageCost(
      input.items
    );
  }
};


