import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculatePercentage } from '../formulas/percentage';

const percentageSchema = z.object({
  baseValue: z.number(),
  percentage: z.number(),
});

type PercentageInput = z.infer<typeof percentageSchema>;

export const percentageCalculatorDef: CalculatorDefinition<PercentageInput, number> = {
  id: 'calc_percentage_001',
  slug: 'yuzde',
  status: 'published',
  name: 'Yüzde Hesaplama',
  shortDescription: 'Bir sayının belirli bir yüzdesini hızlıca hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Yüzde Hesaplama Aracı | Hesapera',
    description: 'En kolay ve hızlı yüzde hesaplama aracı. Bir sayının yüzdesini bulmak, indirim hesaplamak veya artış oranını görmek için hemen kullanın.',
    keywords: ['yüzde hesaplama', 'yüzde hesaplama aracı', 'indirim hesaplama', 'matematik'],
    canonical: 'https://hesapera.com.tr/hesaplama/yuzde',
    icon: 'Percent',
    features: [
      { label: 'İndirim Hesaplama', icon: 'Tag' },
      { label: 'Artış Oranı', icon: 'TrendingUp' },
      { label: 'Değişim Oranı', icon: 'BarChart' }
    ],
    faq: [
      {
        question: 'Yüzde nasıl hesaplanır?',
        answer: 'Bir sayının yüzdesi, o sayının 100\'e bölünüp istenen yüzde oranıyla çarpılmasıyla bulunur.'
      }
    ],
    relatedCalculators: ['kdv-hesaplama', 'oran-oranti-hesaplama']
  },
  fields: [
    {
      id: 'baseValue',
      label: 'Sayı (Ana Değer)',
      type: 'number',
      required: true,
      placeholder: 'Örn: 1000'
    },
    {
      id: 'percentage',
      label: 'Yüzde Oranı (%)',
      type: 'percentage',
      required: true,
      placeholder: 'Örn: 20'
    }
  ],
  schema: percentageSchema,
  calculate: (input) => {
    return calculatePercentage(input.baseValue, input.percentage);
  }
};


