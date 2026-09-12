import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoanRestructuring } from '../formulas/loanRestructuring';

const schema = z.object({
  remainingPrincipal: z.number().positive('Yapılandırılacak borç 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  newMonthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  newTermMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const loanRestructuringCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loanRestructuring_001',
  slug: 'kredi-yapilandirma',
  name: 'Kredi Yapılandırma Hesaplama',
  shortDescription: 'Mevcut kredi bakiyenizi yeni faiz oranı ve vade ile yapılandırdığınızda aylık taksit, toplam ödeme ve toplam faiz tutarını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Yapılandırma Hesaplama',
    description: 'Mevcut kredi bakiyenizi yeni faiz oranı ve vade ile yapılandırdığınızda aylık taksit, toplam ödeme ve toplam faiz tutarını hesaplayın.',
    keywords: ["kredi yapılandırma", "borç transferi", "kredi yenileme", "yapılandırma faizi"],
    canonical: 'https://hesapera.com.tr/hesaplama/kredi-yapilandirma',
    icon: 'RefreshCw',
    faq: [],
    features: [
      { label: 'Yeni Taksit', icon: 'Calculator' },
      { label: 'Yeni Faiz Oranları', icon: 'Percent' },
      { label: 'Geri Ödeme Planı', icon: 'CalendarDays' },
      { label: 'Toplam Maliyet', icon: 'Banknote' }
    ],
    infoBox: {
      title: 'Kredi Yapılandırma Hesaplaması Nasıl Yapılır?',
      text: 'Mevcut bakiye, yeni faiz oranı ve yeni vade dikkate alınarak standart eşit taksitli annüite yöntemi ile yeni ödeme planınız simüle edilir.',
      icon: 'Info'
    },
    relatedCalculators: ["kredi", "ihtiyac-kredisi", "konut-kredisi"]
  },
  fields: [
    {
      id: "remainingPrincipal",
      label: "Yapılandırılacak Borç / Mevcut Bakiye",
      type: "currency",
      required: true,
      min: 0
    },
    {
      id: "newMonthlyInterestRate",
      label: "Yeni Aylık Faiz Oranı (%)",
      type: "percentage",
      required: true,
      min: 0,
      step: 0.01
    },
    {
      id: "newTermMonths",
      label: "Yeni Vade (Ay)",
      type: "number",
      required: true,
      min: 1,
      max: 360
    }
  ],
  schema,
  calculate: (input) => {
    return calculateLoanRestructuring(input.remainingPrincipal, input.newMonthlyInterestRate, input.newTermMonths);
  }
};
