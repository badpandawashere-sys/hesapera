import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateIdealKilo } from '../formulas/idealKilo';

const schema = z.object({
  cinsiyet: z.enum(['Erkek', 'Kadın']),
  boy: z.number().min(130).max(250)
});

type Input = z.infer<typeof schema>;

export const idealKiloCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ideal_kilo_001',
  slug: 'ideal-kilo',
  status: 'published',
  name: 'İdeal Kilo Hesaplama',
  shortDescription: 'Cinsiyetinize ve boyunuza göre tıbbi formüllerle (Devine Formülü) hesaplanmış yaklaşık ideal vücut ağırlığınızı öğrenin.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'İdeal Kilo Hesaplama (Devine Formülü) | Hesapera',
    description: 'Boyunuza ve cinsiyetinize göre tahmini ideal kilonuzu Devine formülü ile matematiksel olarak hesaplayın. (Yetişkinler içindir.)',
    keywords: ['ideal kilo hesaplama', 'boyuma göre kaç kilo olmalıyım', 'ideal vücut ağırlığı', 'devine formülü kilo'],
    canonical: 'https://hesapera.com.tr/hesaplama/ideal-kilo',
    faq: [
      {
        question: "İdeal kilom hesaplanan rakamdan yüksek, kilolu mu sayılıyorum?",
        answer: "Kesinlikle hayır. İdeal kilo hesaplaması BMI (VKİ) formülünden daha katıdır ve daha düşük çıkar. Sağlıklı bir ağırlıkta (VKİ normal aralığında) olup olmadığınızı VKİ hesaplayıcımız üzerinden veya en doğrusu doktorunuza danışarak öğrenebilirsiniz."
      },
      {
        question: "Bu hesaplamada yaşım neden sorulmuyor?",
        answer: "Çünkü tarihsel Devine formülü sadece yetişkinlerde boy ve cinsiyet baz alınarak (iskelet yapısına istinaden) oluşturulmuştur, yaş değişkeni klinik hesaplamada dikkate alınmaz."
      }
    ],
    content: {
      intro: "Tıbbi referans formüllerine göre ideal kilo (sağlıklı vücut ağırlığı) tahmin hesaplaması ve sınırları hakkında bilgiler",

      sections: [
        {
          title: "İdeal Kilo Ne Demektir?",
          paragraphs: [
            "'İdeal kilo' kavramı, geçmişte tıbbi tedaviler ve ilaç dozajlamaları sırasında kişinin boyuna göre referans alınabilecek en sağlıklı varsayımsal vücut ağırlığını belirlemek için oluşturulmuş bir istatistiksel tahmindir.",
            "Bu araç, tıbbi ve klinik literatürde (özellikle anestezi ve ilaç bilimi) en yaygın kabul gören Devine (1974) formülünü kullanarak hesaplama yapmaktadır."
          ]
        },
        {
          title: "Devine Formülü Nasıl Çalışır?",
          paragraphs: [
            "Devine formülü, kişilerin cinsiyetlerine ve boy uzunluklarına göre sabit katsayılar üzerinden çalışır. Kadınlar için baz 45.5 kg, erkekler için 50 kg'dan başlar ve 152.4 cm'in (5 feet) üzerindeki her inç (2.54 cm) için yaklaşık 2.3 kg ekleyerek tahmini bir rakama ulaşır."
          ]
        },
        {
          title: "Tıbbi Uyarı ve Sınırlandırmalar",
          paragraphs: [
            "Çıkan sonuç kesinlikle ulaşılması veya altına inilmesi gereken mutlak bir medikal hedef değildir. Sağlıklı vücut ağırlığı; kemik iriliği, genetik vücut tipi, yaş ve özellikle kas/yağ oranınıza göre kişiden kişiye ciddi değişiklik gösterir.",
            "Bu hesaplayıcıdaki formül 18 yaş altındaki çocuk ve ergenlerde doğru çalışmaz. Kilo vermek veya kilo almak istiyorsanız hekim ve diyetisyen kontrolünde bir vücut kompozisyonu (yağ-kas ölçümü) yaptırmanız gereklidir."
          ]
        },
      ],
      example: {
        title: "Klinik Örnek",
        text: "Boyu 1.70 m olan bir erkeğin hesaplamasında, 152.4 cm üzerindeki fazla boy uzunluğu inç cinsine çevrilir ve baz 50 kg'ın üzerine eklenir. Araç bu kişiye ~66 kg gibi bir rakam verebilir. Bu, kişinin sadece tıbbi bir dozajlama sırasında (örneğin aşırı yağ dokusuna yayılmaması gereken bir ilaç için) kullanılacak ideal yağsız kütlesine yakın referanstır. Estetik veya genel sağlık açısından kişi 75 kg'da da son derece fit ve sağlıklı olabilir."
      },
      sources: [
        {
          name: "Devine BJ. (1974) - Gentamicin therapy. DICP",
          url: "https://pubmed.ncbi.nlm.nih.gov/"
        },
        {
          name: "Dünya Sağlık Örgütü (WHO)",
          url: "https://www.who.int/"
        }
      ]
    },

    relatedCalculators: ['vucut-kitle-indeksi', 'bazal-metabolizma-hizi']
  },
  fields: [
    {
      id: 'cinsiyet',
      label: 'Cinsiyet',
      type: 'select',
      required: true,
      options: [
        { label: 'Erkek', value: 'Erkek' },
        { label: 'Kadın', value: 'Kadın' }
      ]
    },
    { id: 'boy', label: 'Boy (cm)', type: 'number', required: true, min: 130, max: 250 }
  ],
  schema,
  calculate: (input) => calculateIdealKilo(input)
};


