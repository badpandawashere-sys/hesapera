import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateSutyenBedeni } from '../formulas/sutyenBedeni';

const schema = z.object({
  gogusAltiCevresi: z.number().min(50).max(150),
  gogusCevresi: z.number().min(60).max(200)
}).superRefine((data, ctx) => {
  if (data.gogusCevresi <= data.gogusAltiCevresi) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Göğüs çevresi, göğüs altı çevresinden büyük olmalıdır.", path: ['gogusCevresi'] });
  }
});

type Input = z.infer<typeof schema>;

export const sutyenBedeniCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_sutyen_bedeni_001',
  slug: 'sutyen-bedeni',
  name: 'Sütyen Bedeni Hesaplama',
  shortDescription: 'Göğüs altı ve göğüs çevresi ölçülerinizi girerek Avrupa (EU) standartlarında tahmini sütyen bedeninizi ve kup ölçünüzü öğrenin.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Sütyen Bedeni Hesaplama (Kup Ölçüsü) | Hesapera',
    description: 'EN 13402 Avrupa standartlarına göre göğüs ve göğüs altı ölçülerinizi kullanarak doğru sütyen bedeninizi (Kup ve Sırt ölçüsü) hesaplayın.',
    keywords: ['sütyen bedeni hesaplama', 'kup ölçüsü nasıl hesaplanır', 'doğru sütyen bedeni', 'sütyen ölçüsü', 'A B C D kup hesaplama'],
    canonical: 'https://hesapera.com/sutyen-bedeni',
    faq: [],
    relatedCalculators: []
  },
  fields: [
    { id: 'gogusAltiCevresi', label: 'Göğüs Altı Çevresi (cm)', type: 'number', required: true, min: 50, max: 150 },
    { id: 'gogusCevresi', label: 'Göğüs Çevresi (cm)', type: 'number', required: true, min: 60, max: 200 }
  ],
  schema,
  calculate: (input) => calculateSutyenBedeni(input)
};
