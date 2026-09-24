import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKarMarji } from '../formulas/karMarji';

const schema = z.object({
  mod: z.enum(['kar-zarar', 'hedef-marj', 'kar-orani']),
  maliyet: z.number().min(0, 'Maliyet negatif olamaz'),
  satisFiyati: z.number().min(0, 'Satış fiyatı negatif olamaz').optional(),
  hedefMarj: z.number().min(0).max(99.999).optional(),
  karOrani: z.number().min(0).optional()
});

type Input = z.infer<typeof schema>;

export const karMarjiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_kar_marji_001',
  slug: 'kar-marji-hesaplama',
  status: 'published',
  name: 'Kâr Marjı Hesaplama',
  shortDescription: 'Maliyet ve satış fiyatını girerek kâr tutarını, kâr oranını ve kâr marjını hesaplayın; hedef marja göre satış fiyatını bulun.',
  category: 'finance',
  type: 'simple',
  metadata: {
    title: 'Kâr Marjı Hesaplama – Kâr, Zarar ve Satış Fiyatı Hesapla',
    description: 'Maliyet ve satış fiyatını girerek kâr tutarını, kâr oranını ve kâr marjını hesaplayın; hedef marja göre satış fiyatını bulun.',
    keywords: ["kâr marjı hesaplama", "kâr oranı hesaplama", "kâr zarar hesaplama", "satış fiyatı hesaplama", "hedef kâr marjı"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/kar-marji-hesaplama',
    infoBox: {
      title: 'Kâr Marjı ve Kâr Oranı Hakkında',
      text: 'Kâr oranı maliyet üzerinden hesaplanırken, kâr marjı satış fiyatı üzerinden hesaplanır. Bu aracımızla iki kavramı birbirine karıştırmadan en doğru ticari hesaplamalarınızı yapabilirsiniz.',
      icon: 'PieChart'
    },
    features: [
      { label: 'Kâr / Zarar Durumu', icon: 'TrendingUp' },
      { label: 'Hedef Marjdan Fiyat Bulma', icon: 'Target' },
      { label: 'Maliyete Kâr Ekleme', icon: 'PlusCircle' }
    ],
    faq: [
      {
        question: 'Kâr marjı nasıl hesaplanır?',
        answer: 'Kâr marjı, elde edilen net kârın satış fiyatına bölünmesiyle hesaplanır. Formül: (Kâr / Satış Fiyatı) x 100 şeklindedir.'
      },
      {
        question: 'Kâr oranı nasıl hesaplanır?',
        answer: 'Kâr oranı, elde edilen net kârın maliyete bölünmesiyle bulunur. Formül: (Kâr / Maliyet) x 100 şeklindedir.'
      },
      {
        question: 'Kâr marjı ile kâr oranı aynı mı?',
        answer: 'Hayır, aynı değildir. Kâr oranı hesaplanırken maliyet (alış fiyatı) baz alınırken, kâr marjı hesaplanırken satış fiyatı baz alınır.'
      },
      {
        question: '100 TL maliyetli ürün 125 TL\'ye satılırsa kâr marjı kaçtır?',
        answer: 'Kâr tutarı 25 TL\'dir. Kâr oranı (25/100) %25 iken, kâr marjı (25/125) %20\'dir.'
      },
      {
        question: '%20 kâr marjı için satış fiyatı nasıl bulunur?',
        answer: 'Maliyet fiyatını (1 - 0.20) yani 0.80\'e bölmeniz gerekir. 100 TL\'lik bir ürün %20 kâr marjıyla satılmak isteniyorsa, 100 / 0.80 = 125 TL\'ye satılmalıdır.'
      },
      {
        question: '%20 kâr eklemek ile %20 kâr marjı aynı mı?',
        answer: 'Aynı değildir. Maliyete %20 kâr eklerseniz (100 TL -> 120 TL), bu satıştan elde ettiğiniz kâr marjı %20 değil, %16.67 olur.'
      },
      {
        question: 'Zarar oranı nasıl hesaplanır?',
        answer: 'Satış fiyatı maliyetin altında kaldığında zarar oluşur. Zarar edilen tutar, maliyete bölünerek yüzdelik zarar oranı hesaplanır.'
      },
      {
        question: 'Kâr marjı %100 olabilir mi?',
        answer: 'Matematiksel olarak bir ürün bedavaya mâl edilip (0 TL maliyet) satılmadığı sürece kâr marjı tam %100 olamaz. Ancak kâr oranı %100, %500 veya daha fazla olabilir.'
      }
    ],
    relatedCalculators: ["yuzde", "oran", "kdv-hesaplama", "indirim-hesaplama"],
    content: {
      intro: "Ticari faaliyetlerde kârlılığı ölçmenin en temel iki göstergesi Kâr Marjı ve Kâr Oranıdır. Kâr Marjı Hesaplama Aracı ile alış ve satış fiyatlarınız üzerinden kâr - zarar durumunuzu en doğru şekilde analiz edebilirsiniz.",
      sections: [
        {
          title: "1. Kâr nasıl hesaplanır?",
          paragraphs: ["Kâr hesaplama, bir ürünün satış fiyatından toplam maliyetin çıkarılmasıyla yapılır. Satış fiyatı maliyetten büyükse pozitif bir değer çıkar ve bu değer kârınızı temsil eder."]
        },
        {
          title: "2. Zarar nasıl hesaplanır?",
          paragraphs: ["Bir ürünün satış fiyatı maliyetinin altında kalırsa, işletme o satıştan zarar etmiş demektir. Aradaki negatif fark sizin zarar tutarınızdır."]
        },
        {
          title: "3. Kâr marjı nedir?",
          paragraphs: ["Kâr marjı (Profit Margin), kazancınızın cironuz (satış fiyatı) içindeki payını gösterir. Özellikle şirket bilançolarında ve genel kârlılık analizlerinde en çok kullanılan [Yüzde Hesaplama](/hesaplama/yuzde) metriğidir."]
        },
        {
          title: "4. Kâr oranı nedir?",
          paragraphs: ["Kâr oranı (Markup), cebinizden çıkan paraya (maliyete) kıyasla ne kadar getiri elde ettiğinizi gösterir. Muhasebeden ziyade perakende satışta fiyat belirlerken sıkça başvurulan bir orandır."]
        },
        {
          title: "5. Kâr marjı ve kâr oranı arasındaki fark",
          paragraphs: ["İkisi arasındaki temel fark paydaya konulan değerdir. Kâr oranı maliyeti baz alırken, kâr marjı satış fiyatını baz alır. Bu nedenle aynı kâr tutarı için hesaplanan kâr marjı, her zaman kâr oranından daha düşük çıkar."]
        },
        {
          title: "6. Satış fiyatından kâr marjı hesaplama",
          paragraphs: ["Elinizde alış ve satış fiyatları varsa, [Oran Hesaplama](/hesaplama/oran) mantığıyla brüt kârı bulup, ardından bunu direkt satış fiyatına bölerek gerçek kâr marjınızı bulabilirsiniz."]
        },
        {
          title: "7. Hedef kâr marjına göre satış fiyatı bulma",
          paragraphs: ["İstediğiniz belirli bir net kâr marjına (örneğin %30) ulaşmak için, maliyetinizi (1 - 0.30) değerine bölmelisiniz. Maliyeti direkt 1.30 ile çarpmak sizi hedeflediğiniz marja ulaştırmaz."]
        },
        {
          title: "8. Maliyet üzerine yüzde kâr ekleme",
          paragraphs: ["Halk arasında sıklıkla kullanılan yöntemdir. Alınan ürünün maliyeti üzerine istenen kâr yüzdesi direkt olarak çarpılıp eklenir. Örneğin 200 TL maliyetli ürüne %50 kâr eklendiğinde satış fiyatı 300 TL olur. Ancak buradaki Kâr Marjı %50 değil, %33.33'tür."]
        },
        {
          title: "9. Başabaş noktası nedir?",
          paragraphs: ["Satış fiyatının tam olarak maliyet fiyatına eşit olduğu durumdur. Bu senaryoda kâr veya zarar sıfırdır (0). İşletme sadece yatırdığı parayı geri almış olur."]
        },
        {
          title: "10. KDV, indirim ve kâr hesabında dikkat edilmesi gerekenler",
          paragraphs: ["Gerçek bir kâr hesabı yaparken [KDV Hesaplama](/hesaplama/kdv-hesaplama) kurallarını unutmamalısınız. Vergiler maliyet veya satış fiyatına doğru yansıtılmalıdır. Ayrıca satış esnasında müşteriye uygulanan [İndirim Hesaplama](/hesaplama/indirim-hesaplama) adımları da kâr marjınızı doğrudan düşüren etkenlerdir."]
        }
      ]
    }
  },
  fields: [],
  schema,
  calculate: (input) => {
    return calculateKarMarji(input);
  }
};
