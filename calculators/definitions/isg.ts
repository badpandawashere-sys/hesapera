import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateIsg } from '../formulas/isg';

const schema = z.object({
  examClass: z.enum(['A', 'B', 'C']),
  correct: z.number().int().min(0).max(100),
  wrong: z.number().int().min(0).max(100)
});

type Input = z.infer<typeof schema>;

export const isgCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_isg_001',
  slug: 'isg-puan',
  status: 'draft',
  name: 'İSG Puan Hesaplama',
  shortDescription: 'ÇSGB İş Sağlığı ve Güvenliği Uzmanlık Sınavı (Sınıf A/B/C) doğru/yanlış sayılarınıza göre puanınızı ve başarı durumunuzu hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'İSG Puan Hesaplama â€” İş Sağlığı ve Güvenliği Uzmanlık Sınavı | Hesapera',
    description: 'ÇSGB İSG Uzmanlık Sınavı Sınıf A/B/C için doğru/yanlış sayılarınıza göre puanınızı ve başarı durumunuzu hesaplayın.',
    keywords: ['isg puan hesaplama', 'iş güvenliği uzmanı sınavı', 'isg sınıf a b c', 'çsgb isg sınav'],
    canonical: 'https://hesapera.com/isg-puan',
    faq: [],
    relatedCalculators: ['hmgs-puan', 'ekpss-puan']
  },
  fields: [
    {
      id: 'examClass',
      label: 'Sınav Sınıfı',
      type: 'select',
      required: true,
      options: [
        { label: 'Sınıf A â€” Çok Tehlikeli (Geçme: 75)', value: 'A' },
        { label: 'Sınıf B â€” Tehlikeli (Geçme: 70)', value: 'B' },
        { label: 'Sınıf C â€” Az Tehlikeli (Geçme: 70)', value: 'C' }
      ]
    },
    { id: 'correct', label: 'Doğru Sayısı', type: 'number', required: true, min: 0, max: 100 },
    { id: 'wrong', label: 'Yanlış Sayısı', type: 'number', required: true, min: 0, max: 100 }
  ],
  schema,
  calculate: (input) => calculateIsg(input.correct, input.wrong, input.examClass)
};

