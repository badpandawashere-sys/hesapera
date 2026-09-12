import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAltinOran } from '../formulas/altinOran';

const schema = z.object({
  uzunKenar: z.number().min(0.0001),
  kisaKenar: z.number().min(0.0001)
}).superRefine((data, ctx) => {
  if (data.kisaKenar > data.uzunKenar) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Kısa kenar değeri, uzun kenar değerinden büyük olamaz.", path: ['kisaKenar'] });
  }
});

type Input = z.infer<typeof schema>;

export const altinOranCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_altin_oran_001',
  slug: 'altin-oran',
  status: 'draft',
  name: 'Altın Oran Hesaplama',
  shortDescription: 'İki uzunluk değerinizin birbirine oranının matematiksel Altın Oran (1.618) sabitine ne kadar uygun olduğunu hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Altın Oran (Phi) Hesaplama | Hesapera',
    description: 'Uzun ve kısa kenar değerlerinizi girerek oranlarının kusursuz matematiksel Altın Oran (1.6180...) sabitine uygunluğunu test edin.',
    keywords: ['altın oran hesaplama', 'phi sayısı', 'altın oran nedir', 'altın oran testi', 'oran orantı hesabı'],
    canonical: 'https://hesapera.com/altin-oran',
    faq: [],
    relatedCalculators: []
  },
  fields: [
    { id: 'uzunKenar', label: 'Uzun Kenar / Uzunluk Değeri', type: 'number', required: true, min: 0 },
    { id: 'kisaKenar', label: 'Kısa Kenar / Uzunluk Değeri', type: 'number', required: true, min: 0 }
  ],
  schema,
  calculate: (input) => calculateAltinOran(input)
};


