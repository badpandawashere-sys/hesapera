import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCreditCardAdditionalInstallment } from '../formulas/creditCardAdditionalInstallment';

const schema = z.object({
  transactionAmount: z.number().positive('İşlem tutarı 0 dan büyük olmalıdır'),
  currentInstallments: z.number().int('Taksit sayısı tam sayı olmalıdır').positive('Taksit sayısı 0 dan büyük olmalıdır'),
  additionalInstallments: z.number().int('Ek taksit sayısı tam sayı olmalıdır').positive('Ek taksit sayısı 0 dan büyük olmalıdır')
});

type Input = z.infer<typeof schema>;

export const creditCardAdditionalInstallmentCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_creditCardAdditionalInstallment_001',
  slug: 'kredi-karti-ek-taksit',
  name: 'Kredi Kartı Ek Taksit Hesaplama',
  shortDescription: 'Mevcut taksitli işleminize ek taksit eklendiğinde yeni taksit tutarınızı faizsiz eşit bölüşüm varsayımıyla hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Kartı Ek Taksit Hesaplama Aracı | Hesapera',
    description: 'Mevcut taksitli işleminize ek taksit eklendiğinde yeni taksit tutarınızı faizsiz eşit bölüşüm varsayımıyla hesaplayın.',
    keywords: ["ek taksit","kredi kartı taksit","taksitlendirme","taksit bölme"],
    canonical: 'https://hesapera.com/kredi-karti-ek-taksit',
    faq: [],
    relatedCalculators: ["kredi-karti-islem-taksitlendirme"]
  },
  fields: [
  {
    "id": "transactionAmount",
    "label": "İşlem Tutarı",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "currentInstallments",
    "label": "Mevcut Taksit Sayısı",
    "type": "number",
    "required": true,
    "min": 1
  },
  {
    "id": "additionalInstallments",
    "label": "Ek Taksit Sayısı",
    "type": "number",
    "required": true,
    "min": 1
  }
],
  schema,
  calculate: (input) => {
    return calculateCreditCardAdditionalInstallment(input.transactionAmount, input.currentInstallments, input.additionalInstallments);
  }
};
