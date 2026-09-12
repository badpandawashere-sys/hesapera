import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAge } from '../formulas/age';

const schema = z.object({
  birthDate: z.string().min(1, 'Doğum tarihi seçiniz'),
  targetDate: z.string().optional()
}).refine(data => {
  const parseDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const bDate = parseDate(data.birthDate);
  const tDate = data.targetDate ? parseDate(data.targetDate) : new Date();
  tDate.setHours(0,0,0,0);
  return bDate <= tDate;
}, { message: 'Doğum tarihi, hedef tarihten büyük olamaz', path: ['birthDate'] });

type Input = z.infer<typeof schema>;

export const ageCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_age_001',
  slug: 'yas',
  name: 'Yaş Hesaplama',
  shortDescription: 'Doğum tarihinizden bugüne kadar ne kadar zaman geçtiğini detaylı hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Yaş Hesaplama Aracı | Hesapera',
    description: 'Doğum tarihinizden bugüne kadar ne kadar zaman geçtiğini detaylı hesaplayın.',
    keywords: ["yaş hesaplama","doğum günü","kaç yaşındayım"],
    canonical: 'https://hesapera.com/yas-hesaplama',
    icon: 'CalendarDays',
    faq: [],
    features: [
      { label: 'Detaylı Zaman', icon: 'Clock' },
      { label: 'Doğum Günü Sayacı', icon: 'Gift' }
    ],
    relatedCalculators: []
  },
  fields: [
  {
    "id": "birthDate",
    "label": "Doğum Tarihi",
    "type": "date",
    "required": true
  },
  {
    "id": "targetDate",
    "label": "Hedef Tarih (Opsiyonel)",
    "type": "date",
    "required": false,
    "description": "Boş bırakılırsa bugün baz alınır."
  }
],
  schema,
  calculate: (input) => {
    return calculateAge(input.birthDate, input.targetDate);
  }
};
