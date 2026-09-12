import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateIbanValidation } from '../formulas/ibanValidation';

const schema = z.object({
  iban: z.string().min(1, 'IBAN boş olamaz')
});

type Input = z.infer<typeof schema>;

export const ibanValidationCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ibanValidation_001',
  slug: 'iban-dogrulama',
  status: 'published',
  name: 'IBAN Doğrulama',
  shortDescription: 'Türkiye IBAN numarasının formatını ve MOD-97 doğrulama algoritmasını kontrol edin.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'IBAN Doğrulama Aracı | Hesapera',
    description: 'Türkiye IBAN numarasının formatını ve MOD-97 doğrulama algoritmasını kontrol edin.',
    keywords: ["iban doğrulama","iban kontrol","iban sorgulama","mod 97"],
    canonical: 'https://hesapera.com/iban-dogrulama',
    faq: [],
    relatedCalculators: ["doviz","faiz"]
  },
  fields: [
  {
    "id": "iban",
    "label": "IBAN",
    "type": "text",
    "required": true,
    "placeholder": "TR00 0000 0000 0000 0000 0000 00"
  }
],
  schema,
  calculate: (input) => {
    return calculateIbanValidation(input.iban);
  }
};

