import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateSigaraMaliyeti } from '../formulas/sigaraMaliyeti';

const schema = z.object({
  gunlukAdet: z.number().min(1).max(200),
  paketFiyati: z.number().min(1).max(1000),
  pakettekiAdet: z.number().min(1).max(100).default(20).optional()
});

type Input = z.infer<typeof schema>;

export const sigaraMaliyetiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_sigara_maliyeti_001',
  slug: 'sigara-maliyeti',
  status: 'draft',
  name: 'Sigara Maliyeti Hesaplama',
  shortDescription: 'Günlük içtiğiniz sigara adedi ve paket fiyatına göre aylık ve yıllık sigara masrafınızı hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Sigara Maliyeti Hesaplama | Hesapera',
    description: 'Günlük içtiğiniz sigara sayısına ve paket fiyatına göre aylık, yıllık ve 5 yıllık sigara maliyetinizi / harcamanızı hesaplayın.',
    keywords: ['sigara maliyeti hesaplama', 'sigara masrafı', 'aylık sigara harcaması', 'sigara bırakma maliyet hesabı'],
    canonical: 'https://hesapera.com/sigara-maliyeti',
    faq: [],
    relatedCalculators: []
  },
  fields: [
    { id: 'gunlukAdet', label: 'Günde Kaç Adet Sigara İçiyorsunuz?', type: 'number', required: true, min: 1, max: 200, defaultValue: 10 },
    { id: 'paketFiyati', label: 'Bir Paket Sigaranın Fiyatı (â‚º)', type: 'number', required: true, min: 1, max: 1000, defaultValue: 60 },
    { id: 'pakettekiAdet', label: 'Paketteki Sigara Adedi', type: 'number', required: false, min: 1, max: 100, defaultValue: 20 }
  ],
  schema,
  calculate: (input) => calculateSigaraMaliyeti(input)
};


