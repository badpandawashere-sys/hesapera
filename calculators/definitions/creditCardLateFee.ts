import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCreditCardLateFee } from '../formulas/creditCardLateFee';

const schema = z.object({
  overdueAmount: z.number().positive('Geciken tutar 0 dan büyük olmalıdır'),
  monthlyDelayRate: z.number().min(0, 'Aylık faiz oranı negatif olamaz'),
  delayDays: z.number().min(0, 'Gün sayısı negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const creditCardLateFeeCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_creditCardLateFee_001',
  slug: 'kredi-karti-gecikme-faizi',
  status: 'published',
  name: 'Kredi Kartı Gecikme Faizi Hesaplama',
  shortDescription: 'Bankanızın uyguladığı aylık gecikme faiz oranını girerek kredi kartı gecikme faizinizi ve tahmini toplam borcunuzu hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Kartı Gecikme Faizi Hesaplama Aracı | Hesapera',
    description: 'Bankanızın uyguladığı aylık faiz oranı üzerinden kredi kartı gecikme faizini ve toplam borcunuzu hesaplayın.',
    keywords: ["kredi kartı gecikme faizi","gecikme zammı","temerrüt","kredi kartı borcu","TCMB azami oran"],
    canonical: 'https://hesapera.com.tr/hesaplama/kredi-karti-gecikme-faizi',
    faq: [
      {
        question: "Hesaplayıcının bulduğu miktar neden ekstremdekiyle tam uyuşmuyor?",
        answer: "Bankalar net faiz tutarının üzerine yasal olarak KKDF ve BSMV gibi (faizin üzerinden alınan) ek vergiler ekler. Ayrıca resmi tatil günlerine denk gelen günlerin faiz valör hesaplaması iç algoritmalarca farklı yansıtılabilir."
      },
      {
        question: "Sabit bir TCMB oranı var mı?",
        answer: "TCMB kredi kartı referans ve tavan oranları enflasyona ve politika faizine göre her ay güncellenebilmektedir. Bu yüzden kendi ekstremizdeki oranı araca yazmanız en doğrusudur."
      }
    ],
    content: {
      intro: "Kredi kartı dönem borcunun ödenmeyen kısmına TCMB oranları çerçevesinde işletilen faizin çalışma mantığı",

      sections: [
        {
          title: "Kredi Kartı Gecikme Faizi Nedir?",
          paragraphs: [
            "Kredi kartı ekstre son ödeme tarihine kadar 'asgari ödeme tutarının' altında bir ödeme yaparsanız veya hiç ödeme yapmazsanız, eksik kalan (gecikmeye giren) asgari tutar kısmına uygulanan özel faize 'Gecikme Faizi' denir.",
            "Eğer asgari tutarı tam yatırır ancak kalan borcu bırakırsanız, kalan kısma gecikme faizi değil, normal 'Akdi Faiz (Alışveriş Faizi)' işler."
          ]
        },
        {
          title: "Hesaplama Yöntemi (Basit Günlük Model)",
          paragraphs: [
            "Kredi kartlarında faizler aylık olarak ilan edilse de, bankalar arka planda bunu günlüğe bölerek hesaplar.",
            "Araç, girdiğiniz aylık gecikme faizi oranını 30'a bölerek 'Günlük Gecikme Faizi Oranını' bulur. Gecikmeye giren tutar, günlük oran ve geciktiğiniz gün sayısı çarpılarak bankanın keseceği tahmini net faiz yükü ortaya çıkar."
          ]
        },
        {
          title: "Güncel TCMB Tavan Oranları ve Masraflar",
          paragraphs: [
            "Türkiye Cumhuriyet Merkez Bankası (TCMB), kredi kartı azami akdi ve gecikme faiz oranlarını dönemsel olarak piyasa şartlarına göre belirler. Son dönemdeki mevzuata göre borç bakiyesine (30.000 TL altı, 30.000-180.000 TL arası veya nakit çekim vb.) göre farklı kademeli faiz oranları uygulanabilmektedir.",
            "Sizden hesabınızın doğru çıkması için kendi banka ekstrenizdeki GÜNCEL faiz oranını araca (Aylık Oran kısmına) girmeniz beklenir. Sonuca banka tarafından ayrıca BSMV (Banka Sigorta Muamele Vergisi) gibi %15 ekstra vergilerin eklenebileceğini unutmayınız."
          ]
        },
      ],
      example: {
        title: "Gecikme Faizi Örneği",
        text: "Kredi kartınızın asgari tutarından 10.000 TL'lik kısmı eksik yatırdığınızı ve bu tutarın 15 gün gecikmeye düştüğünü varsayalım. Bankanın aylık gecikme faizi %4.25 olsun. Araç bu aylık oranı 30'a bölüp 15 günle çarparak 10.000 TL'nin üzerinden sadece 15 günde kabaca 212 TL salt gecikme faizi (vergiler hariç) biriktiğini hesaplar."
      },
      sources: [
        {
          name: "TCMB - Kredi Kartı Azami Faiz Oranları",
          url: "https://www.tcmb.gov.tr/"
        },
        {
          name: "BDDK - Tüketici Bilgilendirmesi",
          url: "https://www.bddk.org.tr/"
        }
      ]
    },

    relatedCalculators: ["kredi-karti-asgari-odeme-tutari", "kredi-yapilandirma", "kredi"]
  },
  fields: [
    {
      id: "overdueAmount",
      label: "Gecikmeye Giren Tutar",
      type: "currency",
      required: true,
      min: 0
    },
    {
      id: "monthlyDelayRate",
      label: "Aylık Gecikme Faiz Oranı (%)",
      type: "number",
      required: true,
      min: 0,
      step: 0.01,
      description: "Bankanızın uyguladığı gerçek gecikme faiz oranını giriniz."
    },
    {
      id: "delayDays",
      label: "Gecikme Gün Sayısı",
      type: "number",
      required: true,
      min: 0
    }
  ],
  schema,
  calculate: (input) => {
    return calculateCreditCardLateFee(
      input.overdueAmount,
      input.monthlyDelayRate,
      input.delayDays
    );
  }
};
