import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoanAnnualCostRate, LoanCostParams } from '../formulas/loanAnnualCostRate';

const schema = z.object({
  loanType: z.enum(['ihtiyac', 'tasit', 'konut']),
  principal: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır'),
  monthlyInterestRate: z.number().min(0, 'Aylık faiz oranı negatif olamaz'),
  termMonths: z.number().int().positive('Vade pozitif olmalıdır'),
  allocationFee: z.number().min(0, 'Tahsis ücreti negatif olamaz').default(0),
  insuranceFee: z.number().min(0, 'Sigorta ücreti negatif olamaz').default(0),
  appraisalFee: z.number().min(0, 'Ekspertiz ücreti negatif olamaz').default(0),
  mortgageFee: z.number().min(0, 'İpotek ücreti negatif olamaz').default(0),
  otherFees: z.number().min(0, 'Diğer ücretler negatif olamaz').default(0),
  advancedMode: z.boolean().optional()
});

type Input = z.infer<typeof schema>;

export const loanAnnualCostRateCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loanAnnualCostRate_001',
  slug: 'kredi-yillik-maliyet-orani',
  status: 'published',
  name: 'Kredi Yıllık Maliyet Oranı Hesaplama',
  shortDescription: 'Kredi tutarı, faiz ve peşin masrafları dikkate alarak efektif yıllık maliyet oranını (APR) hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Yıllık Maliyet Oranı Hesaplama Aracı | Hesapera',
    description: 'Bireysel, taşıt ve konut kredilerinizin yönetmeliğe uygun yıllık efektif maliyet oranını hesaplayın.',
    keywords: ["yıllık maliyet oranı","efektif faiz","kredi maliyeti","IRR hesaplama"],
    canonical: 'https://hesapera.com.tr/hesaplama/kredi-yillik-maliyet-orani',
    faq: [],
    relatedCalculators: ["kredi", "ihtiyac-kredisi", "konut-kredisi", "tasit-kredisi"]
  },
  fields: [
    {
      id: "loanType",
      label: "Kredi Türü",
      type: "select",
      required: true,
      options: [
        { label: "İhtiyaç Kredisi", value: "ihtiyac" },
        { label: "Taşıt Kredisi", value: "tasit" },
        { label: "Konut Kredisi", value: "konut" }
      ],
      defaultValue: "ihtiyac"
    },
    {
      id: "principal",
      label: "Kredi Tutarı",
      type: "currency",
      required: true,
      min: 0
    },
    {
      id: "monthlyInterestRate",
      label: "Aylık Faiz Oranı (%)",
      type: "number",
      required: true,
      min: 0
    },
    {
      id: "termMonths",
      label: "Vade (Ay)",
      type: "number",
      required: true,
      min: 1,
      max: 360
    },
    {
      id: "allocationFee",
      label: "Kredi Tahsis Ücreti",
      type: "currency",
      required: false,
      defaultValue: 0
    },
    {
      id: "advancedMode",
      label: "Ekstra Masraflar ve Gelişmiş Seçenekler",
      type: "checkbox",
      required: false,
      defaultValue: false
    },
    {
      id: "insuranceFee",
      label: "Zorunlu Sigorta Maliyeti",
      description: "Kredi şartı olan peşin sigorta maliyeti",
      type: "currency",
      required: false,
      defaultValue: 0,
      conditions: [{ fieldId: 'advancedMode', operator: 'equals', value: true }]
    },
    {
      id: "appraisalFee",
      label: "Ekspertiz Ücreti",
      type: "currency",
      required: false,
      defaultValue: 0,
      conditions: [{ fieldId: 'advancedMode', operator: 'equals', value: true }]
    },
    {
      id: "mortgageFee",
      label: "İpotek/Rehin Tesis Ücreti",
      type: "currency",
      required: false,
      defaultValue: 0,
      conditions: [{ fieldId: 'advancedMode', operator: 'equals', value: true }]
    },
    {
      id: "otherFees",
      label: "Diğer Peşin Masraflar",
      type: "currency",
      required: false,
      defaultValue: 0,
      conditions: [{ fieldId: 'advancedMode', operator: 'equals', value: true }]
    }
  ],
  schema,
  calculate: (input) => {
    return calculateLoanAnnualCostRate(minera(input));
  }
};

function minera(input: any): LoanCostParams {
  return {
    loanType: input.loanType,
    principal: (input.principal || 0),
    monthlyInterestRate: (input.monthlyInterestRate || 0),
    termMonths: (input.termMonths || 0),
    allocationFee: (input.allocationFee || 0),
    insuranceFee: (input.insuranceFee || 0),
    appraisalFee: (input.appraisalFee || 0),
    mortgageFee: (input.mortgageFee || 0),
    otherFees: (input.otherFees || 0)
  };
}
