import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoanRestructuring } from '../formulas/loanRestructuring';

const schema = z.object({
  remainingPrincipal: z.number().positive('Yapılandırılacak borç 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  newMonthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  newTermMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const loanRestructuringCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loanRestructuring_001',
  slug: 'kredi-yapilandirma',
  status: 'published',
  name: 'Kredi Yapılandırma Hesaplama',
  shortDescription: 'Mevcut kredi bakiyenizi yeni faiz oranı ve vade ile yapılandırdığınızda aylık taksit, toplam ödeme ve toplam faiz tutarını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Yapılandırma Hesaplama',
    description: 'Mevcut kredi bakiyenizi yeni faiz oranı ve vade ile yapılandırdığınızda aylık taksit, toplam ödeme ve toplam faiz tutarını hesaplayın.',
    keywords: ["kredi yapılandırma", "borç transferi", "kredi yenileme", "yapılandırma faizi"],
    canonical: 'https://hesapera.com.tr/hesaplama/kredi-yapilandirma',
    icon: 'RefreshCw',
    faq: [
      {
        question: "Kredi yapılandırma başvurusu nasıl yapılır?",
        answer: "Krediyi kullandığınız bankanın şubelerine giderek, müşteri hizmetlerini arayarak veya mobil bankacılık üzerinden yapılandırma talebinde bulunabilirsiniz."
      },
      {
        question: "Banka yapılandırma talebini reddedebilir mi?",
        answer: "Evet. Yapılandırma ve refinansman işlemleri, mevzuatta bağlayıcı özel bir karar olmadığı sürece tamamen bankanın politikalarına ve onayına tabidir."
      },
      {
        question: "Konut kredisi yapılandırılabilir mi?",
        answer: "Konut finansmanında yeniden finansman veya yapılandırma mümkün olabilir. Sabit faizli konut finansmanında, sözleşmede yer alması koşuluyla erken ödeme tazminatı belirli sınırlar içinde uygulanabilir; kalan vade 36 ayı aşmayan kredilerde %1, aşan kredilerde %2 üst sınırı bulunmaktadır. Değişken faizli kredilerde erken ödeme tazminatı talep edilemez. Güncel sözleşme koşulları kontrol edilmelidir."
      },
      {
        question: "Vadeyi uzatarak yapılandırmak mantıklı mı?",
        answer: "Aylık taksit ödemekte zorlanıyorsanız taksitleri düşürerek bütçenizi rahatlatır; ancak borçlanma süreniz uzayacağı için bankaya ödeyeceğiniz toplam faiz miktarı artacaktır."
      },
      {
        question: "Yapılandırma hesaplamasında neden anapara kullanılır?",
        answer: "Çünkü önceki plandaki geleceğe dönük faizler henüz tahakkuk etmemiştir. Bankaya olan gerçek borcunuz kredinin o anki anapara (kapatma) bakiyesidir. Yeni faiz bu bakiye üzerinden hesaplanır."
      },
      {
        question: "Yapılandırma kredi notunu düşürür mü?",
        answer: "Yapılandırmanın kredi değerlendirmesine etkisi işlem türüne, ödeme geçmişine ve finans kuruluşunun değerlendirme kriterlerine göre değişebilir. Bu nedenle yapılandırmanın kredi notunu kesin olarak artıracağı veya düşüreceği söylenemez."
      }
    ],
    features: [
      { label: 'Yeni Taksit', icon: 'Calculator' },
      { label: 'Yeni Faiz Oranları', icon: 'Percent' },
      { label: 'Geri Ödeme Planı', icon: 'CalendarDays' },
      { label: 'Toplam Maliyet', icon: 'Banknote' }
    ],
    infoBox: {
      title: 'Kredi Yapılandırma Hesaplaması Nasıl Yapılır?',
      text: 'Mevcut bakiye, yeni faiz oranı ve yeni vade dikkate alınarak standart eşit taksitli annüite yöntemi ile yeni ödeme planınız simüle edilir.',
      icon: 'Info'
    },
    content: {
      intro: "Kredi yapılandırma, refinansman ve borç transferi süreçleri hakkında bilmeniz gerekenler",

      sections: [
        {
          title: "Kredi Yapılandırma (Refinansman) Nedir?",
          paragraphs: [
            "Kredi yapılandırma, daha önce kullanmış olduğunuz bir kredinin güncel faiz oranları, yeni bir vade veya farklı ödeme koşulları ile yeniden hesaplanarak yeni bir ödeme planına bağlanması işlemidir.",
            "Bu işlem genellikle iki temel sebeple yapılır: Birincisi, piyasa faiz oranları düştüğünde mevcut borcu daha düşük bir faizle ödeyip toplam maliyeti azaltmak (refinansman). İkincisi ise, mevcut ödeme yükünü azaltmak amacıyla yeni bir vade ve ödeme planı oluşturulmasıdır."
          ]
        },

        {
          title: "Kredi Yapılandırma Hesaplaması Nasıl Yapılır?",
          paragraphs: [
            "Yapılandırma hesaplamasında başlangıçtaki kredi tutarınız değil, kredinizin o anki 'kalan anapara (kapatma) bakiyesi' dikkate alınır. Geleceğe dönük henüz ödemediğiniz faizler silinerek yalnızca anapara borcunuz bulunur.",
            "Daha sonra bu kalan anapara borcu, bankanızın size sunduğu yeni aylık faiz oranı ve seçtiğiniz yeni vade (ay) süresi üzerinden standart eşit taksitli kredi (anüite) formülü ile sıfırdan hesaplanır."
          ],
          bullets: [
            "Mevcut Bakiye: Krediyi bugün kapatmak isteseniz ödeyeceğiniz kalan anapara borcunuz.",
            "Yeni Faiz Oranı: Yapılandırma işlemi için uygulanan güncel aylık faiz yüzdesi.",
            "Yeni Vade: Yeni ödeme planınızda borcun kaç ayda ödeneceğini gösteren süre.",
            "Yeni Taksit: Yeniden hesaplama sonrası aylık ödemeniz gereken yeni tutar."
          ]
        },

        {
          title: "Yapılandırma Ne Zaman Mantıklıdır?",
          paragraphs: [
            "Amacınız toplam maliyeti düşürmekse, yeni faiz oranındaki avantajı erken ödeme tazminatı uygulanıp uygulanmadığı, tahsis ücretleri, sigorta ve diğer maliyetlerle birlikte değerlendirmek gerekir. Özellikle konut finansmanında erken ödeme tazminatı, kredinin faiz türüne ve sözleşme şartlarına göre değişebilir.",
            "Eğer amacınız aylık ödeme yükünü azaltmaksa, faiz oranları aynı kalsa (hatta bir miktar artsa bile) vadeyi uzatarak taksitlerinizi düşürebilirsiniz. Ancak vade uzadıkça bankaya ödeyeceğiniz toplam faiz maliyetinin artacağını unutmamalısınız."
          ]
        },

        {
          title: "Kredi Yapılandırmanın Kredi Notuna (KKB) Etkisi",
          paragraphs: [
            "Kredi yapılandırma, ödeme güçlüğünden kaynaklanıyorsa ve bankanın takip/gecikme sürecindeki bir uygulaması ise, kredi notunuz (Findeks) bu işlemden olumsuz etkilenebilir.",
            "Ödeme performansı, mevcut borçluluk durumu ve finans kuruluşlarının kendi değerlendirme kriterleri kredi başvurularında dikkate alınabilir. Bu nedenle bir yapılandırmanın kredi değerlendirmesine etkisi hakkında kesin bir sonuç vermek yerine, işlem öncesinde bankanın uygulamasını ve güncel kredi kayıt bilgilerinizi kontrol etmek daha doğru olur."
          ]
        },

        {
          title: "Borç Kapatma (Transfer) Kredisi ile Farkı Nedir?",
          paragraphs: [
            "Yapılandırma genellikle aynı banka üzerinden, bankanın iç süreçleriyle yapılır. Borç transferi ise borcunuzun bulunduğu bankadan farklı bir bankanın, borç miktarınız kadar size yeni bir kredi tahsis ederek eski borcunuzu kapatması işlemidir.",
            "Her iki yöntemde de temel amaç uygun faiz veya daha uzun vade ile rahatlamaktır. Borç transferi sürecinde diğer bankanın uygulayacağı kredi tahsis ücretlerini ve operasyonel prosedürleri dikkate almak gerekir."
          ]
        },

        {
          title: "Yapılandırmada Bankanın Onayı Zorunlu mudur?",
          paragraphs: [
            "Yapılandırma veya yeniden finansman işleminin koşulları kredi türüne, sözleşmeye ve finans kuruluşunun değerlendirmesine göre değişebilir. Konut finansmanında yeniden finansman, tüketici ile konut finansmanı kuruluşunun mutabakatıyla gerçekleştirilebilir. Bu nedenle hesaplama sonucu bir teklif veya kesin onay anlamına gelmez.",
            "Bu nedenle hesaplama aracındaki sonuçlar planlama ve karşılaştırma amacı taşır. Nihai faiz oranı, vade, ücretler, kabul koşulları ve yeni ödeme planı ilgili finans kuruluşunun güncel teklifine ve taraflar arasındaki sözleşmeye göre belirlenir."
          ]
        }
      ],

      example: {
        title: "Kredi Yapılandırma Örneği",
        text: "Kalan anapara borcu 100.000 TL olan bir krediniz olduğunu varsayalım. Önceki kredinizin vadesi kısa olduğu için aylık taksitleri ödemekte zorlanıyorsunuz. Kalan bu 100.000 TL'yi %3.5 faiz oranı ve yeni bir 36 ay vade ile yapılandırdığınızda, aylık taksitleriniz düşerek bütçenizi rahatlatabilir ancak bankaya ödeyeceğiniz toplam faiz (maliyet) uzayan süreden dolayı artış gösterecektir."
      },

      sources: [
        {
          name: "Bankacılık Düzenleme ve Denetleme Kurumu (BDDK)",
          url: "https://www.bddk.org.tr/"
        },
        {
          name: "T.C. Ticaret Bakanlığı – Tüketici Hakları",
          url: "https://tuketici.ticaret.gov.tr/"
        }
      ]
    },

    relatedCalculators: ["kredi", "ihtiyac-kredisi", "konut-kredisi"]
  },
  fields: [
    {
      id: "remainingPrincipal",
      label: "Yapılandırılacak Borç / Mevcut Bakiye",
      type: "currency",
      required: true,
      min: 0
    },
    {
      id: "newMonthlyInterestRate",
      label: "Yeni Aylık Faiz Oranı (%)",
      type: "percentage",
      required: true,
      min: 0,
      step: 0.01
    },
    {
      id: "newTermMonths",
      label: "Yeni Vade (Ay)",
      type: "number",
      required: true,
      min: 1,
      max: 360
    }
  ],
  schema,
  calculate: (input) => {
    return calculateLoanRestructuring(input.remainingPrincipal, input.newMonthlyInterestRate, input.newTermMonths);
  }
};

