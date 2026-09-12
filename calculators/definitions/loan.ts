import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoan } from '../formulas/loan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const loanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loan_001',
  slug: 'kredi',
  status: 'published',
  name: 'Kredi Hesaplama',
  shortDescription: 'Bireysel veya ticari kredilerinizin taksitlerini, faiz oranlarını ve geri ödeme planını anında hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Hesaplama Aracı | Hesapera',
    description: 'Bireysel veya ticari kredilerinizin taksitlerini, faiz oranlarını ve geri ödeme planını anında hesaplayın.',
    keywords: ["kredi hesaplama","kredi taksiti","amortisman planı","kredi faizi"],
    canonical: 'https://hesapera.com.tr/hesaplama/kredi',
    icon: 'WalletCards',
    faq: [],
    features: [
      { label: 'Taksit Hesaplama', icon: 'Calculator' },
      { label: 'Faiz Oranları', icon: 'Percent' },
      { label: 'Geri Ödeme Planı', icon: 'CalendarDays' },
      { label: 'Toplam Maliyet', icon: 'Banknote' }
    ],
    infoBox: {
      title: 'Daha Planlı Bir Finansal Gelecek',
      text: 'Doğru hesapla, doğru karar.',
      icon: 'ShieldCheck'
    },
    relatedCalculators: ["ihtiyac-kredisi","konut-kredisi","is-yeri-kredisi"]
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
    "id": "monthlyInterestRate",
    "label": "Aylık Faiz Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  },
  {
    "id": "termMonths",
    "label": "Vade (Ay)",
    "type": "number",
    "required": true,
    "min": 1,
    "max": 360
  }
],
  schema,
  calculate: (input) => {
    return calculateLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};


