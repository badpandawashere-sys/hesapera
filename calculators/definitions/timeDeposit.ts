import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateTimeDeposit } from '../formulas/timeDeposit';

const schema = z.object({
  principal: z.number().positive('Anapara 0 dan büyük olmalıdır'),
  interestRate: z.number().min(0, 'Faiz negatif olamaz'),
  maturityType: z.enum(['days', 'months']),
  maturity: z.number().int().positive('Vade 0 dan büyük tam sayı olmalıdır'),
  taxRate: z.number().min(0).max(100)
});

type Input = z.infer<typeof schema>;

export const timeDepositCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_timeDeposit_001',
  slug: 'vadeli-mevduat-faizi',
  status: 'published',
  name: 'Vadeli Mevduat Faizi Hesaplama',
  shortDescription: 'Vadeli mevduatınızın anapara, faiz oranı, vade ve stopaj oranına göre net getirisini ve vade sonu bakiyesini hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Vadeli Mevduat Faizi Hesaplama Aracı | Hesapera',
    description: 'Vadeli mevduatınızın anapara, faiz oranı, vade ve stopaj oranına göre net getirisini ve vade sonu bakiyesini hesaplayın.',
    keywords: ["mevduat faizi","vadeli hesap","net faiz","stopajlı mevduat","vade sonu bakiye"],
    canonical: 'https://hesapera.com.tr/hesaplama/vadeli-mevduat-faizi',
    faq: [
      {
        question: "Mevduat hesabı faizi yıllık mıdır?",
        answer: "Evet, bankaların açıkladığı faiz oranları daima 'yıllık brüt' faiz oranını ifade eder. Vade 32 gün bile olsa, oran bir yıla tekabül edecek şekilde açıklanır ve süreye orantılanarak hesaplanır."
      },
      {
        question: "Stopaj oranı (vergi kesintisi) kime ödenir?",
        answer: "Stopaj vergisini banka sizin adınıza faiz getirisinin kaynağında keserek doğrudan devlete (Maliye'ye) öder. Sizin ek bir vergi beyannamesi doldurmanıza gerek yoktur."
      },
      {
        question: "Bileşik faiz vadeli hesaplarda çalışır mı?",
        answer: "Standart vadeli mevduat hesapları dönem sonunda faiz öder. Eğer vade bitiminde elde ettiğiniz anapara + net faiz toplamını tekrar yeni bir vadeye bağlarsanız (temdit ederseniz), paranız bileşik faiz mantığıyla büyümeye başlar."
      }
    ],
    content: {
      intro: "Vadeli mevduat mantığı, stopaj (vergi) kesintileri ve net getiri hesaplaması hakkında bilmeniz gerekenler",

      sections: [
        {
          title: "Vadeli Mevduat Hesabı Nedir?",
          paragraphs: [
            "Vadeli mevduat, birikimlerinizi belirli bir süre (vade) boyunca bankada tutma sözü vererek karşılığında sabit veya değişken oranlı faiz getirisi elde ettiğiniz güvenli bir yatırım aracıdır.",
            "Vade süresi dolmadan (vade kırımı) paranızı çekmek isterseniz, genellikle o döneme ait faiz getirisini kaybedersiniz."
          ]
        },
        {
          title: "Brüt Faiz ile Net Getiri Arasındaki Fark",
          paragraphs: [
            "Bankaların ilan ettiği mevduat faiz oranları her zaman 'Brüt' yani vergi kesintisi öncesi yillik oranlardır.",
            "Elde edilen brüt faiz tutarı üzerinden devlet tarafından Gelir Vergisi (Stopaj) kesilir. Kalan tutar ise hesabınıza yansıyacak olan 'Net Getiri'dir. Hesaplama aracımız bu brüt ve net ayrımını otomatik yaparak elinize geçecek gerçek tutarı gösterir."
          ]
        },
        {
          title: "Stopaj Oranları ve Vade İlişkisi",
          paragraphs: [
            "Stopaj (vergi) oranları devlet tarafından belirlenir ve genellikle birikimleri daha uzun süre sistemde tutmayı teşvik etmek amacıyla vade uzadıkça oran düşecek şekilde kademelendirilir (Örn: 6 aya kadar farklı, 1 yıldan uzun vadelere farklı vergi oranı uygulanabilir).",
            "Kural değişiklikleri yasal mevzuatla anlık güncellenebileceği için hesaplamalarda güncel stopaj oranının doğru girildiğinden emin olunmalıdır."
          ]
        },
      ],
      example: {
        title: "Net Getiri Örneği",
        text: "100.000 TL anaparayı, yıllık %40 faiz oranıyla 32 günlük vadeye bağladığınızı düşünelim. Brüt faiz getiriniz yaklaşık 3.506 TL olacaktır. Ancak bu tutar üzerinden örneğin %7,5 oranında stopaj (vergi) kesilirse, bu kesinti (263 TL) düşüldükten sonra net kazancınız yaklaşık 3.243 TL olur."
      },
      sources: [
        {
          name: "TCMB - Mevduat ve Kredi Faiz Oranları",
          url: "https://www.tcmb.gov.tr/"
        },
        {
          name: "Gelir İdaresi Başkanlığı (GİB) - Stopaj Oranları",
          url: "https://www.gib.gov.tr/"
        }
      ]
    },

    relatedCalculators: ["faiz","bilesik-faiz-hesaplama","repo"]
  },
  fields: [
  {
    "id": "principal",
    "label": "Anapara (TL)",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "interestRate",
    "label": "Yıllık Faiz Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  },
  {
    "id": "maturityType",
    "label": "Vade Birimi",
    "type": "select",
    "required": true,
    "options": [
      {
        "label": "Gün",
        "value": "days"
      },
      {
        "label": "Ay",
        "value": "months"
      }
    ]
  },
  {
    "id": "maturity",
    "label": "Vade Süresi",
    "type": "number",
    "required": true,
    "min": 1
  },
  {
    "id": "taxRate",
    "label": "Stopaj Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "max": 100,
    "step": 0.01,
    "defaultValue": 15
  }
],
  schema,
  calculate: (input) => {
    return calculateTimeDeposit(input.principal, input.interestRate, input.maturityType, input.maturity, input.taxRate);
  }
};

