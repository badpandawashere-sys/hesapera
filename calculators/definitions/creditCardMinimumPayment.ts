import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCreditCardMinimumPayment } from '../formulas/creditCardMinimumPayment';

const schema = z.object({
  statementBalance: z.number().positive('Dönem borcu 0 dan büyük olmalıdır'),
  minimumPaymentRate: z.number().min(0, 'Oran negatif olamaz').max(100, 'Oran %100 den fazla olamaz')
});

type Input = z.infer<typeof schema>;

export const creditCardMinimumPaymentCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_creditCardMinimumPayment_001',
  slug: 'kredi-karti-asgari-odeme-tutari',
  status: 'published',
  name: 'Kredi Kartı Asgari Ödeme Tutarı Hesaplama',
  shortDescription: 'Kredi kartı dönem borcunuz üzerinden ödemeniz gereken asgari tutarı matematiksel olarak hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Kartı Asgari Ödeme Tutarı Hesaplama Aracı | Hesapera',
    description: 'Kredi kartı dönem borcunuz üzerinden ödemeniz gereken asgari tutarı matematiksel olarak hesaplayın.',
    keywords: ["kredi kartı asgari ödeme","kredi kartı borcu","minimum ödeme","dönem borcu"],
    canonical: 'https://hesapera.com.tr/hesaplama/kredi-karti-asgari-odeme-tutari',
    faq: [],
    relatedCalculators: ["kredi-karti-gecikme-faizi","kredi-karti-islem-taksitlendirme"]
  },
  fields: [
  {
    "id": "statementBalance",
    "label": "Dönem Borcu",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "minimumPaymentRate",
    "label": "Asgari Ödeme Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01,
    "description": "Bu oran bankanızın politikasına veya yasal mevzuata göre değişebilir. Kendi oranınızı girin."
  }
],
  schema,
  calculate: (input) => {
    return calculateCreditCardMinimumPayment(input.statementBalance, input.minimumPaymentRate);
  }
};


