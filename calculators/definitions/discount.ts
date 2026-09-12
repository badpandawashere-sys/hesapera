import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateDiscount } from '../formulas/discount';

const schema = z.object({
  price: z.number().positive('Fiyat 0 dan büyük olmalıdır'),
  discountRate: z.number().min(0, 'İndirim oranı negatif olamaz').max(100, 'İndirim oranı 100 den büyük olamaz')
});

type Input = z.infer<typeof schema>;

export const discountCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_discount_001',
  slug: 'indirim-hesaplama',
  name: 'İndirim Hesaplama',
  shortDescription: 'Bir ürünün veya hizmetin indirimli fiyatını ve indirim tutarını kolayca hesaplayın.',
  category: 'finance',
  type: 'simple',
  metadata: {
    title: 'İndirim Hesaplama Aracı | Hesapera',
    description: 'Bir ürünün veya hizmetin indirimli fiyatını ve indirim tutarını kolayca hesaplayın.',
    keywords: ["indirim", "yüzde indirim", "indirimli fiyat"],
    canonical: 'https://hesapera.com/indirim-hesaplama',
    faq: []
  },
  fields: [
    {
      id: 'price',
      label: 'Fiyat',
      type: 'currency',
      required: true,
      min: 0
    },
    {
      id: 'discountRate',
      label: 'İndirim Oranı (%)',
      type: 'percentage',
      required: true,
      min: 0,
      max: 100,
      step: 0.01
    }
  ],
  schema,
  calculate: (input) => {
    return calculateDiscount(input.price, input.discountRate);
  }
};