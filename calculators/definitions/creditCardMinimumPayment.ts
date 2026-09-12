import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCreditCardMinimumPayment } from '../formulas/creditCardMinimumPayment';

const schema = z.object({
  statementBalance: z.number().positive('Dönem borcu 0 dan büyük olmalıdır'),
  minimumPaymentRate: z.number().min(0, 'Oran negatif olamaz').max(100, 'Oran %100 den fazla olamaz')
});

type Input = z.infer<typeof schema>;

export const creditCardMinimumPaymentCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_creditCardMinimumPayment_001',
  slug: 'kredi-karti-asgari-odeme-tutari',
  status: 'published',
  name: 'Kredi Kartı Asgari Ödeme Tutarı Hesaplama',
  shortDescription: 'Kredi kartı dönem borcunuz üzerinden ödemeniz gereken asgari tutarı matematiksel olarak hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Kartı Asgari Ödeme Tutarı Hesaplama Aracı | Hesapera',
    description: 'Kredi kartı dönem borcunuz üzerinden ödemeniz gereken asgari tutarı matematiksel olarak hesaplayın.',
    keywords: ["kredi kartı asgari ödeme","kredi kartı borcu","minimum ödeme","dönem borcu"],
    canonical: 'https://hesapera.com.tr/hesaplama/kredi-karti-asgari-odeme-tutari',
    faq: [
      {
        question: "Kredi kartı asgari ödeme tutarı nedir?",
        answer: "Kredi kartı dönem borcunuz üzerinden, son ödeme tarihine kadar ödemeniz gereken yasal olarak en düşük tutardır."
      },
      {
        question: "Asgari ödeme tutarı ödenmezse ne olur?",
        answer: "Asgari tutarın zamanında ve eksiksiz ödenmemesi gecikmeye ve ilgili faizlerin uygulanmasına yol açabilir. Ödeme performansı kredi geçmişinin değerlendirilmesinde dikkate alınabilir; kart üzerindeki olası kullanım kısıtlamaları ise mevzuat ve banka uygulamalarına göre değişebilir."
      },
      {
        question: "Asgari ödeme oranı neye göre belirlenir?",
        answer: "Asgari ödeme oranı kredi kartınızın toplam limitine ve BDDK'nın (Bankacılık Düzenleme ve Denetleme Kurumu) güncel yasal mevzuatına göre belirlenir."
      },
      {
        question: "Sürekli asgari ödemek mantıklı mı?",
        answer: "Yalnızca asgari tutarı ödemek kalan borcun sonraki döneme taşınmasına neden olabilir. Bu da borcun daha uzun süre devam etmesine ve toplam finansman maliyetinin yükselmesine yol açabilir."
      },
      {
        question: "Kredi kartı asgari tutarı ödenince faiz işler mi?",
        answer: "Dönem borcunun tamamı ödenmediğinde kalan bakiye için uygulanacak faiz ve diğer maliyetler, ilgili dönem için geçerli kredi kartı koşulları ve mevzuata göre belirlenir."
      },
      {
        question: "Asgari ödeme oranı bankadan bankaya değişir mi?",
        answer: "Asgari ödeme oranlarının yasal çerçevesi BDDK düzenlemeleriyle belirlenir. Güncel oran ve uygulama için yürürlükteki mevzuat ile kartınızın güncel bilgileri kontrol edilmelidir."
      }
    ],
    content: {
      intro: "Kredi kartı asgari ödeme tutarı ve hesaplaması hakkında bilmeniz gerekenler",

      sections: [
        {
          title: "Kredi Kartı Asgari Ödeme Tutarı Nedir?",
          paragraphs: [
            "Kredi kartı asgari ödeme tutarı, hesap kesiminden sonra oluşan dönem borcunuz için son ödeme tarihine kadar ödenmesi gereken yasal minimum tutardır.",
            "Son ödeme tarihine kadar ekstrenizdeki dönemsel borcun tamamını ödeyemiyorsanız, gecikmeye düşmemek ve kredi notunuzun olumsuz etkilenmemesi için en azından bu asgari tutarı ödemeniz zorunludur. Asgari tutarın altındaki ödemeler, yasal olarak eksik ödeme veya ödememe sayılır."
          ]
        },

        {
          title: "Kredi Kartı Asgari Ödemesi Nasıl Hesaplanır?",
          paragraphs: [
            "Asgari ödeme tutarı; ilgili döneme ait toplam dönem borcunun, bankanız veya yasal düzenleyiciler (BDDK) tarafından belirlenen 'asgari ödeme oranı' ile çarpılmasıyla hesaplanır.",
            "Bu oran kredi kartı limitinize göre değişkenlik gösterebilir. Dönem borcunuz üzerinden hesaplanan asgari tutarı ödediğinizde, kalan borcunuza bankanızın belirlediği akdi (kredi kartı) faiz oranı işletilerek bir sonraki döneme devreder."
          ],
          bullets: [
            "Dönem Borcu: Ekstreniz kesildiğinde oluşan toplam borç bakiyesi.",
            "Asgari Ödeme Oranı (%): Kredi kartınızın limitine göre değişen minimum ödeme yüzdesi.",
            "Asgari Ödeme Tutarı: Son ödeme tarihine kadar yatırmanız gereken en az tutar."
          ]
        },

        {
          title: "Asgari Ödeme Oranları Ne Kadardır?",
          paragraphs: [
            "Bankacılık Düzenleme ve Denetleme Kurumu (BDDK), kredi kartı limitlerine göre farklı asgari ödeme oranları belirleyebilir. Ekonomik şartlara göre bu oranlar güncellenmektedir.",
            "BDDK'nın 26 Eylül 2024 tarihli 10970 sayılı Kurul Kararı ile limiti 50.000 TL ve altında olan kredi kartlarında dönem borcunun %20'si, 50.000 TL'nin üzerinde olan kredi kartlarında ise %40'ı asgari ödeme tutarı olarak belirlenmiştir. Güncel mevzuat değişebileceğinden uygulama öncesinde yürürlükteki BDDK düzenlemeleri kontrol edilmelidir.",
            "Kredi kartınızın limiti, yeni tahsis edilip edilmediği ve mevcut BDDK düzenlemeleri, tarafınıza uygulanacak asgari ödeme oranını doğrudan belirler. En güncel asgari ödeme oranınızı kart ekstrenizden veya bankanızdan öğrenebilirsiniz."
          ]
        },

        {
          title: "Sadece Asgari Tutarı Ödemek Ne Anlama Gelir?",
          paragraphs: [
            "Kredi kartı dönem borcunun tamamı yerine yalnızca asgari tutarı ödendiğinde kalan borç sonraki döneme devreder. Kalan borca uygulanacak faiz ve diğer maliyetler, ilgili dönem için geçerli kredi kartı koşulları ve mevzuat çerçevesinde belirlenir.",
            "Sürekli olarak yalnızca asgari tutarı ödemek, kalan borcun sonraki dönemlere taşınmasına ve buna bağlı olarak toplam finansman maliyetinin artmasına neden olabilir. Bu nedenle mümkün olduğunda dönem borcunun daha büyük bir bölümünü veya tamamını ödemek maliyet açısından daha avantajlı olabilir."
          ]
        },

        {
          title: "Asgari Ödeme Yapılmazsa Ne Olur?",
          paragraphs: [
            "Asgari ödeme tutarını son ödeme tarihine kadar ödemezseniz veya eksik öderseniz, ödenmeyen kısım için 'gecikme faizi' işletilir.",
            "Asgari ödeme tutarının son ödeme tarihine kadar ödenmemesi veya eksik ödenmesi gecikmeye ve ilgili faizlerin uygulanmasına yol açabilir. Ödeme performansı ayrıca kredi geçmişinin değerlendirilmesinde dikkate alınabilir. Kartın kullanımına ilişkin uygulanabilecek kısıtlamalar ise ilgili mevzuat, kart sözleşmesi ve bankanın uygulamalarına göre değişebilir."
          ]
        },

        {
          title: "Hesaplama Sonucu Kesin midir?",
          paragraphs: [
            "Bu araç, ekstrenizdeki dönem borcuna kendi girdiğiniz asgari ödeme oranını uygulayarak matematiksel bir hesaplama sunar.",
            "Ancak nakit avans kullanımları, taksitli işlemler veya bankanızın özel yasal uygulamaları asgari ödeme tutarına tam olarak etki edebilir. Ekstrenizde yer alan kesin tutar, bankanızın resmi sistemleri tarafından hesaplanan tutardır."
          ]
        }
      ],

      example: {
        title: "Asgari Ödeme Hesaplama Örneği",
        text: "Kredi kartı ekstrenizde 20.000 TL dönem borcunuz bulunduğunu ve kart limitiniz gereği asgari ödeme oranının %20 olduğunu varsayalım. Asgari ödeme tutarınız 20.000 x 0,20 = 4.000 TL olacaktır. Bu tutarı ödediğinizde kalan 16.000 TL'lik borcunuz faizlendirilerek bir sonraki döneme aktarılır."
      },

      sources: [
        {
          name: "Bankacılık Düzenleme ve Denetleme Kurumu (BDDK) - Kredi Kartı Uygulamaları",
          url: "https://www.bddk.org.tr/"
        },
        {
          name: "TCMB - Kredi Kartı Azami Faiz Oranları",
          url: "https://www.tcmb.gov.tr/"
        }
      ]
    },

    relatedCalculators: ["kredi-karti-gecikme-faizi","kredi-karti-islem-taksitlendirme"]
  },
  fields: [
  {
    "id": "statementBalance",
    "label": "Dönem Borcu",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "minimumPaymentRate",
    "label": "Asgari Ödeme Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01,
    "description": "Bu oran bankanızın politikasına veya yasal mevzuata göre değişebilir. Kendi oranınızı girin."
  }
],
  schema,
  calculate: (input) => {
    return calculateCreditCardMinimumPayment(input.statementBalance, input.minimumPaymentRate);
  }
};


