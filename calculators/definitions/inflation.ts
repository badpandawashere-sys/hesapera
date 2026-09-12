import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateInflation } from '../formulas/inflation';

const schema = z.object({
  startAmount: z.number()
    .min(0, 'Başlangıç tutarı 0 veya daha büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)'),
  startIndex: z.number()
    .positive('Başlangıç endeksi 0\'dan büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)'),
  endIndex: z.number()
    .positive('Bitiş endeksi 0\'dan büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)')
});

type Input = z.infer<typeof schema>;

export const inflationCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_inflation_025',
  slug: 'enflasyon',
  status: 'published',
  name: 'Enflasyon Hesaplama',
  shortDescription: 'Başlangıç ve bitiş endeks (TÜFE) değerlerini girerek parasal tutarın enflasyon karşısındaki değişimini hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Enflasyon Hesaplama Aracı | Hesapera',
    description: 'Başlangıç ve bitiş endeks (TÜFE) değerlerini girerek parasal tutarın enflasyon karşısındaki değişimini, enflasyon oranını ve fiyat artışını anında hesaplayın.',
    keywords: ["enflasyon hesaplama","parasal değer","tüfe hesaplama","fiyat artışı"],
    canonical: 'https://hesapera.com.tr/hesaplama/enflasyon',
    faq: [
      {
        question: "Enflasyon oranı nasıl belirlenir?",
        answer: "Enflasyon oranı, TÜİK tarafından her ay açıklanan Tüketici Fiyat Endeksi (TÜFE) verilerindeki değişime göre belirlenir."
      },
      {
        question: "Enflasyon hesaplama aracı kesin sonuç mu verir?",
        answer: "Hesaplama aracı matematiksel orantı kurarak çalışır. Piyasada her malın fiyatı aynı oranda artmadığı için, enflasyon hesabı 'ortalama' bir alım gücü değişimi sunar."
      }
    ],
    content: {
      intro: "Enflasyon hesaplamanın mantığı, paranın zaman içindeki alım gücü değişimi ve oranların hesaplanması hakkında bilinmesi gerekenler",

      sections: [
        {
          title: "Enflasyon Nedir ve Neyi Gösterir?",
          paragraphs: [
            "Enflasyon, mal ve hizmet fiyatlarının genel seviyesindeki sürekli artışı ifade eder. Fiyatlar genel seviyesi yükseldiğinde, aynı miktar para ile daha az mal veya hizmet satın alınabilir. Yani enflasyon, paranın alım gücündeki düşüşün temel göstergesidir.",
            "Enflasyon hesaplaması sadece fiyatların ne kadar arttığını değil, aynı zamanda geçmişteki bir paranın bugünkü eşdeğer değerini (veya bugünkü bir paranın geçmişteki karşılığını) bulmamıza yardımcı olur."
          ]
        },
        {
          title: "Tekil Oran vs. Birikimli Enflasyon",
          paragraphs: [
            "Aylık veya yıllık enflasyon oranları, sadece o döneme ait fiyat artışını yansıtır. Ancak uzun vadeli bir değerlendirme yaparken (örneğin son 5 yılın toplam enflasyonu), her yılın enflasyonu bir önceki yılın fiyatlı değeri üzerine eklenerek 'birikimli (kümülatif)' olarak hesaplanır.",
            "Hesaplama aracımızda belirtilen bir başlangıç ve bitiş tutarı üzerinden fiyat endekslerindeki değişim dikkate alınarak oransal artış veya düşüşler tespit edilir."
          ]
        },
      ],
      example: {
        title: "Alım Gücü Örneği (100 TL Hesabı)",
        text: "Eğer bir yılda %50 enflasyon yaşandıysa, geçen yıl tam 100 TL'ye aldığınız bir sepet mal, bu yıl ortalama 150 TL'ye satılıyor demektir. Tersinden düşünürsek, bugün elinizde bulunan 100 TL'nin alım gücü, geçen yılki 66,6 TL'ye denk gelmektedir."
      },
      sources: [
        {
          name: "TÜİK - Tüketici Fiyat Endeksi (TÜFE)",
          url: "https://www.tuik.gov.tr/"
        },
        {
          name: "TCMB - Enflasyon Verileri",
          url: "https://www.tcmb.gov.tr/"
        }
      ]
    },

    relatedCalculators: ["birikim","bilesik-buyume","faiz"]
  },
  fields: [
    {
      id: "startAmount",
      label: "Başlangıç Tutarı (TL)",
      type: "currency",
      required: true,
      min: 0,
      placeholder: "1000"
    },
    {
      id: "startIndex",
      label: "Başlangıç Dönemi Endeksi",
      type: "number",
      required: true,
      min: 0.01,
      step: 0.01,
      placeholder: "100"
    },
    {
      id: "endIndex",
      label: "Bitiş Dönemi Endeksi",
      type: "number",
      required: true,
      min: 0.01,
      step: 0.01,
      placeholder: "120"
    }
  ],
  schema,
  calculate: (input) => {
    return calculateInflation(input.startAmount, input.startIndex, input.endIndex);
  }
};

