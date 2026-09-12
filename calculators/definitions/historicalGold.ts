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
  shortDescription: 'Belirli bir tarihteki altın fiyatı verisini kullanarak geçmiş tarihli bir altın değer hesabı yapın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Geçmiş Altın Fiyatları Hesaplama Aracı | Hesapera',
    description: 'Belirli bir tarihteki altın fiyatı verisini kullanarak geçmiş tarihli bir altın değer hesabı yapın.',
    keywords: ["geçmiş altın fiyatları","tarihsel altın hesaplama","eski altın fiyatı"],
    canonical: 'https://hesapera.com.tr/hesaplama/gecmis-altin-fiyatlari',
    faq: [
      {
        question: "Araçtaki fiyat neden Merkez Bankası veya başka bir sitedeki geçmiş fiyatla uymuyor?",
        answer: "Altın fiyatları (TCMB gösterge kurları hariç) serbest piyasada anlık değişir. Sistemimizde gösterilen rakamlar referans amaçlıdır ve bir yatırım tavsiyesi, kapalıçarşı spot fiyat garantisi veya mutlak resmî kur değildir."
      },
      {
        question: "Eski fiyatlara bakıp geleceğe dönük yatırım kararı alabilir miyim?",
        answer: "Geçmiş fiyat hareketleri gelecekteki performansın garantisi olamaz. Gösterilen veriler yalnız tarihsel simülasyon ve bilgilendirme (matematik test) amaçlıdır."
      }
    ],
    content: {
      intro: "Belirli bir geçmiş tarihteki altın kurları üzerinden alım/satım işlemlerinin referans hesaplaması",

      sections: [
        {
          title: "Geçmiş Altın Fiyatı Hesaplaması",
          paragraphs: [
            "Geçmiş altın fiyatları aracı; Gram Altın, Çeyrek Altın, Cumhuriyet veya Ons Altın gibi emtiaların geçmişteki belirli bir tarihte sahip olduğu varsayılan piyasa fiyatını kullanarak ne kadar altın alabileceğinizi veya satabileceğinizi hesaplar.",
            "Alış fiyatı, kuyumcunun/bankanın altını sizden aldığı fiyatı; Satış fiyatı ise kuyumcunun/bankanın size sattığı fiyatı temsil eder."
          ]
        },
        {
          title: "Veri Kaynakları ve Demo Sınırları",
          paragraphs: [
            "ÇOK ÖNEMLİ: Aracımızdaki fiyatlar, size altın hesaplamasının mantığını ve sonuç ekranındaki 'Kullanılan Fiyat (Alış/Satış)' dökümünü göstermek amacıyla tamamen statik bir referans veya demo (mock) veri altyapısı üzerinden çalışmaktadır.",
            "Gördüğünüz geçmiş fiyatlar, tüm kuyumcularda ve borsada işlem görmüş mutlak ve kesin 'canlı/resmî piyasa verisini' garanti etmez. Farklı yıllar veya günler için listelenen sonuçlar sadece finansal hesaplama motorunun örneklenmesidir."
          ]
        },
        {
          title: "Altın Türlerinin Ayrımı",
          paragraphs: [
            "Her bir altın türünün saflık ve ağırlık standardı farklıdır. Gram altın (genellikle 24 ayar), yatırımcıların en çok kullandığı ve geçmiş verisi en sık takip edilen türdür. Çeyrek ve Ata altın ise 22 ayar standartlarındadır ve işçilik maliyetlerini de (makas farkı) barındırır."
          ]
        },
      ],
      example: {
        title: "Tarihsel Bozdurma Örneği",
        text: "Eğer sisteme belirli bir tarih ve miktar (örneğin 10 adet Gram Altın) girerseniz, araç önce o günün veritabanındaki tahmini/örnek alış fiyatını çeker. Çıkan değer, o dönem elinizdeki altını bozdurduğunuzda cebinize geçecek tahmini Türk Lirası miktarını ifade eder."
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
        "label": "Altından Paraya (Miktardan Tutara)",
        "value": "to_cash"
      },
      {
        "label": "Paradan Altına (Tutardan Miktara)",
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
    return calculateHistoricalGold(input.transactionType, input.instrumentId, input.date, input.quantity, input.cashAmount);
  }
};

