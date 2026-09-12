import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateBond } from '../formulas/bond';

const schema = z.object({
  nominalValue: z.number().positive('Nominal değer 0 dan büyük olmalıdır'),
  purchasePrice: z.number().positive('Alış fiyatı 0 dan büyük olmalıdır'),
  daysToMaturity: z.number().int().positive('Vade gün sayısı pozitif olmalıdır')
});

type Input = z.infer<typeof schema>;

export const bondCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_bond_000', // avoid 001 clash
  slug: 'bono',
  status: 'draft',
  name: 'Bono Hesaplama',
  shortDescription: 'Hazine bonosu getiri hesabı. İskontolu ihraç edilen bononun yıllık basit ve bileşik getirisini hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Bono Hesaplama Aracı | Hesapera',
    description: 'Hazine bonosu getiri hesabı.',
    keywords: ["bono", "hazine bonosu", "iskontolu bono"],
    canonical: 'https://hesapera.com/bono',
    faq: [],
    relatedCalculators: ["tahvil","eurobond"]
  },
  fields: [
    { id: 'nominalValue', label: 'Nominal Değer (Vade Sonu Dönüş)', type: 'currency', required: true, min: 0 },
    { id: 'purchasePrice', label: 'Alış Fiyatı', type: 'currency', required: true, min: 0 },
    { id: 'daysToMaturity', label: 'Vadeye Kalan Gün', type: 'number', required: true, min: 1 }
  ],
  schema,
  calculate: (input) => {
    return calculateBond(input.nominalValue, input.purchasePrice, input.daysToMaturity);
  }
};

