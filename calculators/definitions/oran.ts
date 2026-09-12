import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateOran } from '../formulas/oran';

const schema = z.object({
  a: z.number().int('Tam sayı olmalıdır').positive('Sıfırdan büyük olmalıdır'),
  b: z.number().int('Tam sayı olmalıdır').positive('Sıfırdan büyük olmalıdır')
});

type Input = z.infer<typeof schema>;

export const oranCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_oran_001',
  slug: 'oran',
  status: 'published',
  name: 'Oran Hesaplama',
  shortDescription: 'İki sayı arasındaki oranı sadeleştirerek en basit formunda bulun.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Oran Hesaplama (Sadeleştirme) | Hesapera',
    description: 'İki sayı arasındaki oranı hesaplayın ve en sade haliyle (A:B) görün. Kesir sadeleştirme aracı.',
    keywords: ["oran hesaplama", "kesir sadeleştirme", "oran orantı", "oran bulma"],
    canonical: 'https://hesapera.com.tr/hesaplama/oran',
    faq: [
      {
        question: "Oran ve Orantı arasındaki fark nedir?",
        answer: "Oran iki çokluğun bölünerek karşılaştırılmasıdır (Örn: 2/3). Orantı ise iki veya daha fazla oranın birbirine eşit olması durumudur (Örn: 2/3 = 4/6)."
      },
      {
        question: "Bu hesaplayıcı ondalık veya küsuratlı sayı kabul eder mi?",
        answer: "Sadeleştirme ve EBOB formülünün doğru çalışabilmesi için A ve B değerlerinin tam sayı olması gerekir. Küsuratlı oranlarınız varsa her iki tarafı da (örneğin 10 veya 100 ile) çarparak tam sayıya çevirdikten sonra girebilirsiniz."
      }
    ],
    content: {
      intro: "İki büyüklüğün birbiriyle karşılaştırılması, kesir haline getirilmesi ve oran sadeleştirme",

      sections: [
        {
          title: "Oran Nedir?",
          paragraphs: [
            "Oran, aynı birimle ifade edilen iki farklı büyüklüğün veya değerin birbirine bölünerek karşılaştırılmasıdır. Genellikle 'A:B' veya 'A/B' şeklinde gösterilir.",
            "Günlük hayatta harita ölçeklerinde, yemek tariflerindeki malzemelerin birbirine orantısında, ekran çözünürlüklerinde (örn: 16:9) veya karışım hesaplarında sıklıkla karşımıza çıkar."
          ]
        },
        {
          title: "Oran Nasıl Sadeleştirilir?",
          paragraphs: [
            "Hesaplayıcı, girdiğiniz A ve B sayılarının En Büyük Ortak Bölenini (EBOB) bularak her iki sayıyı da bu ortak değere böler.",
            "Sadeleştirme, oranın özünü bozmadan en küçük tam sayılarla (en basit haliyle) yazılmasını sağlar. Örneğin 200 ve 100 sayılarının oranı, 2:1 olarak sadeleşir."
          ]
        },
      ],
      example: {
        title: "Karışım (Tarif) Örneği",
        text: "Bir kek yaparken 300 gram un ve 150 gram şeker koymanız gerekiyorsa, unun şekere oranını bulmak için A:300 ve B:150 değerlerini girersiniz. Hesaplayıcı EBOB'un 150 olduğunu tespit eder ve size sadeleştirilmiş oran olarak '2:1' sonucunu verir. Yani şekerin her 1 birimine karşılık, un 2 birim olmalıdır."
      }
    },

    relatedCalculators: ["ebob-ekok", "yuzde"]
  },
  fields: [
    { id: 'a', label: 'Birinci Sayı (A)', type: 'number', required: true, min: 1 },
    { id: 'b', label: 'İkinci Sayı (B)', type: 'number', required: true, min: 1 }
  ],
  schema,
  calculate: (input) => calculateOran(input)
};


