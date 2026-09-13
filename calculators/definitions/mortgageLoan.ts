import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMortgageLoan } from '../formulas/mortgageLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const mortgageLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_mortgageLoan_001',
  slug: 'konut-kredisi',
  status: 'published',
  name: 'Konut Kredisi Hesaplama',
  shortDescription: 'Ev sahibi olmak için çekeceğiniz konut kredisinin aylık ödemelerini ve faiz detaylarını görün.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Konut Kredisi Hesaplama Aracı | Hesapera',
    description: 'Konut kredisi tutarı, faiz oranı ve vade bilgilerinizi girerek aylık taksit tutarını, toplam geri ödemeyi ve toplam faiz maliyetini hesaplayın.',
    keywords: ["konut kredisi","ev kredisi","kredi hesaplama","mortgage"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/konut-kredisi',
    faq: [
      {
        question: "Konut kredisi taksiti nasıl hesaplanır?",
        answer: "Konut kredisi taksiti temel olarak kredi tutarı, aylık faiz oranı ve vade kullanılarak hesaplanır. Gerçek banka teklifinde krediye bağlı diğer maliyetler de toplam ödeme planını etkileyebilir."
      },
      {
        question: "Ev kredisi hesaplama ile konut kredisi hesaplama aynı şey midir?",
        answer: "Günlük kullanımda ev kredisi ve konut kredisi ifadeleri aynı amaçla kullanılabilir. Hesaplama açısından kredi tutarı, faiz oranı ve vade üzerinden aylık taksit ve toplam geri ödeme karşılaştırılır."
      },
      {
        question: "Peşinat arttıkça konut kredisi taksiti düşer mi?",
        answer: "Kredi ihtiyacı azalırsa kullanılacak kredi tutarı da azalabilir. Kredi tutarının azalması, aynı faiz ve vade koşullarında aylık taksit ile toplam geri ödeme tutarının da düşmesine neden olabilir."
      },
      {
        question: "Vade uzadıkça konut kredisi daha mı pahalı olur?",
        answer: "Vadenin uzaması aylık taksiti düşürebilir ancak borç daha uzun süre devam ettiği için toplam geri ödeme tutarı artabilir. Bu nedenle vade karşılaştırırken hem aylık taksite hem toplam maliyete bakılmalıdır."
      },
      {
        question: "Konut kredisi hesaplama sonucu kesin kredi tutarını gösterir mi?",
        answer: "Hayır. Hesaplama aracı yaklaşık bir finansman senaryosu oluşturur. Kullanılabilecek kesin kredi tutarı; konutun değeri, yürürlükteki düzenlemeler, finans kuruluşunun değerlendirmesi ve başvuru sahibinin finansal durumuna göre belirlenebilir."
      },
      {
        question: "Konut kredisi kullanırken yıllık maliyet oranına neden bakılmalı?",
        answer: "Yıllık maliyet oranı, kredinin toplam maliyetini yıllık bir oran üzerinden değerlendirmeye yardımcı olur. Konut finansmanı sözleşmelerinde yıllık maliyet oranının yer alması zorunludur."
      }
    ],
    content: {
      intro: "Konut kredisi ve ev kredisi hesaplama hakkında bilmeniz gerekenler",

      sections: [
        {
          title: "Konut Kredisi Hesaplama Nedir?",
          paragraphs: [
            "Konut kredisi hesaplama, ev satın alırken kullanmayı düşündüğünüz kredi tutarının faiz ve vade koşullarına göre aylık taksit ve toplam geri ödeme yükünü görmenizi sağlar.",
            "Ev kredisi hesaplama yaparken yalnızca aylık taksite bakmak yerine kredi tutarı, vade, faiz oranı ve toplam geri ödeme arasındaki ilişkiyi birlikte değerlendirmek önemlidir. Özellikle uzun vadeli konut finansmanında küçük oran farklılıkları toplam maliyeti önemli ölçüde değiştirebilir."
          ]
        },

        {
          title: "Konut Kredisi Nasıl Hesaplanır?",
          paragraphs: [
            "Eşit taksitli bir konut kredisi hesaplamasında temel olarak kredi tutarı, aylık faiz oranı ve vade kullanılır. Aylık taksit, kredi anaparasının faiz ve vade bilgileriyle birlikte değerlendirilmesiyle hesaplanır.",
            "Hesaplama sonucunda aylık taksit ile toplam geri ödeme karşılaştırılır. Ancak gerçek bir konut finansmanı teklifinde faiz dışında vergi, ücret, sigorta ve sözleşmeye bağlı diğer maliyetler bulunabileceği için yalnızca hesap makinesindeki taksit tutarına bakmak yeterli değildir.",
            "Konut finansmanı mevzuatında ödeme planında anapara, faiz, vergi, harç ve varsa ücretlerin ayrı ayrı gösterilmesine ilişkin düzenlemeler bulunmaktadır."
          ],
          bullets: [
            "Kredi tutarı: Konut alımı için kullanılmak istenen finansman tutarı.",
            "Aylık faiz oranı: Krediye uygulanan aylık oran.",
            "Vade: Kredinin kaç ayda geri ödeneceği.",
            "Toplam geri ödeme: Vade boyunca yapılacak ödemelerin toplamı."
          ]
        },

        {
          title: "Konut Kredisi Hesaplama Nasıl Kullanılır?",
          paragraphs: [
            "Öncelikle satın almayı düşündüğünüz konut için kullanmayı planladığınız kredi tutarını belirleyin. Ardından bankanın veya finans kuruluşunun sunduğu güncel aylık faiz oranını ve istediğiniz vadeyi hesaplama aracına girin.",
            "Sonuç ekranında aylık taksit ve toplam geri ödeme tutarını birlikte inceleyin. Aynı kredi tutarını farklı vadelerde tekrar hesaplayarak kısa ve uzun vadenin bütçeniz üzerindeki etkisini karşılaştırabilirsiniz."
          ]
        },

        {
          title: "Ne Kadar Konut Kredisi Kullanabilirim?",
          paragraphs: [
            "Kullanılabilecek konut kredisi tutarı yalnızca satın alınacak evin fiyatına bakılarak belirlenmez. Konutun değeri, finansman kuruluşunun değerlendirmesi, yürürlükteki düzenlemeler ve başvuru sahibinin finansal durumu birlikte dikkate alınabilir.",
            "Bu nedenle hesaplama aracına girdiğiniz kredi tutarı, bankanın kesin olarak kullandıracağı kredi miktarı anlamına gelmez. Kesin kredi tutarı başvuru ve değerlendirme sürecinde belirlenir."
          ]
        },

        {
          title: "Peşinat Konut Kredisi Tutarını Nasıl Etkiler?",
          paragraphs: [
            "Peşinat, konutun satın alma bedelinin kredi dışında kalan bölümünü ifade eder. Daha yüksek peşinat ayırmak, ihtiyaç duyulan kredi tutarının azalmasını sağlayabilir.",
            "Örneğin 4 milyon TL değerindeki bir konut için 1 milyon TL peşinat ayırdığınızı varsayalım. Başlangıçtaki finansman ihtiyacı 3 milyon TL olur. Hesaplama aracında kredi tutarını bu finansman ihtiyacına göre değiştirerek aylık taksit ve toplam geri ödeme üzerindeki etkisini inceleyebilirsiniz.",
            "Konutun ekspertiz değeri ile satış fiyatı arasındaki fark ve yürürlükteki kredi sınırları da kullanılabilecek kredi tutarını etkileyebileceğinden, örnek hesaplama sonucu kesin kredi limiti olarak değerlendirilmemelidir."
          ]
        },

        {
          title: "Vade ve Faiz Oranı Aylık Taksiti Nasıl Değiştirir?",
          paragraphs: [
            "Vade uzadıkça kredi borcu daha uzun bir döneme yayılır. Bu durum aylık taksit tutarını düşürebilir; ancak toplam geri ödeme tutarının yükselmesine yol açabilir.",
            "Faiz oranındaki değişiklik de aylık taksit ve toplam maliyet üzerinde doğrudan etkilidir. Bu nedenle konut kredisi karşılaştırırken yalnızca düşük aylık taksite değil, toplam geri ödeme ve yıllık maliyet oranı gibi göstergelere de bakmak gerekir."
          ]
        },

        {
          title: "Konut Kredisi Toplam Geri Ödeme Nasıl Değerlendirilir?",
          paragraphs: [
            "Toplam geri ödeme, kredi boyunca yapılacak ödemelerin tamamının değerlendirilmesine yardımcı olur. Aylık taksit düşük olsa bile uzun bir vade toplam ödeme yükünü artırabilir.",
            "Konut finansmanı sözleşmelerinde yıllık maliyet oranının yer alması zorunludur. Bu nedenle kredi tekliflerini karşılaştırırken yalnızca ilan edilen faiz oranını değil, sözleşmede yer alan toplam maliyet unsurlarını da incelemek daha sağlıklı bir karşılaştırma sağlar."
          ]
        },

        {
          title: "Konut Kredisi Kullanırken Nelere Dikkat Edilmeli?",
          paragraphs: [
            "Ev kredisi seçerken aylık taksit ile birlikte toplam geri ödeme, vade, faiz türü, yıllık maliyet oranı ve krediye bağlı ücretleri inceleyin.",
            "Konut finansmanı sözleşmelerinde sigorta konusunda tüketicinin açık talebi önemlidir. Ticaret Bakanlığı bilgilendirmesine göre tüketicinin açık talebi olmadan krediyle ilgili sigorta yaptırılamaz; tüketici sigorta yaptırmak istediğinde belirli koşullar altında kendi seçtiği sigorta şirketinden teminat sağlayabilir.",
            "Kredinin erken kapatılması veya erken ödeme yapılması halinde uygulanacak hükümleri de sözleşmeden kontrol etmek gerekir. Sabit faizli ve değişken faizli konut finansmanı sözleşmelerinde erken ödeme kuralları farklı şekilde düzenlenebilir."
          ]
        }
      ],

      example: {
        title: "Konut Kredisi Örnek Hesaplama",
        text: "Örneğin 3.000.000 TL konut kredisi kullanmayı düşündüğünüzü varsayalım. Aynı kredi tutarını önce 60 ay, sonra 120 ay vade ile hesaplayarak aylık taksit ve toplam geri ödeme arasındaki farkı görebilirsiniz. Daha uzun vadede aylık ödeme azalabilir; ancak toplam maliyet artabilir. Gerçek teklif için finans kuruluşunun güncel faiz oranı, yıllık maliyet oranı ve sözleşme koşulları ayrıca incelenmelidir."
      },

      sources: [
        {
          name: "T.C. Ticaret Bakanlığı – Konut Finansmanı Sözleşmeleri Hakkında Bilgilendirme",
          url: "https://tuketici.ticaret.gov.tr/yayinlar/tuketici-bilgi-rehberi/konut-finansmani-sozlesmeleri-hakkinda-bilgilendirme"
        },
        {
          name: "Konut Finansmanı Sözleşmeleri Yönetmeliği – Resmî Gazete",
          url: "https://resmigazete.gov.tr/eskiler/2015/05/20150528-2.htm"
        }
      ]
    },

    relatedCalculators: ["ihtiyac-kredisi","is-yeri-kredisi"]
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateMortgageLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};


