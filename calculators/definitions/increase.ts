import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateIncrease } from '../formulas/increase';

const schema = z.object({
  originalValue: z.number().positive('Tutar sıfırdan büyük olmalıdır'),
  increasePercentage: z.number().min(0, 'Oran negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const increaseCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_increase_001',
  slug: 'zam-hesaplama',
  status: 'draft',
  name: 'Zam Hesaplama',
  shortDescription: 'Maaş veya ürün fiyatlarına yapılan zam oranını ve yeni tutarı hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Zam Hesaplama Aracı | Hesapera',
    description: 'Maaş veya ürün fiyatlarına yapılan zam oranını ve yeni tutarı hesaplayın.',
    keywords: ["zam hesaplama","maaş zammı","fiyat artışı","yüzde zam"],
    canonical: 'https://hesapera.com/zam-hesaplama',
    faq: [],
    relatedCalculators: ["yuzde-hesaplama","indirim-hesaplama"]
  },
  fields: [
  {
    "id": "originalValue",
    "label": "Mevcut Tutar",
    "type": "currency",
    "required": true
  },
  {
    "id": "increasePercentage",
    "label": "Zam Oranı (%)",
    "type": "percentage",
    "required": true
  }
],
  schema,
  calculate: (input) => {
    return calculateIncrease(
      input.originalValue, input.increasePercentage
    );
  }
};


