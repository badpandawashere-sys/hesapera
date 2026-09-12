import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKarbonhidratIhtiyaci } from '../formulas/karbonhidratIhtiyaci';

const schema = z.object({
  kilo: z.number().min(20).max(300),
  aktiviteSeviyesi: z.enum(['Düşük', 'Orta', 'Yüksek', 'Çok Yüksek (Dayanıklılık Sporcusu)'])
});

type Input = z.infer<typeof schema>;

export const gunlukKarbonhidratIhtiyaciCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_gunluk_karbonhidrat_ihtiyaci_001',
  slug: 'gunluk-karbonhidrat-ihtiyaci',
  status: 'draft',
  name: 'Günlük Karbonhidrat İhtiyacı Hesaplama',
  shortDescription: 'Fiziksel aktivite seviyenize ve kilonuza göre almanız gereken tahmini günlük karbonhidrat miktarını hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Günlük Karbonhidrat İhtiyacı Hesaplama | Hesapera',
    description: 'Spor beslenmesi standartlarına (g/kg) göre fiziksel aktivite yoğunluğunuza uygun tahmini günlük karbonhidrat ihtiyacınızı öğrenin.',
    keywords: ['günlük karbonhidrat ihtiyacı hesaplama', 'karbonhidrat hesaplama', 'sporcu karbonhidrat', 'makro karbonhidrat ihtiyacı'],
    canonical: 'https://hesapera.com/gunluk-karbonhidrat-ihtiyaci',
    faq: [],
    relatedCalculators: ['gunluk-makro-besin-ihtiyaci']
  },
  fields: [
    { id: 'kilo', label: 'Vücut Ağırlığınız (kg)', type: 'number', required: true, min: 20, max: 300 },
    {
      id: 'aktiviteSeviyesi',
      label: 'Fiziksel Aktivite ve Spor Yoğunluğu',
      type: 'select',
      required: true,
      options: [
        { label: 'Düşük (Hafif Egzersiz / Sedanter)', value: 'Düşük' },
        { label: 'Orta (Düzenli Egzersiz / 1 Saatlik Antrenman)', value: 'Orta' },
        { label: 'Yüksek (Yoğun Dayanıklılık Sporu / 1-3 Saat)', value: 'Yüksek' },
        { label: 'Çok Yüksek (Elit Dayanıklılık Sporcusu / 4+ Saat)', value: 'Çok Yüksek (Dayanıklılık Sporcusu)' }
      ],
      defaultValue: 'Orta'
    }
  ],
  schema,
  calculate: (input) => calculateKarbonhidratIhtiyaci(input)
};


