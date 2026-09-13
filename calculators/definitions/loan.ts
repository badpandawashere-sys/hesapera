import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoan } from '../formulas/loan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const loanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loan_001',
  slug: 'kredi',
  status: 'published',
  name: 'Kredi Hesaplama',
  shortDescription: 'Bireysel veya ticari kredilerinizin taksitlerini, faiz oranlarını ve geri ödeme planını anında hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Hesaplama Aracı | Hesapera',
    description: 'Bireysel veya ticari kredilerinizin taksitlerini, faiz oranlarını ve geri ödeme planını anında hesaplayın.',
    keywords: ["kredi hesaplama","kredi taksiti","amortisman planı","kredi faizi"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/kredi',
    icon: 'WalletCards',
    faq: [
      {
        question: "Kredi taksiti nasıl hesaplanır?",
        answer: "Kredi taksiti temel olarak kredi tutarı, aylık faiz oranı ve vade bilgileri kullanılarak hesaplanır. Eşit taksitli tüketici kredilerinde anüite yöntemi kullanılır."
      },
      {
        question: "Kredi faiz hesaplama nasıl yapılır?",
        answer: "Kredi faiz hesaplamasında kredi anaparası ve ilgili faiz oranı dikkate alınır. Eşit taksitli ödeme planında taksitlerin içindeki faiz ve anapara payları vade boyunca değişir."
      },
      {
        question: "Vade uzadıkça kredi maliyeti artar mı?",
        answer: "Vadenin uzaması aylık taksiti düşürebilir; ancak kredi daha uzun süre devam ettiği için toplam geri ödeme tutarı artabilir. Bu nedenle vade karşılaştırırken aylık ödeme ile toplam maliyet birlikte değerlendirilmelidir."
      },
      {
        question: "Kredi hesaplama sonucu kesin midir?",
        answer: "Hayır. Hesaplama aracı karşılaştırma ve bilgilendirme amacıyla yaklaşık sonuç verir. Kesin faiz oranı, ücretler ve ödeme planı kredi veren kuruluşun güncel teklifine ve sözleşme şartlarına göre belirlenir."
      },
      {
        question: "Kredi erken kapatılırsa faiz düşer mi?",
        answer: "Tüketici kredilerinde erken ödeme halinde, erken ödenen miktara göre gerekli faiz ve diğer maliyet indirimlerinin yapılması öngörülmektedir. Uygulanacak koşullar kredi sözleşmesine ve ilgili mevzuata göre değerlendirilmelidir."
      },
      {
        question: "Düşük aylık taksit daha ucuz kredi anlamına gelir mi?",
        answer: "Her zaman değil. Daha uzun vadeli bir kredi daha düşük aylık taksit sağlayabilir ancak toplam geri ödeme tutarı daha yüksek olabilir. Bu nedenle kredi karşılaştırırken toplam maliyeti de incelemek gerekir."
      }
    ],
    features: [
      { label: 'Taksit Hesaplama', icon: 'Calculator' },
      { label: 'Faiz Oranları', icon: 'Percent' },
      { label: 'Geri Ödeme Planı', icon: 'CalendarDays' },
      { label: 'Toplam Maliyet', icon: 'Banknote' }
    ],
    infoBox: {
      title: 'Daha Planlı Bir Finansal Gelecek',
      text: 'Doğru hesapla, doğru karar.',
      icon: 'ShieldCheck'
    },
    content: {
      intro: "Kredi hesaplama ve geri ödeme planı hakkında bilmeniz gerekenler",

      sections: [
        {
          title: "Kredi Hesaplama Nedir?",
          paragraphs: [
            "Kredi hesaplama, belirli bir kredi tutarının faiz ve vade koşullarına göre aylık taksitini ve toplam geri ödeme tutarını yaklaşık olarak görmenizi sağlayan bir hesaplamadır.",
            "Kredi başvurusu yapmadan önce farklı tutar, faiz oranı ve vade seçeneklerini karşılaştırmak; yalnızca aylık ödemeyi değil, borçlanmanın toplam maliyetini anlamaya yardımcı olur."
          ]
        },

        {
          title: "Kredi Taksiti Nasıl Hesaplanır?",
          paragraphs: [
            "Eşit taksitli tüketici kredilerinde aylık taksit hesabında kredi anaparası, aylık faiz oranı ve toplam taksit sayısı birlikte değerlendirilir.",
            "T.C. Ticaret Bakanlığı'nın tüketici kredilerine ilişkin bilgilendirmesinde, eşit taksitli kredilerde taksit tutarının anüitenin bugünkü değeri formülü kullanılarak hesaplandığı belirtilmektedir.",
            "Ödeme planının ilerleyen dönemlerinde kalan anapara azaldığı için taksit içindeki faiz payı azalırken anaparaya giden pay artar."
          ],
          bullets: [
            "Kredi tutarı: Kullanılmak istenen toplam kredi miktarı.",
            "Aylık faiz oranı: Krediye uygulanan aylık faiz oranı.",
            "Vade: Kredinin kaç ayda geri ödeneceği.",
            "Aylık taksit: Her ödeme döneminde yapılması planlanan ödeme."
          ]
        },

        {
          title: "Kredi Hesaplama Nasıl Kullanılır?",
          paragraphs: [
            "Öncelikle kullanmak istediğiniz kredi tutarını belirleyin. Ardından kredi için geçerli aylık faiz oranını ve geri ödeme süresini girin.",
            "Hesaplama sonucunda aylık taksit ile toplam geri ödeme tutarını birlikte inceleyin. Aynı kredi tutarını farklı vadelerde tekrar hesaplamak, vadenin aylık ödeme ve toplam maliyet üzerindeki etkisini görmenizi sağlar."
          ]
        },

        {
          title: "Kredi Faiz Oranı ve Vade Taksiti Nasıl Etkiler?",
          paragraphs: [
            "Aynı kredi tutarında faiz oranının yükselmesi, diğer koşullar aynı kaldığında aylık taksit ve toplam geri ödeme tutarının yükselmesine neden olabilir.",
            "Vadenin uzatılması ise aylık ödeme yükünü azaltabilir; ancak borç daha uzun süre devam ettiği için toplam geri ödeme tutarı artabilir. Bu nedenle kredi karşılaştırırken yalnızca düşük taksite odaklanmak yanıltıcı olabilir."
          ]
        },

        {
          title: "Kredi Geri Ödeme Nasıl Değerlendirilir?",
          paragraphs: [
            "Kredi geri ödeme tutarı değerlendirilirken aylık taksit, toplam geri ödeme ve krediye bağlı maliyetler birlikte ele alınmalıdır.",
            "Tüketici kredilerinde sözleşmede efektif yıllık maliyet oranının yer alması zorunludur. Bu oran, kredi tekliflerinin toplam maliyetini yıllık bir oran üzerinden karşılaştırmaya yardımcı olur."
          ]
        },

        {
          title: "Kredi Hesaplama Ne İşe Yarar?",
          paragraphs: [
            "Kredi hesaplama aracı, borçlanmadan önce bütçenize uygun bir ödeme planı oluşturmanıza yardımcı olur.",
            "Özellikle farklı kredi tutarlarını, vadeleri ve faiz oranlarını karşılaştırırken kullanışlıdır. Böylece 'aylık ne kadar öderim?' sorusunun yanında 'bu kredi bana toplamda ne kadara mal olur?' sorusunu da değerlendirebilirsiniz."
          ],
          bullets: [
            "Aylık kredi taksitini yaklaşık olarak görmek.",
            "Toplam geri ödeme tutarını karşılaştırmak.",
            "Farklı vadelerin maliyet üzerindeki etkisini görmek.",
            "Farklı faiz oranlarını aynı kredi tutarı üzerinden karşılaştırmak."
          ]
        },

        {
          title: "Kredi Erken Ödenirse Ne Olur?",
          paragraphs: [
            "Tüketici kredilerinde borcun tamamı veya bir kısmı vadesinden önce ödenebilir. Erken ödeme durumunda, erken ödenen tutara bağlı olarak faiz ve diğer maliyet unsurlarında gerekli indirimlerin yapılması öngörülmektedir.",
            "Bu nedenle kredi kullanırken yalnızca ilk ödeme planını değil, ileride yapılabilecek ara ödeme veya erken kapama koşullarını da sözleşme üzerinden incelemek faydalıdır."
          ]
        },

        {
          title: "Kredi Hesaplarken Nelere Dikkat Edilmeli?",
          paragraphs: [
            "Bir krediyi yalnızca aylık taksit tutarına göre değerlendirmeyin. Aynı kredi tutarında daha uzun vade aylık taksiti düşürebilir ancak toplam geri ödeme yükünü artırabilir.",
            "Kredi teklifini değerlendirirken faiz oranı, efektif yıllık maliyet oranı, toplam geri ödeme, vade ve krediye bağlı ücretleri birlikte incelemek daha sağlıklı bir karşılaştırma sağlar.",
            "Hesapera üzerindeki sonuçlar bilgilendirme ve karşılaştırma amacı taşır. Kesin kredi koşulları, kredi veren kuruluşun başvuru sırasında sunduğu güncel teklif ve sözleşme şartlarına göre belirlenir."
          ]
        }
      ],

      example: {
        title: "Kredi Hesaplama Örneği",
        text: "Örneğin 500.000 TL kredi kullanmayı düşündüğünüzü varsayalım. Aynı kredi tutarını 12, 24 ve 36 ay vadeler için ayrı ayrı hesaplayarak aylık taksit ile toplam geri ödeme arasındaki farkı görebilirsiniz. Vade uzadıkça aylık ödeme düşebilir; ancak toplam maliyetin nasıl değiştiğini ayrıca kontrol etmek gerekir."
      },

      sources: [
        {
          name: "T.C. Ticaret Bakanlığı – Tüketici Kredisi Sözleşmeleri Hakkında Bilgilendirme",
          url: "https://tuketici.ticaret.gov.tr/yayinlar/tuketici-bilgi-rehberi/tuketici-kredisi-sozlesmeleri-hakkinda-bilgilendirme"
        },
        {
          name: "Tüketici Kredisi Sözleşmeleri Yönetmeliği",
          url: "https://tuketici.ticaret.gov.tr/data/5e81982d13b876a1b04c7a4a/T%C3%BCketici%20Kredisi%20S%C3%B6zle%C5%9Fmeleri%20Y%C3%B6netmeli%C4%9Fi.pdf"
        }
      ]
    },

    relatedCalculators: ["ihtiyac-kredisi","konut-kredisi","is-yeri-kredisi"]
  },
  fields: [
  {
    "id": "loanAmount",
    "label": "Kredi Tutarı",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "monthlyInterestRate",
    "label": "Aylık Faiz Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  },
  {
    "id": "termMonths",
    "label": "Vade (Ay)",
    "type": "number",
    "required": true,
    "min": 1,
    "max": 360
  }
],
  schema,
  calculate: (input) => {
    return calculateLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};


