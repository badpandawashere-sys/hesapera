import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMaxLoanAmount } from '../formulas/maxLoanAmount';

const schema = z.object({
  maxMonthlyPayment: z.number().positive('Maksimum aylık ödeme 0 dan büyük olmalıdır'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz'),
  termMonths: z.number().int().positive('Vade pozitif olmalıdır'),
  existingMonthlyDebt: z.number().min(0, 'Mevcut borç negatif olamaz')
}).refine(data => data.existingMonthlyDebt <= data.maxMonthlyPayment, { message: 'Mevcut aylık borcunuz maksimum kapasiteden büyük olamaz.', path: ['existingMonthlyDebt'] });

type Input = z.infer<typeof schema>;

export const maxLoanAmountCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_maxLoanAmount_001',
  slug: 'ne-kadar-kredi-alabilirim',
  status: 'published',
  name: 'Ne Kadar Kredi Alabilirim Hesaplama',
  shortDescription: 'Ödeyebileceğiniz aylık taksit kapasitesine göre bankalardan teorik olarak çekebileceğiniz maksimum kredi miktarını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Ne Kadar Kredi Alabilirim Hesaplama Aracı | Hesapera',
    description: 'Ödeyebileceğiniz aylık taksit kapasitesine göre bankalardan teorik olarak çekebileceğiniz maksimum kredi miktarını hesaplayın.',
    keywords: ["ne kadar kredi alabilirim","kredi limiti hesaplama","aylık ödeme kapasitesi"],
    canonical: 'https://hesapera.com.tr/hesaplama/ne-kadar-kredi-alabilirim',
    faq: [
      {
        question: "Mevcut borcumu yazmak zorunda mıyım?",
        answer: "Kesinlikle evet. Bankalar limit hesaplarken sizin sadece maaşınıza değil, hâlihazırda ödemekte olduğunuz diğer kredi ve eksi hesap borçlarınıza da bakarak yeni taksit kapasitenizi düşürür."
      },
      {
        question: "Bu hesaplama banka onayı garantisi verir mi?",
        answer: "Hayır. Araç size sadece basit finans matematiğine dayalı maksimum tahmini tavanı (bütçe hedefinizi) gösterir. Yasal limitler ve kredi siciliniz nedeniyle gerçek rakam çok daha az çıkabilir."
      }
    ],
    content: {
      intro: "Aylık ödeme gücünüze, gelir-gider dengenize ve faiz oranlarına göre kullanabileceğiniz tahmini kredi üst limiti rehberi",

      sections: [
        {
          title: "Maksimum Kredi Kapasitesi Nedir?",
          paragraphs: [
            "Bireysel borçlanmalarda en kritik faktör 'Aylık Taksit Ödeme Gücünüz'dür. Bu araç, aylık ödeyebileceğiniz maksimum tutardan (varsa) mevcut kredi/kredi kartı taksitlerinizi düşerek 'Net Kullanılabilir Aylık Ödeme' kapasitenizi bulur.",
            "Ardından belirlediğiniz aylık faiz oranı ve vade süresini kullanarak tersine (reverse annuity) formülüyle bankanın size bugünün değeriyle toplamda en fazla ne kadar anapara kullandırabileceğini hesaplar."
          ]
        },
        {
          title: "Bankaların Gerçek Değerlendirme Algoritmaları",
          paragraphs: [
            "Hesapera aracı teorik bir ters-matematik uygular. Oysa gerçek hayatta bankalar yasal DTI (Debt-to-Income / Borç-Gelir) limitlerine uymak zorundadır.",
            "Bankalar genellikle aylık kredi taksitleri toplamınızın (yeni çekeceğiniz kredi dahil), resmi ve belgelenebilir hane gelirinizin yarısını (%50'sini) aşmamasına dikkat eder."
          ]
        },
        {
          title: "Kredi Notu ve Diğer Değişkenlerin Etkisi",
          paragraphs: [
            "Ödeyebileceğiniz taksit miktarı yüksek olsa bile; Kredi Kayıt Bürosu (Findeks) notunuz düşükse, çalışma geçmişiniz (sigortalılık süresi) yetersizse veya kefil/ipotek gösterilemiyorsa banka kredi başvurunuzu reddedebilir veya onaylanan limit hesaplayıcının bulduğu teorik limitten çok daha düşük olabilir."
          ]
        },
      ],
      example: {
        title: "Teorik Ters Orantı Hesabı Örneği",
        text: "Kişinin her ay krediye rahatça ayırabileceği net miktar 10.000 TL olsun. Başka hiçbir borcu yok. Seçtiği bankanın faiz oranı %3 ve vadesi de 24 ay. Sistem 24 ay boyunca 10.000 TL'lik taksit ödeyecek bir kişinin (faizler düşüldükten sonra) bugün bankadan maksimum 169.000 TL anapara alabileceğini formülle bulur."
      },
      sources: [
        {
          name: "BDDK - Bireysel Kredi Sınırlandırmaları",
          url: "https://www.bddk.org.tr/"
        }
      ]
    },

    relatedCalculators: ["ihtiyac-kredisi","konut-kredisi"]
  },
  fields: [
  {
    "id": "maxMonthlyPayment",
    "label": "Maksimum Aylık Ödeyebileceğiniz Tutar",
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
  },
  {
    "id": "existingMonthlyDebt",
    "label": "Mevcut Aylık Kredi / Kredi Kartı Borcunuz",
    "type": "currency",
    "required": true,
    "min": 0,
    "defaultValue": 0
  }
],
  schema,
  calculate: (input) => {
    return calculateMaxLoanAmount(input.maxMonthlyPayment, input.monthlyInterestRate, input.termMonths, input.existingMonthlyDebt);
  }
};


