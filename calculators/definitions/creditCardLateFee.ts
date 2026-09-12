import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCreditCardLateFee } from '../formulas/creditCardLateFee';

const schema = z.object({
  overdueAmount: z.number().positive('Geciken tutar 0 dan büyük olmalıdır'),
  monthlyDelayRate: z.number().min(0, 'Aylık faiz oranı negatif olamaz'),
  delayDays: z.number().min(0, 'Gün sayısı negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const creditCardLateFeeCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_creditCardLateFee_001',
  slug: 'kredi-karti-gecikme-faizi',
  status: 'published',
  name: 'Kredi Kartı Gecikme Faizi Hesaplama',
  shortDescription: 'Bankanızın uyguladığı aylık gecikme faiz oranını girerek kredi kartı gecikme faizinizi ve tahmini toplam borcunuzu hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Kartı Gecikme Faizi Hesaplama Aracı | Hesapera',
    description: 'Bankanızın uyguladığı aylık faiz oranı üzerinden kredi kartı gecikme faizini ve toplam borcunuzu hesaplayın.',
    keywords: ["kredi kartı gecikme faizi","gecikme zammı","temerrüt","kredi kartı borcu","TCMB azami oran"],
    canonical: 'https://hesapera.com.tr/hesaplama/kredi-karti-gecikme-faizi',
    faq: [],
    relatedCalculators: ["kredi-karti-asgari-odeme-tutari", "kredi-yapilandirma", "kredi"]
  },
  fields: [
    {
      id: "overdueAmount",
      label: "Gecikmeye Giren Tutar",
      type: "currency",
      required: true,
      min: 0
    },
    {
      id: "monthlyDelayRate",
      label: "Aylık Gecikme Faiz Oranı (%)",
      type: "number",
      required: true,
      min: 0,
      step: 0.01,
      description: "Bankanızın uyguladığı gerçek gecikme faiz oranını giriniz."
    },
    {
      id: "delayDays",
      label: "Gecikme Gün Sayısı",
      type: "number",
      required: true,
      min: 0
    }
  ],
  schema,
  calculate: (input) => {
    return calculateCreditCardLateFee(
      input.overdueAmount,
      input.monthlyDelayRate,
      input.delayDays
    );
  }
};
