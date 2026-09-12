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
  shortDescription: 'IBAN numaranızın formatını, uzunluğunu ve MOD-97 kontrolünü hızlıca doğrulayın.',
  category: 'finance',
  type: 'simple',
  metadata: {
    title: 'IBAN Doğrulama ve IBAN Kontrolü | Hesapera',
    description: 'IBAN numaranızın formatını, uzunluğunu ve MOD-97 kontrolünü hızlıca doğrulayın. Türkiye ve desteklenen ülkeler için IBAN kontrolü.',
    keywords: ["iban doğrulama","iban kontrol","iban sorgulama","mod-97","iban numarası kontrolü"],
    canonical: 'https://hesapera.com.tr/hesaplama/iban-dogrulama',
    faq: [],
    relatedCalculators: ["kredi", "ihtiyac-kredisi"]
  },
  fields: [
    {
      id: "iban",
      label: "IBAN Numarası",
      type: "text",
      required: true,
      placeholder: "TR00 0000 0000 0000 0000 0000 00"
    }
  ],
  schema,
  calculate: (input) => {
    return calculateIbanValidation(input.iban);
  }
};
