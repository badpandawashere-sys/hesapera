import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateVehicleLoan } from '../formulas/vehicleLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const vehicleLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_vehicleLoan_001',
  slug: 'tasit-kredisi',
  status: 'published',
  name: 'Taşıt Kredisi Hesaplama',
  shortDescription: 'Otomobil veya diğer taşıt alımlarınız için kullanacağınız kredinin taksit ve ödeme planını anında hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Taşıt Kredisi Hesaplama Aracı | Hesapera',
    description: 'Otomobil veya diğer taşıt alımlarınız için kullanacağınız kredinin taksit ve ödeme planını anında hesaplayın.',
    keywords: ["taşıt kredisi","araç kredisi","araba kredisi hesaplama","kredi taksiti"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/tasit-kredisi',
    faq: [
      {
        question: "Taşıt kredisi taksiti nasıl hesaplanır?",
        answer: "Araç kredisi taksiti; anapara, güncel aylık faiz oranı ve tercih edilen vade süresi kullanılarak eşit taksitli (anüite) sistemine göre hesaplanır."
      },
      {
        question: "Sıfır araç ile ikinci el araç kredi faizi aynı mıdır?",
        answer: "Genellikle finans kuruluşları, sıfır kilometre araçlar ile 2. el araçlar için farklı kampanya ve faiz oranları sunabilmektedir. İkinci elde aracın yaşına göre kısıtlamalar da olabilir."
      },
      {
        question: "Taşıt kredisinde kasko zorunlu mu?",
        answer: "Bankalar, kredi kullandırdıkları aracın değerini korumak adına kredi süresince kasko yaptırılmasını ve üzerine rehin (daintehin) konulmasını genel olarak şart koşarlar."
      },
      {
        question: "Aracın kasko değerinin tamamına kredi çekilebilir mi?",
        answer: "Hayır. BDDK düzenlemeleri gereği, aracın kasko değerinin belirli bir yüzdesine kadar kredi kullanılabilir. Kalan kısım tüketici tarafından peşinat olarak karşılanmalıdır."
      },
      {
        question: "Taşıt kredisi vade sınırları nelerdir?",
        answer: "Araç kredisi maksimum vadeleri, aracın fatura veya kasko değerine göre BDDK tarafından sınırlandırılır. Değer arttıkça kullanılabilecek maksimum vade süresi (48, 36, 24, 12 ay gibi) düşer."
      },
      {
        question: "Araç kredisi erken kapatılabilir mi?",
        answer: "Evet, taşıt kredisi borcunun tamamı vadesinden önce kapatılabilir. Bu durumda ileriye dönük faizler düşülerek indirim sağlanır. Erken ödeme şartları sözleşmede yer alır."
      }
    ],
    content: {
      intro: "Taşıt kredisi ve araç finansmanı hesaplama hakkında bilmeniz gerekenler",

      sections: [
        {
          title: "Taşıt Kredisi Hesaplama Nedir?",
          paragraphs: [
            "Taşıt kredisi hesaplama, sıfır veya ikinci el araç satın alırken kullanmayı planladığınız kredi tutarının, faiz ve vade koşullarına göre aylık taksitlerini ve toplam geri ödeme tutarını gösteren bir hesaplamadır.",
            "Otomobil kredisinde yalnızca aylık taksite bakmak yerine, farklı faiz oranlarını ve vadeleri karşılaştırarak toplam finansman maliyetini (borcun size toplamda ne kadara mal olacağını) anlamak, doğru bütçe planlaması için kritik öneme sahiptir."
          ]
        },

        {
          title: "Araç Kredisi Taksiti Nasıl Hesaplanır?",
          paragraphs: [
            "Eşit taksitli taşıt kredilerinde aylık taksit hesabı; kullanılacak kredi anaparası, aylık faiz oranı ve seçilen vade sayısına (ay) göre yapılır.",
            "Ticaret Bakanlığı'nın standartlarına göre anüite (eşit taksitli ödeme) formülü kullanılarak, vade boyunca taksit tutarı sabit kalacak şekilde her ay ne kadar faiz ve ne kadar anapara ödeneceği belirlenir.",
            "Ödemeler ilerledikçe, kalan anapara borcu düşeceğinden taksit içindeki faiz payı azalır, anaparaya giden pay ise artar."
          ],
          bullets: [
            "Kredi tutarı: Aracın değeri üzerinden mevzuatça belirlenen oranda kullanılabilecek finansman miktarı.",
            "Aylık faiz oranı: Finans kuruluşunun uyguladığı taşıt kredisi faiz oranı.",
            "Vade: Araç kredilerinde yaş ve değere göre değişebilen yasal maksimum ay sayısı.",
            "Aylık taksit: Kredi süresince düzenli olarak yapılması gereken ödeme."
          ]
        },

        {
          title: "Taşıt Kredisi Limitleri ve Kasko Değeri Oranları",
          paragraphs: [
            "Taşıt kredilerinde kullanılabilecek maksimum kredi tutarı ve vade süresi, aracın sıfır kilometre mi yoksa ikinci el mi olduğuna ve fatura/kasko değerine göre yasal düzenlemelerle belirlenmektedir.",
            "Taşıt kredilerinde kullanılabilecek azami kredi tutarı ve vade, aracın türü, değeri ve yürürlükteki BDDK düzenlemelerine göre değişebilir. Bu nedenle %70, %50, %30 veya %20 gibi oranlar ile 48, 36, 24 veya 12 ay gibi vade sınırları bütün araçlar için değişmez bir kural olarak değerlendirilmemelidir. Özellikle elektrik motorlu taşıtlar için farklı düzenlemeler bulunabildiğinden, kredi başvurusu öncesinde güncel BDDK kuralları ve finans kuruluşunun uyguladığı limitler kontrol edilmelidir.",
            "Aynı şekilde maksimum vade sınırları da kasko değerine göre 48 ay, 36 ay, 24 ay veya 12 ay olarak sınırlandırılabilmektedir. Bu sınırlar piyasa koşullarına göre yetkili kurumlarca güncellenir."
          ]
        },

        {
          title: "Taşıt Kredisi Hesaplama Nasıl Kullanılır?",
          paragraphs: [
            "Almak istediğiniz aracın değerine göre peşinatınızı çıkardıktan sonra kalan finansman ihtiyacınızı (kredi tutarını) hesaplama aracına girin.",
            "Bankanızın size sunduğu güncel taşıt kredisi faiz oranını ve yasaların izin verdiği sınırlar içerisindeki vadeyi (örneğin 36 veya 48 ay) seçin.",
            "Sonuç ekranında, aylık taksitleri ve en önemlisi kredinin size toplam geri ödeme maliyetini detaylıca inceleyebilirsiniz."
          ]
        },

        {
          title: "Faiz Oranı ve Vade Araç Kredisini Nasıl Etkiler?",
          paragraphs: [
            "Vade uzadıkça aylık taksit tutarınız düşer, aylık bütçenize binen yük azalır. Ancak borç uzun süreye yayıldığı için bankaya ödeyeceğiniz toplam faiz (ve dolayısıyla toplam geri ödeme tutarı) artar.",
            "Bu nedenle araç kredisi çekerken, 'Aylık ne kadar ödeyebilirim?' sorusu ile 'Bu araca toplamda ne kadar faiz ödeyeceğim?' sorusunu dengeleyen en optimum vadeyi bulmak gerekir."
          ]
        },

        {
          title: "Taşıt Kredisi Toplam Geri Ödeme Nasıl Değerlendirilir?",
          paragraphs: [
            "Toplam geri ödeme tutarı, sadece aylık taksitlere odaklanmanın önüne geçerek kredinin asıl maliyetini ortaya çıkarır.",
            "Finans kuruluşları sözleşmede efektif yıllık maliyet oranını belirtmek zorundadır. Bu oran; kredi tahsis ücreti (dosya masrafı), rehin tesis ücreti, kasko ve sigorta masrafları gibi ek maliyetleri de kapsadığı için bankalar arası karşılaştırma yaparken en doğru kriterdir."
          ]
        },

        {
          title: "Araç Kredisi Kullanırken Nelere Dikkat Edilmeli?",
          paragraphs: [
            "Yalnızca aylık taksitlere ve manşet faiz oranına değil, mutlaka kredi tahsis ücreti, hayat sigortası, zorunlu kasko poliçesi gibi yan masraflara ve Yıllık Maliyet Oranına dikkat edin.",
            "Aracın üzerine banka tarafından rehin konulacağını unutmayın. Kredi borcu bitene kadar araç satılamaz. Borç bittiğinde fek yazısı (rehin kaldırma) işlemi yapılarak araç üzerindeki rehin kaldırılır.",
            "Taşıt kredilerinde erken ödeme yapmak veya krediyi tamamen erken kapatmak mümkündür. Erken kapama durumunda vadesi gelmemiş faizlerde yasal mevzuata uygun indirimler yapılır."
          ]
        }
      ],

      example: {
        title: "Taşıt Kredisi Hesaplama Örneği",
        text: "Örneğin 600.000 TL taşıt kredisi kullanacağınızı varsayalım. Aynı tutarı 24 ay ve 48 ay vadelerle hesapladığınızda, 48 ay vadede aylık taksitiniz belirgin şekilde düşük çıkacaktır. Ancak 48 ayın sonunda ödemiş olduğunuz toplam tutar, 24 aya göre çok daha yüksek bir faiz yükü içerecektir."
      },

      sources: [
        {
          name: "BDDK - Bankacılık Düzenleme ve Denetleme Kurumu Taşıt Kredisi Sınırları",
          url: "https://www.bddk.org.tr/"
        },
        {
          name: "T.C. Ticaret Bakanlığı – Tüketici Bilgi Rehberi",
          url: "https://tuketici.ticaret.gov.tr/"
        }
      ]
    },

    relatedCalculators: ["ticari-arac-kredisi","kredi-hesaplama","ihtiyac-kredisi"]
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateVehicleLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};

