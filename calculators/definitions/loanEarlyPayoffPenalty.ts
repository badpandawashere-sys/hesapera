import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoanEarlyPayoffPenalty } from '../formulas/loanEarlyPayoffPenalty';

const schema = z.object({
  loanType: z.enum(['consumer', 'housing']),
  remainingPrincipal: z.number().positive('Kalan anapara 0 dan büyük olmalıdır'),
  remainingMonths: z.number().int().min(1, 'Kalan vade en az 1 ay olmalıdır'),
  interestType: z.enum(['fixed', 'variable']).optional(),
  hasCompensationClause: z.enum(['true', 'false']).transform(val => val === 'true').optional()
}).refine(data => {
  if (data.loanType === 'housing' && !data.interestType) {
    return false;
  }
  return true;
}, {
  message: 'Konut kredisinde faiz türü seçilmelidir',
  path: ['interestType']
}).refine(data => {
  if (data.loanType === 'housing' && data.interestType === 'fixed' && data.hasCompensationClause === undefined) {
    return false;
  }
  return true;
}, {
  message: 'Tazminat hükmü seçilmelidir',
  path: ['hasCompensationClause']
});

type Input = z.infer<typeof schema>;

export const loanEarlyPayoffPenaltyCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loanEarlyPayoffPenalty_001',
  slug: 'kredi-erken-kapatma-cezasi',
  status: 'published',
  name: 'Kredi Erken Kapatma Cezası Hesaplama',
  shortDescription: '6502 sayılı kanuna göre ihtiyaç ve konut kredilerinde erken ödeme tazminatı yasal tavanını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Erken Kapatma Cezası Hesaplama 2026 | Hesapera',
    description: '6502 sayılı kanuna göre ihtiyaç ve konut kredilerinde erken ödeme tazminatı yasal tavanını hesaplayın.',
    keywords: ["kredi erken kapatma cezası","erken ödeme tazminatı","konut kredisi erken kapatma","kredi kapatma cezası","kredi erken ödeme","konut kredisi erken ödeme tazminatı"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/kredi-erken-kapatma-cezasi',
    faq: [
      {
        question: "İhtiyaç kredisi erken kapatma cezası var mı?",
        answer: "Hayır. 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve ilgili yönetmelikler gereği, ihtiyaç (tüketici) kredilerinde erken ödeme tazminatı veya cezası uygulanamaz. Banka sadece kapatma gününe kadar işlemiş faizi alabilir, erken kapama cezası kesemez."
      },
      {
        question: "Konut kredisi erken kapatma cezası yüzde kaç?",
        answer: "Sabit faizli konut kredilerinde erken ödeme tazminatı, sözleşmede yer alması şartıyla alınabilir. Kalan vade 36 ay veya altında ise en fazla %1, 36 aydan uzun ise en fazla %2 oranında tazminat alınabilir."
      },
      {
        question: "Kalan vade 36 aydan az kalırsa oran nedir?",
        answer: "Erken kapatma işleminin yapıldığı tarihte konut kredisinin kalan vadesi 36 ay ve daha az ise, banka kalan anapara üzerinden en fazla %1 oranında erken ödeme tazminatı talep edebilir."
      },
      {
        question: "Kalan vade 36 aydan fazla kalırsa oran nedir?",
        answer: "Erken kapatma işleminin yapıldığı tarihte konut kredisinin kalan vadesi 36 aydan fazla ise, banka kalan anapara üzerinden en fazla %2 oranında erken ödeme tazminatı talep edebilir."
      },
      {
        question: "Değişken faizli konut kredisinde ceza var mı?",
        answer: "Hayır. Mevzuat gereğince, değişken faizli konut finansmanı sözleşmelerinde tüketiciden erken ödeme tazminatı talep edilemez."
      },
      {
        question: "Sözleşmede madde yoksa tazminat alınabilir mi?",
        answer: "Hayır. Sabit faizli konut kredisi olsa dahi, kredi sözleşmesinde açıkça 'erken ödeme tazminatı alınabilir' şeklinde bir hüküm bulunmuyorsa banka sizden bu tazminatı talep edemez."
      },
      {
        question: "Bankanın istediği tutar neden farklı olabilir?",
        answer: "Hesapera aracı, yasal mevzuattaki %1 ve %2 oranlarını kullanarak 'azami ceza tutarını' hesaplar. Ancak bankaya gerçekte ödeyeceğiniz tam kapatma tutarı içinde; kalan anapara, son ödemenizden kapama gününe kadar işlemiş günlük faiz ve bu faizin vergileri (ihtiyaçta BSMV/KKDF) gibi kalemler de yer alır."
      },
      {
        question: "Erken ödeme tazminatı toplam indirimi aşabilir mi?",
        answer: "Hayır. Konut Finansmanı Sözleşmeleri Yönetmeliği'ne göre bankanın alacağı erken ödeme tazminatı, erken ödeme sebebiyle tüketiciye yapılacak olan faiz ve diğer maliyet indirimlerinin toplam tutarını kesinlikle aşamaz."
      }
    ],
    content: {
      intro: "Kredi erken kapatma işlemlerinde karşılaşabileceğiniz ceza (tazminat) oranlarını, yasal sınırları ve haklarınızı bu araçla hesaplayabilirsiniz.",
      sections: [
        {
          title: "Kredi Erken Kapatma Nedir?",
          paragraphs: [
            "Kredi erken kapatma, tüketicinin bankadan kullandığı kredinin kalan borcunun tamamını veya vadesi gelmemiş birden fazla taksitini vadesinden önce, defaten ödemesi işlemidir.",
            "Tüketici krediyi erken kapattığında, normal ödeme planında yer alan ancak henüz vadesi gelmemiş gelecek aylara ait faiz, BSMV ve KKDF gibi maliyetlerden kurtulur."
          ]
        },
        {
          title: "İhtiyaç Kredisi Erken Kapatılırsa Ceza Ödenir mi?",
          paragraphs: [
            "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve ilgili yönetmeliklere göre, tüketici kredilerinde (ihtiyaç ve taşıt kredileri) erken ödeme tazminatı ya da 'erken kapatma cezası' isimli bir kesinti yapılamaz.",
            "Banka sadece kapatma yapılan güne kadar olan, henüz tahsil edilmemiş günlük faizi ve buna bağlı vergileri alabilir."
          ]
        },
        {
          title: "Konut Kredisinde Erken Ödeme Tazminatı Nasıl Hesaplanır?",
          paragraphs: [
            "Konut finansmanında erken ödeme tazminatı alınabilmesi için kredinin sabit faizli olması ve sözleşmede açıkça tazminat hükmünün bulunması şarttır.",
            "Erken ödenen (kapatılan) anapara tutarı üzerinden yasal sınırlar dahilinde bir tazminat hesaplanır. Ancak bu tutar hiçbir zaman, tüketiciye uygulanan faiz indirimi toplamından daha büyük olamaz."
          ]
        },
        {
          title: "36 Ay Sınırı Nasıl Uygulanır?",
          paragraphs: [
            "Konut kredilerinde tazminat oranını belirleyen kilit nokta 'kapatma anındaki kalan vade' süresidir.",
            "Kalan vadesi 36 ay ve daha az olan kredilerde tazminat tavanı %1 iken, kalan vadesi 36 aydan fazla olan kredilerde yasal tavan oran %2 olarak uygulanır."
          ]
        },
        {
          title: "Sabit ve Değişken Faiz Arasındaki Fark",
          paragraphs: [
            "Yasal düzenlemelere göre sadece 'sabit faizli' konut kredilerinde erken ödeme cezası talep edilebilir.",
            "Eğer konut krediniz değişken faiz oranı ile yapılandırılmışsa, kanun gereği banka sizden herhangi bir erken kapatma cezası alamaz."
          ]
        },
        {
          title: "Sözleşmede Tazminat Hükmü Neden Önemlidir?",
          paragraphs: [
            "Kanunlar bankalara sadece 'tazminat alabilir' hakkı tanır, mecburi kılmaz. Bu yüzden sözleşmenizde erken ödeme tazminatı ile ilgili açık bir hüküm yoksa, bankanın bu yasal tavanları kullanarak bile ceza kesme hakkı yoktur."
          ]
        },
        {
          title: "Bankanın Kapama Tutarı Neden Hesapera Sonucundan Farklı Olabilir?",
          paragraphs: [
            "Hesapera'daki bu araç, size yasalara göre bankanın uygulayabileceği maksimum ceza/tazminat miktarını net olarak gösterir. Ancak bankaya gidip 'kredimi kapatmak istiyorum' dediğinizde size söylenecek toplam rakam farklı olacaktır.",
            "Bunun nedeni, bankanın o rakama 'kalan anaparanızı' ve 'son taksit gününüzden bugüne kadar geçen sürenin günlük işlemiş faizi ile vergilerini' de dahil etmesidir. Hesapera ceza sınırını netleştirirken, banka topyekün ödeyeceğiniz bakiyeyi söyler."
          ]
        },
        {
          title: "Erken Kapamada Faiz İndirimi Nasıl İşler?",
          paragraphs: [
            "Erken kapatma anında gelecek aylara yansıtılan tüm faizler sıfırlanır (kıstelyevm esnasına göre indirim yapılır). İhtiyaç kredilerinde ayrıca gelecek aylara dair BSMV ve KKDF vergileri de artık hesaplanmaz. Sadece o güne dek oluşan borcunuz kapatılmış olur."
          ]
        },
        {
          title: "Ara Ödeme ile Tam Kapama Arasındaki Fark",
          paragraphs: [
            "Tam kapamada borcun tamamı için işlem yapılır ve hesap sıfırlanır. Ara ödemede (kısmi erken ödeme) ise sadece verdiğiniz tutar kadar anapara eksiği oluşur. Ara ödemelerde de aynı %1/%2 sınırları ve erken ödeme kuralları uygulanır, ardından kalan borç için yeni bir ödeme planı (amortization) çıkartılır."
          ]
        },
        {
          title: "Örnek Hesaplamalar",
          paragraphs: [
            "Örnek 1: Kalan anaparası 100.000 TL ve kalan vadesi 40 ay olan bir ihtiyaç kredisini kapatırsanız ceza tutarı 0 TL'dir.",
            "Örnek 2: Kalan anaparası 500.000 TL, kalan vadesi 24 ay (36 aydan az) olan sabit faizli bir konut kredisinde maksimum ceza 500.000 x %1 = 5.000 TL olur.",
            "Örnek 3: Kalan anaparası 500.000 TL, kalan vadesi 60 ay (36 aydan çok) olan sabit faizli bir konut kredisinde maksimum ceza 500.000 x %2 = 10.000 TL olur."
          ]
        }
      ],
      sources: [
        {
          name: "6502 Sayılı Tüketicinin Korunması Hakkında Kanun (Madde 27 ve Madde 37)",
          url: "https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6502.pdf"
        },
        {
          name: "Tüketici Kredisi Sözleşmeleri Yönetmeliği",
          url: "https://www.mevzuat.gov.tr/"
        },
        {
          name: "Konut Finansmanı Sözleşmeleri Yönetmeliği",
          url: "https://www.mevzuat.gov.tr/"
        }
      ]
    },
    relatedCalculators: ["kredi-hesaplama","kredi-yapilandirma","kredi-yillik-maliyet-orani"]
  },
  fields: [
    {
      "id": "loanType",
      "label": "Kredi Türü",
      "type": "select",
      "required": true,
      "options": [
        { "value": "consumer", "label": "İhtiyaç / Tüketici Kredisi" },
        { "value": "housing", "label": "Konut Kredisi" }
      ],
      "defaultValue": "consumer"
    },
    {
      "id": "remainingPrincipal",
      "label": "Kalan Anapara (TL)",
      "type": "currency",
      "required": true,
      "min": 1,
      "defaultValue": 100000
    },
    {
      "id": "remainingMonths",
      "label": "Kalan Vade (Ay)",
      "type": "number",
      "required": true,
      "min": 1,
      "defaultValue": 12
    },
    {
      "id": "interestType",
      "label": "Faiz Türü",
      "type": "select",
      "required": false,
      "options": [
        { "value": "fixed", "label": "Sabit Faiz" },
        { "value": "variable", "label": "Değişken Faiz" }
      ],
      "defaultValue": "fixed",
      "conditions": [{ "fieldId": "loanType", "operator": "equals", "value": "housing" }]
    },
    {
      "id": "hasCompensationClause",
      "label": "Sözleşmenizde erken ödeme tazminatı alınabileceğine ilişkin hüküm var mı?",
      "type": "select",
      "required": false,
      "options": [
        { "value": "true", "label": "Evet" },
        { "value": "false", "label": "Hayır" }
      ],
      "defaultValue": "true",
      "conditions": [{ "fieldId": "loanType", "operator": "equals", "value": "housing" }, { "fieldId": "interestType", "operator": "equals", "value": "fixed" }]
    }
  ],
  schema,
  calculate: (input) => {
    return calculateLoanEarlyPayoffPenalty(
      input.loanType,
      input.remainingPrincipal,
      input.remainingMonths,
      input.interestType,
      input.hasCompensationClause
    );
  }
};
