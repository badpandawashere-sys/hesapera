import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKreatinDozu } from '../formulas/kreatinDozu';

const schema = z.object({
  kilo: z.number().min(30).max(250),
  yasGrup: z.enum(['Yetişkin', '18 Yaş Altı']),
  protokol: z.enum(['Yükleme (Loading)', 'Koruma (Maintenance)'])
});

type Input = z.infer<typeof schema>;

export const gunlukKreatinDozuCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_gunluk_kreatin_dozu_001',
  slug: 'gunluk-kreatin-dozu',
  status: 'draft',
  name: 'Günlük Kreatin Dozu Hesaplama',
  shortDescription: 'Uluslararası Spor Beslenmesi Derneği (ISSN) standartlarına göre kilonuza ve takviye protokolünüze uygun kreatin dozunu hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Günlük Kreatin Dozu Hesaplama (Yükleme ve Koruma) | Hesapera',
    description: 'Vücut ağırlığınıza göre günlük kullanmanız gereken kreatin miktarını (yükleme evresi veya koruma dozu) ISSN referanslarıyla öğrenin.',
    keywords: ['günlük kreatin dozu hesaplama', 'kreatin hesaplama', 'kreatin yükleme', 'kreatin kullanımı', 'sporcu takviyesi'],
    canonical: 'https://hesapera.com/gunluk-kreatin-dozu',
    faq: [],
    relatedCalculators: ['gunluk-makro-besin-ihtiyaci']
  },
  fields: [
    {
      id: 'yasGrup',
      label: 'Yaş Grubunuz',
      type: 'select',
      required: true,
      options: [
        { label: 'Yetişkin (18 Yaş ve Üzeri)', value: 'Yetişkin' },
        { label: '18 Yaş Altı', value: '18 Yaş Altı' }
      ],
      defaultValue: 'Yetişkin'
    },
    { id: 'kilo', label: 'Vücut Ağırlığınız (kg)', type: 'number', required: true, min: 30, max: 250 },
    {
      id: 'protokol',
      label: 'Kullanım Protokolü',
      type: 'select',
      required: true,
      options: [
        { label: 'İlk Defa / Yükleme Evresi (İlk 5-7 Gün)', value: 'Yükleme (Loading)' },
        { label: 'Günlük Koruma Dozu (Standart Kullanım)', value: 'Koruma (Maintenance)' }
      ],
      defaultValue: 'Koruma (Maintenance)'
    }
  ],
  schema,
  calculate: (input) => calculateKreatinDozu(input)
};


