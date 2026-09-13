import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMetrekare } from '../formulas/metrekare';

const schema = z.object({
  uzunluk: z.number()
    .positive('Uzunluk 0\'dan büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)'),
  genislik: z.number()
    .positive('Genişlik 0\'dan büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)'),
  birim: z.enum(['m', 'cm']).default('m')
});

type Input = z.infer<typeof schema>;

export const metrekareCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_metrekare_028',
  slug: 'metrekare',
  status: 'published',
  name: 'Metrekare Hesaplama',
  shortDescription: 'Bir zemin, duvar veya odanın alanını metrekare (m²) cinsinden pratik olarak hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Metrekare Hesaplama Aracı | Hesapera',
    description: 'Uzunluk ve genişlik değerlerini girerek kolayca metrekare (m²) hesaplayın. Santimetre ve metre giriş desteği ile alan hesaplayıcı.',
    keywords: ["metrekare hesaplama", "m2 hesaplama", "alan hesaplama", "oda metrekaresi", "duvar metrekaresi"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/metrekare',
    faq: [
      {
        question: "Arsa alanını (dönüm, dekar vb.) bu araçla bulabilir miyim?",
        answer: "Eğer arsanızın tam dikdörtgen şeklinde iki dik kenarı varsa metre cinsinden ölçüleri çarpıp m²'sini bulabilirsiniz. 1 Dönüm (Dekar) = 1.000 m²'dir."
      },
      {
        question: "Brüt metrekare ve Net metrekare arasındaki fark nedir?",
        answer: "Emlak sektöründe Net m², sadece duvarların içindeki süpürülebilir kullanım alanıdır. Brüt m² ise duvar kalınlıkları, merdiven boşluğu, asansör ve otopark payı gibi ortak alanların daireye düşen payının eklendiği toplam alanı temsil eder."
      },
      {
        question: "Duvardaki pencereleri nasıl hesaplayacağım?",
        answer: "Eğer bir duvarı boyayacak veya duvar kağıdı kaplayacaksanız, önce tüm duvarın (boy x en) metrekaresini bulmalı, ardından pencerenin metrekaresini bulup toplam alandan çıkarmalısınız."
      }
    ],
    content: {
      intro: "Dikdörtgen veya kare şeklindeki alanların (oda, arsa, duvar vb.) metrekare (m²) hesabı ve ölçü birimleri",

      sections: [
        {
          title: "Metrekare (m²) Nedir?",
          paragraphs: [
            "Metrekare (m²), kenarları 1 metre olan bir karenin kapladığı yüzey alanını ifade eden uluslararası ölçü birimidir. Evinizin odalarının büyüklüğü, halı ebatları, satılık arsalar veya bir duvarın boyanacak yüzeyi metrekare cinsinden ifade edilir."
          ]
        },
        {
          title: "Dikdörtgen veya Kare Alanı Nasıl Hesaplanır?",
          paragraphs: [
            "Hesaplayıcı aracımız dikdörtgen geometrisini (kare de özel bir dikdörtgendir) temel alır. Formül oldukça basittir: Alan = Uzunluk x Genişlik.",
            "Eğer girdiğiniz ölçüler metre (m) cinsinden ise çıkan sonuç doğrudan m²'dir. Eğer girdiğiniz ölçüler santimetre (cm) cinsinden ise, hesaplayıcı formül gereği bu değerleri önce 100'e bölerek metreye çevirir, sonra çarparak gerçek m² değerine ulaşır."
          ]
        },
        {
          title: "Ölçüm Yaparken Dikkat Edilmesi Gerekenler",
          paragraphs: [
            "Alan hesaplanırken birimlerin birbiriyle uyumlu (ikisinin de metre veya ikisinin de santimetre) olması gerekir. Gerçek hayatta örneğin 'L' şeklindeki bir salonun metrekaresini bulmak istiyorsanız, salonu iki farklı dikdörtgen gibi hayal edip ikisinin metrekarelerini ayrı ayrı bularak sonrasında toplamalısınız."
          ]
        },
      ],
      example: {
        title: "Oda Metrekaresi Hesaplama (Emlak Örneği)",
        text: "Evinizdeki salonun boyu 5 metre, eni ise 4 metre olsun. Bu iki ölçüyü araca girdiğinizde, 5 x 4 işlemiyle salonunuzun '20 m²' olduğunu bulursunuz. Zeminine halı alırken, parke döşetirken veya evi kiralarken (net kullanım alanı) bu referans ölçü kullanılır."
      }
    },

    relatedCalculators: ["alan"]
  },
  fields: [
    {
      id: "uzunluk",
      label: "Uzunluk",
      type: "number",
      required: true,
      min: 0.01,
      step: 0.01,
      placeholder: "5"
    },
    {
      id: "genislik",
      label: "Genişlik",
      type: "number",
      required: true,
      min: 0.01,
      step: 0.01,
      placeholder: "4"
    },
    {
      id: "birim",
      label: "Girdi Birimi",
      type: "select",
      required: true,
      options: [
        { label: "Metre (m)", value: "m" },
        { label: "Santimetre (cm)", value: "cm" }
      ],
      defaultValue: "m"
    }
  ],
  schema,
  calculate: (input) => {
    return calculateMetrekare(input.uzunluk, input.genislik, input.birim);
  }
};

