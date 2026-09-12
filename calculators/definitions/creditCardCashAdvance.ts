import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCreditCardCashAdvance } from '../formulas/creditCardCashAdvance';

const schema = z.object({
  cashAdvanceAmount: z.number().positive('Tutar 0 dan büyük olmalıdır'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz'),
  installmentCount: z.number().int().positive('Taksit sayısı pozitif olmalıdır'),
  feeRate: z.number().min(0, 'Masraf oranı negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const creditCardCashAdvanceCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_creditCardCashAdvance_001',
  slug: 'kredi-karti-taksitli-nakit-avans',
  status: 'draft',
  name: 'Kredi Kartı Taksitli Nakit Avans Hesaplama',
  shortDescription: 'Çektiğiniz nakit avansın taksitlerini ve işlem ücretleriyle toplam maliyetini parametrik olarak hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Kartı Taksitli Nakit Avans Hesaplama Aracı | Hesapera',
    description: 'Çektiğiniz nakit avansın taksitlerini ve işlem ücretleriyle toplam maliyetini parametrik olarak hesaplayın.',
    keywords: ["taksitli nakit avans","kredi kartı nakit avans","nakit avans hesaplama"],
    canonical: 'https://hesapera.com/kredi-karti-taksitli-nakit-avans',
    faq: [],
    relatedCalculators: ["kredi-karti-islem-taksitlendirme","ihtiyac-kredisi"]
  },
  fields: [
  {
    "id": "cashAdvanceAmount",
    "label": "Nakit Avans Tutarı",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "monthlyInterestRate",
    "label": "Aylık Faiz Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
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
    "id": "feeRate",
    "label": "İşlem Ücreti Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01,
    "description": "Bankanızın keseceği nakit avans komisyonunu oran olarak girin."
  }
],
  schema,
  calculate: (input) => {
    return calculateCreditCardCashAdvance(input.cashAdvanceAmount, input.monthlyInterestRate, input.installmentCount, input.feeRate);
  }
};


