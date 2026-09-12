import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCreditCardInstallment } from '../formulas/creditCardInstallment';

const schema = z.object({
  transactionAmount: z.number().positive('İşlem tutarı 0 dan büyük olmalıdır'),
  installmentCount: z.number().int('Taksit sayısı tam sayı olmalıdır').positive('Taksit sayısı 0 dan büyük olmalıdır').max(36, 'Maksimum 36 ay taksitlendirilebilir'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const creditCardInstallmentCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_creditCardInstallment_001',
  slug: 'kredi-karti-islem-taksitlendirme',
  status: 'draft',
  name: 'Kredi Kartı İşlem Taksitlendirme Hesaplama',
  shortDescription: 'Peşin yaptığınız bir harcamayı sonradan taksitlendirmek istediğinizde aylık ödeme planını oluşturun.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Kartı İşlem Taksitlendirme Hesaplama Aracı | Hesapera',
    description: 'Peşin yaptığınız bir harcamayı sonradan taksitlendirmek istediğinizde aylık ödeme planını oluşturun.',
    keywords: ["işlem taksitlendirme","kredi kartı taksit","sonradan taksitlendirme","taksitli avans"],
    canonical: 'https://hesapera.com/kredi-karti-islem-taksitlendirme',
    faq: [],
    relatedCalculators: ["kredi-karti-ek-taksit","kredi-hesaplama"]
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
    "id": "installmentCount",
    "label": "Taksit Sayısı",
    "type": "number",
    "required": true,
    "min": 1,
    "max": 36
  },
  {
    "id": "monthlyInterestRate",
    "label": "Aylık Faiz Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01,
    "description": "Bankanızın taksitlendirme için uyguladığı güncel faiz oranını giriniz."
  }
],
  schema,
  calculate: (input) => {
    return calculateCreditCardInstallment(input.transactionAmount, input.installmentCount, input.monthlyInterestRate);
  }
};


