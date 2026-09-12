import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKokluSayi } from '../formulas/kokluSayi';

const schema = z.object({
  derece: z.number({ message: "Kök derecesi geçerli bir sayı olmalıdır" })
    .int("Kök derecesi tam sayı olmalıdır")
    .min(2, "Kök derecesi en az 2 olmalıdır")
    .default(2),
  sayi: z.number({ message: "Kökü alınacak sayıyı giriniz" })
}).superRefine((data, ctx) => {
  if (data.derece % 2 === 0 && data.sayi < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Çift dereceli kökler (karekök vb.) için sayı negatif olamaz.",
      path: ['sayi']
    });
  }
});

type Input = z.infer<typeof schema>;

export const kokluSayiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_koklu_sayi_001',
  slug: 'koklu-sayi',
  status: 'published',
  name: 'Köklü Sayı Hesaplama',
  shortDescription: 'Bir sayının karekök, küpkök veya n. dereceden kökünü gerçek sayılar kurallarına uygun olarak hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Köklü Sayı Hesaplama | Hesapera',
    description: 'Bir sayının n. dereceden kökünü (karekök, küpkök) anında hesaplayın. Tam kök tespiti ve negatif sayılarda tek kök desteği ile.',
    keywords: ["köklü sayı hesaplama", "karekök hesaplama", "küpkök", "karekök dışına çıkarma", "n. dereceden kök"],
    canonical: 'https://hesapera.com.tr/hesaplama/koklu-sayi',
    faq: [],
    relatedCalculators: ["uslu-sayi", "ebob-ekok"]
  },
  fields: [
    {
      id: 'derece',
      label: 'Kök Derecesi (n)',
      type: 'number',
      required: true,
      min: 2,
      defaultValue: 2,
      description: 'Örn: Karekök için 2, Küpkök için 3'
    },
    {
      id: 'sayi',
      label: 'Sayı (x)',
      type: 'number',
      required: true
    }
  ],
  schema,
  calculate: (input) => calculateKokluSayi(input)
};
