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
    content: {
      intro: "Bir sayının belirli bir yüzdesini hızlıca bulmanın matematiksel yöntemi",

      sections: [
        {
          title: "Yüzde Nedir?",
          paragraphs: [
            "Yüzde ('%'), bir sayının yüz eşit parçaya bölünmesiyle ifade edilen matematiksel bir orandır. Yüzde hesaplaması; finanstan alışverişe, sınavlardan vergi (KDV vb.) hesaplamalarına kadar günlük hayatın her alanında bir büyüklüğün parçasını belirtmek için kullanılır."
          ]
        },
        {
          title: "Bir Sayının Yüzdesi Nasıl Bulunur?",
          paragraphs: [
            "En basit ve geçerli formül şudur: (Ana Sayı x İstenen Yüzde Oranı) / 100.",
            "Eğer 2.000 TL'nin %15'ini bulmak istiyorsak, 2000'i 15 ile çarpıp (30.000), çıkan sonucu 100'e böleriz (300). Yani cevap 300'dür."
          ]
        },
      ],
      example: {
        title: "İndirim Hesaplamasında Yüzde",
        text: "Eğer fiyatı 500 TL olan bir üründe '%20 İndirim' etiketi görüyorsanız, hesaplayıcıya ana sayı olarak 500, yüzde olarak 20 girersiniz. Çıkan sonuç 100 TL'dir. Bu miktar cebinizde kalacak indirim miktarıdır. Yeni fiyatı bulmak için 500'den 100'ü çıkarırsınız (400 TL)."
      }
    },

    features: [
      { label: 'İndirim Hesaplama', icon: 'Tag' },
      { label: 'Artış Oranı', icon: 'TrendingUp' },
      { label: 'Değişim Oranı', icon: 'BarChart' }
    ],
    faq: [
      {
        question: "100 TL %20 artıp sonra %20 azalırsa yine 100 TL mi olur?",
        answer: "Hayır. 100 TL %20 artarsa 120 TL olur. 120 TL üzerinden %20 indirim yapıldığında ise (120x20/100 = 24), yeni fiyat 120 - 24 = 96 TL olur. Yüzde oranları daima uygulandıkları ana değer üzerinden işler."
      },
      {
        question: "Yüzde artış ve azalışı doğrudan bu formülle bulabilir miyim?",
        answer: "Evet, örneğin ana paranızın %10 zamlı halini bulmak isterseniz ana değer x 110 / 100 yapabilir veya aracın bulduğu değeri (örneğin %10 hesabı) ilk fiyata ekleyebilirsiniz."
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


