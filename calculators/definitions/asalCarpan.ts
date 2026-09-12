import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAsalCarpan } from '../formulas/asalCarpan';

const schema = z.object({
  sayi: z.number().int("Lütfen tam sayı giriniz.").min(1, "Lütfen 1 veya daha büyük bir sayı giriniz.")
});

type Input = z.infer<typeof schema>;

export const asalCarpanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_asal_carpan_001',
  slug: 'asal-carpan',
  name: 'Asal Çarpanlara Ayırma',
  shortDescription: 'Bir pozitif tam sayının asal çarpanlarını ve üslü gösterimini hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Asal Çarpanlara Ayırma Hesaplama | Hesapera',
    description: 'Pozitif tam sayıları asal çarpanlarına ayırın, listesini görün ve üslü formda matematiksel ifadesini inceleyin.',
    keywords: ['asal çarpan', 'asal çarpanlara ayırma', 'asal sayı', 'matematik asal çarpan', 'ebob ekok çarpan'],
    canonical: 'https://hesapera.com/asal-carpan',
    faq: [],
    relatedCalculators: []
  },
  fields: [
    {
      id: 'sayi',
      label: 'Pozitif Tam Sayı',
      type: 'number',
      required: true,
      min: 1
    }
  ],
  schema,
  calculate: (input) => calculateAsalCarpan(input)
};
