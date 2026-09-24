import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateIndirim } from '../formulas/indirimHesaplama';

const schema = z.object({
  mod: z.enum(['yuzde', 'oran-bul', 'coklu']),
  normalFiyat: z.number().min(0, 'Fiyat 0 veya daha büyük olmalıdır'),
  indirimOrani: z.number().min(0).max(100).optional(),
  indirimliFiyat: z.number().min(0).optional(),
  ikinciIndirimOrani: z.number().min(0).max(100).optional()
});

type Input = z.infer<typeof schema>;

export const discountCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_discount_001',
  slug: 'indirim-hesaplama',
  status: 'published',
  name: 'İndirim Hesaplama',
  shortDescription: 'Bir ürünün indirimli fiyatını, indirim tutarını veya ardışık çoklu indirimleri hızlıca hesaplayın.',
  category: 'other',
  type: 'simple',
  metadata: {
    title: 'İndirim Hesaplama – Yüzde İndirim ve İndirimli Fiyat Hesapla',
    description: 'Normal fiyat ve indirim oranını girerek indirim tutarını, indirimli fiyatı ve çoklu indirimlerde gerçek indirim oranını hesaplayın.',
    keywords: ["indirim hesaplama","yüzde indirim","indirimli fiyat hesaplama","indirim oranı bulma","çoklu indirim"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/indirim-hesaplama',
    infoBox: {
      title: 'İndirim Hakkında',
      text: 'Yüzde indirim hesaplayabilir, indirimli fiyattan asıl indirim oranını bulabilir veya birden fazla ardışık kampanyayı (çoklu indirim) birleştirerek gerçekte ne kadar tasarruf edeceğinizi öğrenebilirsiniz.',
      icon: 'Tag'
    },
    features: [
      { label: 'Yüzde İndirim', icon: 'Percent' },
      { label: 'İndirim Oranı Bulma', icon: 'Search' },
      { label: 'Çoklu İndirim (Örn: %20 + %10)', icon: 'Layers' }
    ],
    faq: [
      {
        question: '%20 indirim nasıl hesaplanır?',
        answer: '%20 indirim hesaplamak için ürünün normal fiyatını 0.20 ile çarparak indirim tutarını bulabilirsiniz. İndirimli fiyatı bulmak için ise normal fiyatı 0.80 ile çarpmanız yeterlidir.'
      },
      {
        question: '1000 TL\'ye %25 indirim uygulanırsa kaç TL olur?',
        answer: '1000 TL\'nin %25\'i 250 TL\'dir. 1000 - 250 = 750 TL olarak hesaplanır. Alternatif olarak doğrudan 1000 x 0.75 = 750 TL işlemi ile de bulunabilir.'
      },
      {
        question: 'İndirimli fiyattan indirim oranı nasıl bulunur?',
        answer: 'Normal fiyat ile indirimli fiyat arasındaki fark (indirim tutarı) bulunur. Daha sonra bu tutar, normal fiyata bölünür ve 100 ile çarpılarak yüzde oranı elde edilir. Örneğin 100 TL\'den 80 TL\'ye inen üründe (20 / 100) x 100 = %20 indirim yapılmış demektir.'
      },
      {
        question: 'İki indirim oranı toplanır mı?',
        answer: 'Hayır, peş peşe yapılan indirimlerde oranlar doğrudan toplanmaz. İkinci indirim, ilk indirimden sonra kalan yeni fiyat üzerinden uygulanır. Bu sebeple %20 + %10 indirim, aslında tek seferde %28 indirime eşdeğerdir.'
      },
      {
        question: '%50 + %50 indirim ürünün bedava olması anlamına gelir mi?',
        answer: 'Kesinlikle gelmez. Önce fiyat yarıya iner, sonra kalan o yarım fiyat üzerinden tekrar %50 indirim uygulanır. Sonuçta ürün bedava değil, ilk fiyatının %25\'ine (yani toplamda %75 indirimle) satılıyor olur.'
      },
      {
        question: 'Çoklu indirim nasıl hesaplanır?',
        answer: 'Önce normal fiyat üzerinden 1. indirim oranı düşülür ve bir ara tutar bulunur. Ardından bu ara tutar üzerinden 2. indirim oranı uygulanır. Böylece toplam efektif indirim elde edilmiş olur.'
      },
      {
        question: 'İndirim tutarı ile indirimli fiyat arasındaki fark nedir?',
        answer: 'İndirim tutarı, normal fiyattan ne kadar eksiltme yapıldığını gösteren paradır (tasarrufunuz). İndirimli fiyat ise kasada ödeyeceğiniz nihai rakamdır.'
      },
      {
        question: 'Ondalıklı indirim oranı kullanılabilir mi?',
        answer: 'Evet, aracımızda %12.5, %5.25 gibi ondalıklı (küsüratlı) indirim oranlarını da rahatlıkla hesaplayabilirsiniz.'
      }
    ],
    relatedCalculators: ["yuzde", "oran", "kdv-hesaplama"],
    content: {
      intro: "İndirim Hesaplama Aracı ile mağaza veya internet alışverişlerinizde size sunulan kampanyaların gerçek faydasını saniyeler içinde görebilirsiniz.",
      sections: [
        {
          title: "1. İndirim nasıl hesaplanır?",
          paragraphs: ["İndirim, bir mal veya hizmetin normal satış fiyatından belirli bir yüzde veya tutarda kesinti yapılmasıdır. Matematiksel olarak fiyattan indirilecek tutarın çıkarılması prensibine dayanır ve [Yüzde Hesaplama](/hesaplama/yuzde) yöntemleri kullanılarak elde edilir."]
        },
        {
          title: "2. İndirimli fiyat nasıl bulunur?",
          paragraphs: ["İndirimli fiyatı bulmak için, normal fiyattan hesapladığınız indirim tutarını çıkarırsınız. Örneğin 500 TL\'lik bir ürünün fiyatında 100 TL indirim varsa, indirimli son fiyatınız 400 TL olacaktır."]
        },
        {
          title: "3. İndirim oranı nasıl bulunur?",
          paragraphs: ["Etiketteki ilk fiyatı ve ödemeniz gereken son fiyatı biliyorsanız, önce aradaki farkı bulun. Bu farkı ilk fiyata bölüp 100 ile çarptığınızda gerçek [Oran Hesaplama](/hesaplama/oran) sonucunuzu, yani % kaç indirim yapıldığını bulmuş olursunuz."]
        },
        {
          title: "4. Yüzde indirim hesaplama formülü",
          paragraphs: ["Formül: Normal Fiyat - (Normal Fiyat x İndirim Oranı / 100) = İndirimli Fiyat. Bu basit matematik kuralı sayesinde her türlü yüzde hesabı kolayca yapılabilir."]
        },
        {
          title: "5. İndirim tutarı nedir?",
          paragraphs: ["İndirim tutarı, indirim oranı uygulandıktan sonra elde ettiğiniz net finansal kazançtır. Cebinizde kalan, yani tasarruf ettiğiniz parayı temsil eder."]
        },
        {
          title: "6. Çoklu indirim nasıl hesaplanır?",
          paragraphs: ["Mağazalarda sıkça karşılaşılan 'Sepette ek %10' gibi durumlardır. Çoklu indirimde oranlar asla toplanmaz. Önce birinci indirim düşülür, çıkan yeni ve düşük fiyat üzerinden ikinci indirim oranı uygulanır."]
        },
        {
          title: "7. %20 + %10 neden %30 değildir?",
          paragraphs: ["1000 TL üzerinden düşünürsek; %30 indirim doğrudan 300 TL düşmek ve 700 TL ödemek demektir. Ancak %20 + %10 indirimde önce 1000 TL\'den 200 TL düşülür (800 TL kalır). Sonra 800 TL üzerinden %10 yani 80 TL düşülür. Sonuç 720 TL olur. Yani kazancınız 300 TL değil, 280 TL\'dir."]
        },
        {
          title: "8. Etiket fiyatından indirim hesaplama",
          paragraphs: ["Bazı mağazalar KDV dahil veya hariç etiket kullanabilir. İndirim genellikle tüm vergiler dahil son fiyat üzerinden uygulanır. Eğer vergi dahil bir fiyattan vergisiz kısmını ayırmanız gerekirse [KDV Hesaplama](/hesaplama/kdv-hesaplama) işlemi yapabilirsiniz."]
        },
        {
          title: "9. Kampanyalarda efektif indirim oranı",
          paragraphs: ["Efektif indirim oranı, kafa karıştırıcı olabilecek çoklu veya kademeli kampanyaların aslında tek bir yüzdelik dilimle ifade edilmiş en net halidir. %20 + %10 kampanyasının efektif oranı %28\'dir."]
        },
        {
          title: "10. İndirim ve zam arasındaki fark",
          paragraphs: ["İndirim fiyatı aşağı çekerken, zam yukarı iter. Ancak matematiksel geri dönüşleri asimetriktir. %50 indirim yapılan bir ürün yarı fiyatına iner; ancak eski fiyatına dönmesi için kalan o fiyat üzerinden %100 zam yapılması gerekir."]
        }
      ]
    }
  },
  fields: [],
  schema,
  calculate: (input) => {
    return calculateIndirim(input);
  }
};
