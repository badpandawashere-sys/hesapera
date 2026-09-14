import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateHistoricalGold } from '../formulas/historicalGold';

const schema = z.object({
  transactionType: z.string(),
  instrumentId: z.string(),
  date: z.string(),
  quantity: z.number().min(0, 'Negatif miktar olamaz').optional().default(0),
  cashAmount: z.number().min(0, 'Negatif tutar olamaz').optional().default(0)
}).superRefine((data, ctx) => {
  if (data.transactionType === 'to_cash' && data.quantity <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Miktar 0 dan büyük olmalıdır', path: ['quantity'] });
  }
  if (data.transactionType === 'to_gold' && data.cashAmount <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tutar 0 dan büyük olmalıdır', path: ['cashAmount'] });
  }
});

type Input = z.infer<typeof schema>;

export const historicalGoldCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_historicalGold_001',
  slug: 'gecmis-altin-fiyatlari',
  status: 'published',
  name: 'Geçmiş Altın Fiyatları Hesaplama',
  shortDescription: 'Belirli bir tarihteki altın fiyatı verisini kullanarak tarihsel bir altın/TL çevirimi yapın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Geçmiş Altın Fiyatları Hesaplama Aracı | Hesapera',
    description: 'Belirli bir tarihteki altın fiyatı verisini kullanarak tarihsel bir altın değer veya miktar hesabı yapın.',
    keywords: ["geçmiş altın fiyatları","tarihsel altın hesaplama","eski altın fiyatı"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/gecmis-altin-fiyatlari',
    faq: [
      {
        question: "Hesaplanan geçmiş altın fiyatları resmi kurumlarda geçerli midir?",
        answer: "Bu sayfada hesaplanan tutarlar tamamen bilgi ve referans amaçlıdır. Gösterge niteliğindeki serbest piyasa kapanışları veya ortalamalarını temel aldığından resmi kurumlarda hukuki veya finansal belge olarak kullanılamaz."
      },
      {
        question: "Hafta sonu veya resmi tatil tarihi girersem ne olur?",
        answer: "Altın piyasaları hafta sonları ve resmi tatillerde kapalıdır. Hafta sonu veya tatil gününe ait bir tarih seçerseniz, sistem o günden önceki en son mesai gününe ait (örneğin Cuma günkü) kapanış değerlerini baz alır."
      },
      {
        question: "Eski tarihli işlemde alış fiyatına mı, satış fiyatına mı bakmalıyım?",
        answer: "Eğer elinizdeki altını bozdurduğunuz (nakde çevirdiğiniz) durumu hesaplıyorsanız 'Alış' fiyatına, eğer o tarihte yeni bir altın aldığınızı hesaplıyorsanız 'Satış' fiyatına bakmalısınız."
      }
    ],
    content: {
      intro: "Belirli bir geçmiş tarihteki altın kurları üzerinden alım/satım işlemlerinin referans hesaplaması",
      sections: [
        {
          title: "Geçmiş Altın Fiyatları Hesaplama Nedir?",
          paragraphs: [
            "Bu araç, seçtiğiniz spesifik bir geçmiş tarihte altının gram veya ons değerinin Türk Lirası karşılığını bulmanızı sağlar. Geçmişte yaptığınız bir yatırımın maliyetini hesaplamak veya bozdurduğunuz altının o günkü karşılığını teyit etmek için kullanılır.",
            "Bugünkü anlık piyasa fiyatlarını öğrenmek ve güncel hesaplama yapmak isterseniz doğrudan [altın hesaplama](/hesaplama/altin) aracımızı kullanabilirsiniz."
          ]
        },
        {
          title: "Alış ve Satış Fiyatları Arasındaki Fark",
          paragraphs: [
            "Altın işlemlerinde her zaman iki farklı kur uygulanır. Hesabınızı yaparken; eğer cebinizdeki parayla altın alımını hesaplıyorsanız kuyumcunun veya bankanın size uygulayacağı 'Satış' kuru üzerinden işlem yapılır. Tam tersine yastık altındaki altınınızı TL'ye çevirdiğiniz senaryoda ise 'Alış' kuru geçerlidir."
          ]
        },
        {
          title: "Hafta Sonu ve Resmi Tatil Verileri",
          paragraphs: [
            "Piyasaların işlem görmediği hafta sonları ve resmi tatil günlerinde yeni bir fiyat oluşmaz. Aracımız, kapalı günlerde yapılan tarih sorgularında algoritma gereği en yakın geçmiş iş gününün (genellikle Cuma günü) kapanış fiyatını yansıtır."
          ]
        },
        {
          title: "Geçmiş ile Bugünün Karşılaştırılması",
          paragraphs: [
            "Tarihsel altın verileri yatırımlarınızın getiri oranını hesaplamada büyük önem taşır. Ancak elde edilen sonuçlar o günün koşullarındaki alım gücünü ifade eder.",
            "Sadece altın değil, aynı tarihteki eski dolar veya euro değerleri için [geçmiş döviz kurları hesaplama](/hesaplama/gecmis-doviz-kurlari) sayfasına da göz atabilirsiniz."
          ]
        }
      ],
      example: {
        title: "Tarihsel Bozdurma/Alım Örneği",
        text: "Eğer sisteme belirli bir tarih ve miktar (örneğin 100 Gram Altın) girerseniz, araç o günün tahmini alış ve satış fiyatını çeker. Çıkan değer, o dönem elinizdeki altını bozdurduğunuzda (Alışa Göre Değer) veya yeni altın aldığınızda (Satışa Göre Değer) oluşacak tahmini Türk Lirası veya altın miktarını ifade eder."
      }
    },
    relatedCalculators: ["altin","gecmis-doviz-kurlari","doviz"]
  },
  fields: [
    {
      "id": "transactionType",
      "label": "İşlem Türü",
      "type": "select",
      "required": true,
      "options": [
        {
          "label": "Altından Paraya",
          "value": "to_cash"
        },
        {
          "label": "Paradan Altına",
          "value": "to_gold"
        }
      ]
    },
    {
      "id": "instrumentId",
      "label": "Altın Türü",
      "type": "select",
      "required": true,
      "options": [
        {
          "label": "Gram Altın",
          "value": "gram"
        }
      ]
    },
    {
      "id": "date",
      "label": "Tarih",
      "type": "date",
      "required": true
    },
    {
      "id": "quantity",
      "label": "Altın Miktarı",
      "type": "number",
      "required": true,
      "min": 0,
      "step": 0.01,
      "conditions": [
        {
          "fieldId": "transactionType",
          "operator": "equals",
          "value": "to_cash"
        }
      ]
    },
    {
      "id": "cashAmount",
      "label": "Para Tutarı (TL)",
      "type": "currency",
      "required": true,
      "min": 0,
      "conditions": [
        {
          "fieldId": "transactionType",
          "operator": "equals",
          "value": "to_gold"
        }
      ]
    }
  ],
  schema,
  calculate: (input) => {
    return calculateHistoricalGold(
      input.transactionType, 
      input.instrumentId, 
      input.date, 
      input.quantity, 
      input.cashAmount
    );
  }
};
