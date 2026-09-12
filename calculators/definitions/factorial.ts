import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateFactorial } from '../formulas/factorial';

const schema = z.object({
  n: z.number({ message: 'Değer girilmelidir' })
    .int('Tam sayı olmalıdır')
    .min(0, 'Negatif sayı faktöriyeli tanımlı değildir')
    .max(2000, 'Çok büyük değerler desteklenmemektedir (Maks. 2000)')
    .finite("Geçersiz (Infinity)")
    .refine(v => !isNaN(v), "Geçersiz (NaN)")
});

type Input = z.infer<typeof schema>;

export const factorialCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_factorial_030',
  slug: 'faktoriyel',
  status: 'published',
  name: 'Faktöriyel Hesaplama',
  shortDescription: 'Bir tam sayının faktöriyelini (n!) kesin doğrulukla hesaplayın. (n! = n × n-1 ... × 1)',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Faktöriyel Hesaplama Aracı (n!) | Hesapera',
    description: 'Verilen n sayısının faktöriyelini (n!) doğru bir şekilde hesaplayın. Büyük faktöriyeller (BigInt) için kesin değer sonucu veren hesaplayıcı.',
    keywords: ["faktöriyel hesaplama", "n! hesaplama", "faktöriyel formülü", "matematik faktöriyel", "0 faktöriyel"],
    canonical: 'https://hesapera.com.tr/hesaplama/faktoriyel',
    faq: [
      {
        question: "Negatif sayıların (Örn: -5!) faktöriyeli neden hesaplanamaz?",
        answer: "Faktöriyel kavramı sadece doğal sayılar (0 ve pozitif tam sayılar) için tanımlanmıştır. Negatif sayılarla çarpım zinciri kurulamaz, bu nedenle tanımsızdır."
      },
      {
        question: "0! (Sıfır faktöriyel) neden 0 değil de 1'dir?",
        answer: "0 elemanlı bir kümenin kendisi gibi boş bir küme olarak sıralanabilme biçimi tam olarak 1 adettir. Kombinasyon ve permütasyon denklemlerinin tutarlı olabilmesi için matematikçiler tarafından 0! sonucu 1 olarak tanımlanmıştır."
      }
    ],
    content: {
      intro: "Faktöriyel kavramı, n! gösterimi ve matematik hesaplamasındaki yeri hakkında rehber",

      sections: [
        {
          title: "Faktöriyel (n!) Nedir?",
          paragraphs: [
            "Matematikte faktöriyel, 1'den başlayarak belirli bir 'n' sayısına kadar olan tüm doğal sayıların birbiriyle çarpımını ifade eden işlemdir ve yanına ünlem işareti ('!') konularak gösterilir.",
            "Kombinasyon, permütasyon, olasılık ve istatistik gibi gelişmiş matematik kollarında (kaç farklı ihtimal olabileceğini hesaplarken) sıklıkla kullanılır."
          ]
        },
        {
          title: "Nasıl Hesaplanır?",
          paragraphs: [
            "Sisteme sadece pozitif bir tam sayı girilmelidir. Hesaplama işleminde örneğin 5 girerseniz, formül 5 x 4 x 3 x 2 x 1 hesaplamasını yaparak sonucu 120 olarak verir.",
            "Matematikte özel ve istisnai bir kural olarak 0! (Sıfır faktöriyel) tanımsal olarak 1 kabul edilir. Araç bu istisnayı otomatik olarak işler."
          ]
        },
        {
          title: "Sayı Sınırları ve Büyüme Hızı",
          paragraphs: [
            "Faktöriyel çok agresif büyüyen bir fonksiyondur. Örneğin sadece 10! bile 3.628.800'dür. Sayılar biraz daha büyüdüğünde sonuçlar devasa boyutlara ulaşır ve hesaplanması zorlaşır. Hesaplama aracı makul sınırlar içerisindeki faktöriyelleri hesaplayabilir; eksi değerli (negatif) sayıların ise matematiğin tanımı gereği faktöriyeli bulunmaz."
          ]
        },
      ],
      example: {
        title: "Permütasyon Örneği (Kaç farklı şekilde sıralanır?)",
        text: "Elinizde 4 farklı renkte kitap varsa ve bunları rafa kaç farklı şekilde dizebileceğinizi merak ediyorsanız cevap 4!'tür. Hesaplayıcıya 4 girersiniz ve sonuç 4 x 3 x 2 x 1 = 24 çıkar. Yani 24 farklı ihtimal vardır."
      }
    },

    relatedCalculators: ["kombinasyon", "permutasyon", "ebob-ekok"]
  },
  fields: [
    {
      id: "n",
      label: "Sayı (n)",
      type: "number",
      required: true,
      min: 0,
      max: 2000,
      placeholder: "5"
    }
  ],
  schema,
  calculate: (input) => {
    return calculateFactorial(input.n);
  }
};

