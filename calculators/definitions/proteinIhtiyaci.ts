import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateProteinIhtiyaci } from '../formulas/proteinIhtiyaci';

const schema = z.object({
  kilo: z.number().min(20).max(300),
  aktiviteSeviyesi: z.enum(['Sedanter (Hareketsiz)', 'Düzenli Egzersiz (Hafif/Orta)', 'Sporcu (Güç/Dayanıklılık)'])
});

type Input = z.infer<typeof schema>;

export const gunlukProteinIhtiyaciCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_gunluk_protein_ihtiyaci_001',
  slug: 'gunluk-protein-ihtiyaci',
  status: 'draft',
  name: 'Günlük Protein İhtiyacı Hesaplama',
  shortDescription: 'Fiziksel aktivitenize ve vücut ağırlığınıza göre günlük protein ihtiyacınızı EFSA ve ISSN standartlarında hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Günlük Protein İhtiyacı Hesaplama | Hesapera',
    description: 'Fiziksel aktivite seviyenize ve vücut ağırlığınıza göre (g/kg) tahmini günlük protein ihtiyacınızı WHO ve ISSN referanslarıyla hesaplayın.',
    keywords: ['günlük protein ihtiyacı hesaplama', 'protein hesabı', 'günde kaç gram protein', 'kas yapımı için protein', 'sporcu beslenmesi'],
    canonical: 'https://hesapera.com/gunluk-protein-ihtiyaci',
    faq: [],
    relatedCalculators: ['gunluk-makro-besin-ihtiyaci', 'gunluk-kalori-ihtiyaci']
  },
  fields: [
    { id: 'kilo', label: 'Vücut Ağırlığınız (kg)', type: 'number', required: true, min: 20, max: 300 },
    {
      id: 'aktiviteSeviyesi',
      label: 'Fiziksel Aktivite Seviyesi',
      type: 'select',
      required: true,
      options: [
        { label: 'Sedanter (Hareketsiz)', value: 'Sedanter (Hareketsiz)' },
        { label: 'Düzenli Egzersiz (Hafif/Orta)', value: 'Düzenli Egzersiz (Hafif/Orta)' },
        { label: 'Sporcu (Güç/Dayanıklılık)', value: 'Sporcu (Güç/Dayanıklılık)' }
      ],
      defaultValue: 'Düzenli Egzersiz (Hafif/Orta)'
    }
  ],
  schema,
  calculate: (input) => calculateProteinIhtiyaci(input)
};


