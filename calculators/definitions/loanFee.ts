import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoanFee } from '../formulas/loanFee';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır'),
  feeRate: z.number().min(0, 'Oran negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const loanFeeCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loanFee_001',
  slug: 'kredi-dosya-masrafi',
  status: 'draft',
  name: 'Kredi Dosya Masrafı Hesaplama',
  shortDescription: 'Kullanacağınız krediden kesilecek olan dosya masrafını matematiksel olarak hesaplayın. Oran mevzuata göre değişebilir.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Dosya Masrafı Hesaplama Aracı | Hesapera',
    description: 'Kullanacağınız krediden kesilecek olan dosya masrafını matematiksel olarak hesaplayın. Oran mevzuata göre değişebilir.',
    keywords: ["kredi dosya masrafı","kredi tahsis ücreti","masraf hesaplama"],
    canonical: 'https://hesapera.com/kredi-dosya-masrafi',
    faq: [],
    relatedCalculators: ["kredi-hesaplama"]
  },
  fields: [
  {
    "id": "loanAmount",
    "label": "Kredi Tutarı",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "feeRate",
    "label": "Dosya Masrafı Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01,
    "description": "Bu araç, girilen oran üzerinden matematiksel hesaplama yapar."
  }
],
  schema,
  calculate: (input) => {
    return calculateLoanFee(input.loanAmount, input.feeRate);
  }
};


