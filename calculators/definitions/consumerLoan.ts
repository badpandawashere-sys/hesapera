import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateConsumerLoan } from '../formulas/consumerLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const consumerLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_consumerLoan_001',
  slug: 'ihtiyac-kredisi',
  status: 'published',
  name: 'İhtiyaç Kredisi Hesaplama',
  shortDescription: 'Bireysel ihtiyaçlarınız için çekeceğiniz kredinin aylık taksitlerini ve ödeme planını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'İhtiyaç Kredisi Hesaplama Aracı | Hesapera',
    description: 'Bireysel ihtiyaç kredisi faiz oranlarını karşılaştırın, aylık taksit tutarını, toplam geri ödemeyi ve kredi ödeme planınızı detaylıca hesaplayın.',
    keywords: ["ihtiyaç kredisi","bireysel kredi","kredi hesaplama","ödeme planı"],
    canonical: 'https://hesapera.com.tr/hesaplama/ihtiyac-kredisi',
    faq: [
      {
        question: "İhtiyaç kredisi taksiti nasıl hesaplanır?",
        answer: "İhtiyaç kredisi taksiti; kredi tutarı, aylık faiz oranı ve vade bilgileri kullanılarak eşit taksitli ödeme planına göre hesaplanır. Hesaplama sonucunda aylık taksit ve toplam geri ödeme birlikte değerlendirilmelidir."
      },
      {
        question: "Vade uzadıkça ihtiyaç kredisi maliyeti artar mı?",
        answer: "Vade uzadığında aylık taksit genellikle azalır; ancak kredi daha uzun süre devam ettiği için toplam geri ödeme tutarı artabilir. Bu nedenle yalnızca aylık taksite bakmamak gerekir."
      },
      {
        question: "İhtiyaç kredisi hesaplama sonucu kesin midir?",
        answer: "Hayır. Hesaplama araçları karşılaştırma ve bilgilendirme amacıyla yaklaşık sonuç verir. Kesin faiz oranı, masraflar ve ödeme planı finans kuruluşunun başvuru sırasında sunduğu güncel koşullara göre belirlenir."
      },
      {
        question: "İhtiyaç kredisi hesaplamak için hangi bilgiler gerekir?",
        answer: "Temel bir hesaplama için kredi tutarı, aylık faiz oranı ve vade bilgisi yeterlidir."
      },
      {
        question: "Düşük aylık taksit daha ucuz kredi anlamına gelir mi?",
        answer: "Her zaman değil. Daha uzun vade aylık taksiti azaltabilir ancak toplam geri ödeme tutarını artırabilir. Kredi karşılaştırırken aylık taksit ile toplam geri ödemeyi birlikte incelemek gerekir."
      }
    ],
    content: {
      intro: "İhtiyaç kredisi hesaplama hakkında bilmeniz gerekenler",
      sections: [
        {
          title: "İhtiyaç Kredisi Hesaplama Nedir?",
          paragraphs: [
            "İhtiyaç kredisi hesaplama, kullanmayı düşündüğünüz kredi tutarının faiz ve vade koşullarına göre aylık taksitini ve toplam geri ödeme tutarını önceden görmenize yardımcı olur."
          ]
        },
        {
          title: "İhtiyaç Kredisi Nasıl Hesaplanır?",
          paragraphs: [
            "Eşit taksitli ihtiyaç kredilerinde aylık taksit hesabında kredi anaparası, aylık faiz oranı ve toplam taksit sayısı dikkate alınır."
          ],
          bullets: [
            "Kredi tutarı: Kullanmak istediğiniz toplam kredi miktarı.",
            "Aylık faiz oranı: Kredinin aylık faiz oranı.",
            "Vade: Kredinin kaç ayda geri ödeneceği."
          ]
        },
        {
          title: "İhtiyaç Kredisi Hesaplama Nasıl Kullanılır?",
          paragraphs: [
            "Hesaplama aracında öncelikle kullanmak istediğiniz kredi tutarını girin. Ardından aylık faiz oranını ve kredi vadesini seçin veya girin.",
            "Hesaplama sonucunda oluşan aylık taksit ve toplam geri ödeme tutarını birlikte inceleyin."
          ]
        },
        {
          title: "İhtiyaç Kredisi Hesaplama Ne İşe Yarar?",
          paragraphs: [
            "İhtiyaç kredisi hesaplama aracı, kredi başvurusu yapmadan önce bütçenize uygun bir ödeme planı oluşturmanıza yardımcı olur."
          ],
          bullets: [
            "Aylık kredi taksitini yaklaşık olarak görmek.",
            "Toplam geri ödeme tutarını karşılaştırmak."
          ]
        },
        {
          title: "İhtiyaç Kredisi Hesaplarken Nelere Dikkat Edilmeli?",
          paragraphs: [
            "En düşük aylık taksit her zaman en düşük maliyet anlamına gelmez. Vade uzadığında aylık ödeme azalabilir ancak kredinin daha uzun süre devam etmesi toplam geri ödeme tutarını artırabilir.",
            "Bu nedenle kredi karşılaştırırken aylık taksit, toplam geri ödeme, faiz oranı ve krediye bağlı diğer maliyetleri birlikte değerlendirmek daha sağlıklı olur."
          ]
        }
      ],
      example: {
        title: "İhtiyaç Kredisi Örnek Hesaplama",
        text: "Örneğin 100.000 TL kredi kullanmayı düşündüğünüzü varsayalım. Aynı kredi tutarını önce 12 ay, ardından 24 ay vade ile hesaplayarak aylık taksit ve toplam geri ödeme arasındaki farkı inceleyebilirsiniz."
      },
      sources: [
        {
          name: "T.C. Ticaret Bakanlığı – Tüketici Kredisi Sözleşmeleri",
          url: "https://tuketici.ticaret.gov.tr/"
        }
      ]
    },

    relatedCalculators: ["is-yeri-kredisi","konut-kredisi"]
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateConsumerLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};


