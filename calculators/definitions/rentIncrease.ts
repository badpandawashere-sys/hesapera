import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateRentIncrease } from '../formulas/rentIncrease';

const schema = z.object({
  currentRent: z.number().positive('Kira 0 dan büyük olmalıdır'),
  increaseRate: z.number().min(0, 'Oran negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const rentIncreaseCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_rentIncrease_001',
  slug: 'kira-artis-orani',
  name: 'Kira Artış Oranı Hesaplama',
  shortDescription: 'Eski kira bedeli ve artış oranından yeni kira bedelinizi hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kira Artış Oranı Hesaplama Aracı | Hesapera',
    description: 'Eski kira bedeli ve artış oranından yeni kira bedelinizi hesaplayın.',
    keywords: ["kira artışı","kira artış oranı","yeni kira","tefe tüfe kira artışı"],
    canonical: 'https://hesapera.com/kira-artis-orani',
    faq: [],
    relatedCalculators: ["yuzde-hesaplama","zam-hesaplama","enflasyon"]
  },
  fields: [
  {
    "id": "currentRent",
    "label": "Mevcut Kira Bedeli",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "increaseRate",
    "label": "Artış Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  }
],
  schema,
  calculate: (input) => {
    return calculateRentIncrease(input.currentRent, input.increaseRate);
  }
};