import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateZamHesaplama } from '../formulas/zamHesaplama';

const schema = z.object({
  mod: z.enum(['zam-ekle', 'oran-bul', 'eski-fiyat-bul']),
  eskiFiyat: z.number().min(0).optional(),
  zamOrani: z.number().min(0).optional(),
  yeniFiyat: z.number().min(0).optional()
});

type Input = z.infer<typeof schema>;

export const increaseCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_increase_001',
  slug: 'zam-hesaplama',
  status: 'published',
  name: 'Zam Hesaplama',
  shortDescription: 'Eski fiyat, yeni fiyat veya zam oranını kullanarak zam tutarını, zam oranını ve zamlı fiyatı hızlıca hesaplayın.',
  category: 'finance',
  type: 'simple',
  metadata: {
    title: 'Zam Hesaplama – Yüzde Zam ve Zamlı Fiyat Hesapla',
    description: 'Eski fiyat, yeni fiyat veya zam oranını kullanarak zam tutarını, zam oranını ve zamlı fiyatı hızlıca hesaplayın.',
    keywords: ["zam hesaplama","yüzde zam","zamlı fiyat hesaplama","zam oranı bulma","maaş zammı hesaplama"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/zam-hesaplama',
    infoBox: {
      title: 'Zam Hesaplama Hakkında',
      text: 'Ürünlere veya maaşlara yapılan zamları hesaplayabilir, eski fiyat ve yeni fiyattan zam oranını bulabilir ya da zamlı bir ürünün zamsız (eski) fiyatını geriye dönük hesaplayabilirsiniz.',
      icon: 'TrendingUp'
    },
    features: [
      { label: 'Zamlı Fiyat (Zam Ekle)', icon: 'Plus' },
      { label: 'Zam Oranı Bulma', icon: 'Percent' },
      { label: 'Zam Öncesi Fiyatı Bulma', icon: 'RotateCcw' }
    ],
    faq: [
      {
        question: '%20 zam nasıl hesaplanır?',
        answer: '%20 zam hesaplamak için mevcut fiyatı 0.20 ile çarparak zam miktarını bulabilirsiniz. Zamlı yeni fiyatı bulmak için ise normal fiyatı 1.20 ile çarpmanız yeterlidir.'
      },
      {
        question: '1000 TL\'ye %25 zam gelirse kaç TL olur?',
        answer: '1000 TL\'nin %25\'i 250 TL\'dir. Zamlı tutar 1000 + 250 = 1250 TL olur. Alternatif olarak, 1000 TL x 1.25 = 1250 TL hesaplaması da aynı sonucu verir.'
      },
      {
        question: 'Eski ve yeni fiyattan zam oranı nasıl bulunur?',
        answer: 'Yeni fiyattan eski fiyatı çıkararak artış tutarını bulun. Bu tutarı eski fiyata bölün ve 100 ile çarpın. Örneğin 100 TL\'den 150 TL\'ye çıkan üründe 50 TL artış vardır. 50 / 100 x 100 = %50 zam yapılmıştır.'
      },
      {
        question: 'Zamlı fiyattan eski fiyat nasıl bulunur?',
        answer: 'Eğer bir ürünün zamlı fiyatını ve zam oranını biliyorsanız, zamlı fiyatı (1 + zam oranı / 100) formülüne bölerek eski fiyatını bulabilirsiniz. Örneğin %20 zamlı fiyatı 120 TL olan ürünün eski fiyatı 120 / 1.20 = 100 TL\'dir.'
      },
      {
        question: 'Maaş zammı nasıl hesaplanır?',
        answer: 'Maaş hesaplamasında da aynı yüzde mantığı geçerlidir. Eski maaşınız ile belirlenen zam yüzdesini (örneğin %40) çarparak maaşınıza eklenecek net tutarı bulabilir, eski maaşınıza ekleyerek yeni maaşınızı elde edebilirsiniz.'
      },
      {
        question: 'Zam ve indirim birbirini neden sıfırlamaz?',
        answer: 'Matematiksel olarak yüzdeler uygulandığı asıl fiyata göre değer kazanır. 100 TL\'ye %20 zam yaparsanız 120 TL olur. 120 TL\'ye %20 indirim yaparsanız 24 TL düşer ve 96 TL olur (100 TL olmaz). İkisinin matrahı (baz alındığı temel tutar) farklıdır.'
      },
      {
        question: 'Ondalıklı zam oranı kullanılabilir mi?',
        answer: 'Evet, aracımızda %17.5, %5.25 gibi ondalıklı zam oranlarını hesaplayabilir, kuruş hassasiyetinde tutarlı sonuçlar elde edebilirsiniz.'
      },
      {
        question: '%0 zam ne anlama gelir?',
        answer: '%0 zam, fiyatta veya maaşta herhangi bir artış yapılmadığı anlamına gelir. Eski fiyat ile yeni fiyat birbirine eşittir.'
      }
    ],
    relatedCalculators: ["yuzde", "oran", "indirim-hesaplama", "kdv-hesaplama"],
    content: {
      intro: "Zam Hesaplama Aracı ile enflasyonist ortamlarda fiyat değişimlerini, maaş artışlarını ve yüzdelik zam tutarlarını saniyeler içinde ve sıfır hata payıyla hesaplayabilirsiniz.",
      sections: [
        {
          title: "1. Zam nasıl hesaplanır?",
          paragraphs: ["Zam, bir fiyatın mevcut (eski) tutarı üzerine belirli bir yüzde veya meblağ eklenmesiyle elde edilir. Fiyat artışlarını hesaplarken temel [Yüzde Hesaplama](/hesaplama/yuzde) matematik kuralları işletilir."]
        },
        {
          title: "2. Zamlı fiyat nasıl bulunur?",
          paragraphs: ["Eski fiyatın üzerine zam tutarını ekleyerek zamlı fiyatı bulabilirsiniz. Örneğin 100 TL'lik bir ürüne 30 TL zam geldiğinde, yeni zamlı fiyatınız 130 TL olacaktır."]
        },
        {
          title: "3. Zam oranı nasıl bulunur?",
          paragraphs: ["Eski ve yeni fiyatlar arasındaki farkın eski fiyata olan oransal ilişkisidir. Aradaki farkı bulduktan sonra eski fiyata bölerek yüzde kaç artış gerçekleştiğini görebilirsiniz. Bu yöntem klasik bir [Oran Hesaplama](/hesaplama/oran) mantığıdır."]
        },
        {
          title: "4. Zam öncesi fiyat nasıl bulunur?",
          paragraphs: ["Elinizde sadece zamlı son fiyat ve zam oranı varsa, ters işlem (bölme) yapmanız gerekir. Son fiyatı (1 + Zam Oranı) formülüne bölerek o ürünün zamsız ilk fiyatına ulaşabilirsiniz."]
        },
        {
          title: "5. Yüzde zam hesaplama formülü",
          paragraphs: ["En sık kullanılan formül: Yeni Fiyat = Eski Fiyat + (Eski Fiyat x Zam Oranı / 100) şeklindedir. Kısaca, Eski Fiyat x (1 + Oran) çarpanı kullanılarak zam eklenmiş haline daha pratik biçimde ulaşılabilir."]
        },
        {
          title: "6. Zam tutarı nedir?",
          paragraphs: ["Zam tutarı, fiyattaki artışın net rakamsal karşılığıdır. Cebinizden ekstradan çıkacak parayı temsil eder."]
        },
        {
          title: "7. Eski ve yeni fiyat arasındaki yüzde fark",
          paragraphs: ["Bu yüzde fark, aslında doğrudan zam oranının kendisidir. Artışın, orijinal fiyata (eski fiyata) nispeten ne kadarlık bir büyüme gösterdiğini ifade eder."]
        },
        {
          title: "8. Maaş zammı hesaplama mantığı",
          paragraphs: ["Maaş zamları genellikle enflasyon oranlarına veya sendika sözleşmelerine göre yüzde üzerinden belirlenir. Yüzde hesaplama prensibi tamamen aynıdır. Ancak maaş hesabında net/brüt ayrımları ve vergi dilimleri ek etkenler olabilir."]
        },
        {
          title: "9. Fiyat artışı hesaplama",
          paragraphs: ["Sadece perakende alışverişlerde değil, toptan alımlarda veya kiralarda karşılaşılan artışlardır. [KDV Hesaplama](/hesaplama/kdv-hesaplama) gerektiren durumlarda, zammın vergi dahil mi hariç mi fiyata eklendiğine dikkat edilmelidir."]
        },
        {
          title: "10. Zam ve indirim neden birbirinin tam tersi değildir?",
          paragraphs: ["En çok karıştırılan konudur. 100 TL\'ye %20 zam gelirse 120 TL olur. Ancak 120 TL\'ye [İndirim Hesaplama](/hesaplama/indirim-hesaplama) yapıp %20 çıkarırsanız 96 TL elde edersiniz. Yüzdelerin çarpıldığı ana paralar farklı olduğu için matematiksel simetri yoktur."]
        }
      ]
    }
  },
  fields: [],
  schema,
  calculate: (input) => {
    return calculateZamHesaplama(input);
  }
};
