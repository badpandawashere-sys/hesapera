import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateFinancialDiscount } from '../formulas/financialDiscount';

const schema = z.object({
  discountType: z.enum(['inner', 'outer'], { message: 'İskonto türü seçilmelidir' }),
  nominalValue: z.number({ message: 'Nominal değer girilmelidir' })
    .positive('Nominal değer 0 dan büyük olmalıdır')
    .finite('Geçersiz (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz (NaN)'),
  annualRate: z.number({ message: 'İskonto oranı girilmelidir' })
    .positive('İskonto oranı 0 dan büyük olmalıdır')
    .finite('Geçersiz (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz (NaN)'),
  remainingDays: z.number({ message: 'Vade girilmelidir' })
    .int('Gün tam sayı olmalıdır')
    .positive('Vade 0 dan büyük olmalıdır')
    .finite('Geçersiz (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz (NaN)')
});

type Input = z.infer<typeof schema>;

export const financialDiscountCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ic_ve_dis_iskonto_031',
  slug: 'ic-ve-dis-iskonto',
  status: 'draft',
  name: 'İç ve Dış İskonto Hesaplama',
  shortDescription: 'İç iskonto ve dış iskonto hesaplama formülleriyle senedin veya finansal varlığın net bugünkü değerini simüle edin.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'İç ve Dış İskonto Hesaplama Aracı | Hesapera',
    description: 'İç (gerçek) iskonto ve dış (ticari) iskonto hesaplama formülleriyle senedin veya finansal varlığın peşin değerini (net bugünkü değerini) hesaplayın.',
    keywords: ["iskonto hesaplama","iç iskonto","dış iskonto","net bugünkü değer", "ticari iskonto", "peşin değer hesaplama"],
    canonical: 'https://hesapera.com.tr/hesaplama/ic-ve-dis-iskonto',
    faq: [],
    relatedCalculators: ["faiz", "bono", "eurobond"]
  },
  fields: [
    {
      id: "discountType",
      label: "Hesaplama Türü",
      type: "select",
      required: true,
      defaultValue: "inner",
      options: [
        { label: "İç İskonto", value: "inner" },
        { label: "Dış İskonto", value: "outer" }
      ]
    },
    {
      id: "nominalValue",
      label: "Nominal Değer (Vade Sonu Değer - TL)",
      type: "currency",
      required: true,
      min: 0.01,
      placeholder: "10000"
    },
    {
      id: "annualRate",
      label: "Yıllık İskonto Oranı (%)",
      type: "percentage",
      required: true,
      min: 0.01,
      placeholder: "15"
    },
    {
      id: "remainingDays",
      label: "Vadeye Kalan Gün Sayısı",
      type: "number",
      required: true,
      min: 1,
      placeholder: "90"
    }
  ],
  schema,
  calculate: (input) => {
    return calculateFinancialDiscount(input);
  }
};

