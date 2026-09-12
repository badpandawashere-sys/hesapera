import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCompoundInterest } from '../formulas/compoundInterest';

const schema = z.object({
  principal: z.number().positive('Anapara 0 dan büyük olmalıdır'),
  annualRate: z.number().min(0, 'Oran negatif olamaz'),
  termYears: z.number().positive('Vade 0 dan büyük olmalıdır'),
  compoundingFrequency: z.string().min(1, 'Sıklık seçiniz')
});

type Input = z.infer<typeof schema>;

export const compoundInterestCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_compoundInterest_001',
  slug: 'bilesik-faiz',
  status: 'draft',
  name: 'Bileşik Faiz Hesaplama',
  shortDescription: 'Bileşik faiz mantığıyla gelecekteki toplam değeri ve kazancınızı hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Bileşik Faiz Hesaplama Aracı | Hesapera',
    description: 'Bileşik faiz mantığıyla gelecekteki toplam değeri ve kazancınızı hesaplayın.',
    keywords: ["bileşik faiz","gelecek değer","faiz hesaplama"],
    canonical: 'https://hesapera.com/bilesik-faiz-hesaplama',
    faq: [],
    relatedCalculators: ["basit-faiz-hesaplama"]
  },
  fields: [
  {
    "id": "principal",
    "label": "Anapara",
    "type": "currency",
    "required": true
  },
  {
    "id": "annualRate",
    "label": "Yıllık Faiz Oranı (%)",
    "type": "percentage",
    "required": true
  },
  {
    "id": "termYears",
    "label": "Vade (Yıl)",
    "type": "number",
    "required": true
  },
  {
    "id": "compoundingFrequency",
    "label": "Faiz İşleme Sıklığı",
    "type": "select",
    "required": true,
    "defaultValue": "1",
    "options": [
      {
        "label": "Yıllık",
        "value": "1"
      },
      {
        "label": "6 Aylık",
        "value": "2"
      },
      {
        "label": "3 Aylık",
        "value": "4"
      },
      {
        "label": "Aylık",
        "value": "12"
      },
      {
        "label": "Günlük",
        "value": "365"
      }
    ]
  }
],
  schema,
  calculate: (input) => {
    return calculateCompoundInterest(
      input.principal, input.annualRate, input.termYears, input.compoundingFrequency
    );
  }
};


