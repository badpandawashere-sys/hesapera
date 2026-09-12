import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCommercialVehicleLoan } from '../formulas/commercialVehicleLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const commercialVehicleLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_commercialVehicleLoan_001',
  slug: 'ticari-arac-kredisi',
  name: 'Ticari Araç Kredisi Hesaplama',
  shortDescription: 'Ticari faaliyetlerinizde kullanmak üzere alacağınız araçlar için ticari araç kredisi geri ödeme planını oluşturun.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Ticari Araç Kredisi Hesaplama Aracı | Hesapera',
    description: 'Ticari faaliyetlerinizde kullanmak üzere alacağınız araçlar için ticari araç kredisi geri ödeme planını oluşturun.',
    keywords: ["ticari araç kredisi","kamyonet kredisi","ticari otomobil kredisi"],
    canonical: 'https://hesapera.com/ticari-arac-kredisi',
    faq: [],
    relatedCalculators: ["tasit-kredisi","ticari-kredi","ticari-ihtiyac-kredisi"]
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateCommercialVehicleLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};