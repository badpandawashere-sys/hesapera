import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateEbobEkok } from '../formulas/ebobEkok';

const schema = z.object({
  numbers: z.array(
    z.object({
      value: z.number({ message: "Lütfen geçerli bir sayı giriniz." })
        .int("Lütfen tam sayı giriniz.")
        .min(1, "1 veya daha büyük tam sayı giriniz.")
    })
  ).min(2, "En az iki sayı girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const ebobEkokCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ebob_ekok_001',
  slug: 'ebob-ekok',
  status: 'published',
  name: 'EBOB EKOK Hesaplama',
  shortDescription: 'İki veya daha fazla pozitif tam sayının En Büyük Ortak Bölenini (EBOB) ve En Küçük Ortak Katını (EKOK) hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'EBOB EKOK Hesaplama | Hesapera',
    description: 'Pozitif tam sayılar için EBOB (En Büyük Ortak Bölen) ve EKOK (En Küçük Ortak Kat) değerlerini anında hesaplayın.',
    keywords: ['ebob hesaplama', 'ekok hesaplama', 'en büyük ortak bölen', 'en küçük ortak kat', 'gcd lcm hesaplama', 'çoklu ebob ekok'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/ebob-ekok',
    faq: [
      {
        question: "Negatif sayıların EBOB/EKOK'u olur mu?",
        answer: "Matematiksel olarak bu kavramlar pozitif tam sayılar üzerinden işler. Aracımız da kurallar gereği sadece 1 ve daha büyük pozitif tam sayıların girişine izin vermektedir."
      },
      {
        question: "12 ve 18 sayılarının çarpımı neden EBOB ve EKOK çarpımına eşit?",
        answer: "Sadece 'iki sayı' için temel bir matematik kuralı vardır: İki sayının çarpımı (12×18=216), bu sayıların EBOB'u ile EKOK'unun çarpımına (6×36=216) her zaman eşittir. Üç ve daha fazla sayı girdiğinizde ise bu kural bozulur."
      }
    ],
    content: {
      intro: "İki veya daha fazla sayının En Büyük Ortak Böleni (EBOB) ve En Küçük Ortak Katının (EKOK) eş zamanlı hesaplanması",

      sections: [
        {
          title: "EBOB (En Büyük Ortak Bölen) Nedir?",
          paragraphs: [
            "İki veya daha fazla pozitif tam sayıyı, kalansız (tam) bölebilen en büyük sayıya EBOB denir. Günlük hayatta çubukları eşit parçalara bölme, kumaşları eş karelere ayırma veya eldeki malzemeleri gruplara paylaştırma gibi 'bütünleri parçalama' problemlerinde kullanılır."
          ]
        },
        {
          title: "EKOK (En Küçük Ortak Kat) Nedir?",
          paragraphs: [
            "Verilen sayıların hepsine kalansız bölünebilen en küçük pozitif tam sayıya EKOK denir. Vardiyalı çalışan hemşirelerin kaç gün sonra tekrar birlikte nöbet tutacağı, farklı uzunluktaki fayanslarla kare oluşturma veya otobüslerin aynı durakta kaç saatte bir karşılaşacağı gibi 'zaman/kombinasyon' (parçadan bütüne) problemlerinde kullanılır."
          ]
        },
        {
          title: "Matematiksel Formül Mantığı",
          paragraphs: [
            "Araç, EBOB hesabı için matematiksel Öklid (Euclidean) algoritmasını, ardından 'EKOK = (A × B) / EBOB(A, B)' formülünü kullanarak EKOK değerini aynı anda bulur.",
            "Eğer araca ikiden fazla sayı (örneğin 12, 18 ve 24) girerseniz, formül bu sayıları zincirleme olarak (reduce fonksiyonuyla) algoritmadan geçirir ve ortak kesişimlerini devasa hızda tespit eder."
          ]
        },
      ],
      example: {
        title: "Periyodik Zil (EKOK) Örneği",
        text: "Biri 12 dakikada bir, diğeri 18 dakikada bir çalan iki okul zili aynı anda çaldıktan sonra ilk kez kaç dakika sonra tekrar birlikte çalar? Araca 12 ve 18 girdiğinizde; hesaplayıcı EBOB olarak 6'yı, EKOK olarak ise 36'yı bulur. Zaman ortak noktası EKOK olduğundan, ziller 36 dakika sonra tekrar birlikte çalacaktır."
      }
    },

    relatedCalculators: ['asal-carpan', 'faktoriyel']
  },
  fields: [
    {
      id: 'numbers',
      label: 'Sayılar',
      type: 'array',
      required: true,
      defaultValue: [{ value: undefined }, { value: undefined }],
      subFields: [
        { id: 'value', label: 'Sayı', type: 'number', required: true, min: 1 }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateEbobEkok(input)
};
