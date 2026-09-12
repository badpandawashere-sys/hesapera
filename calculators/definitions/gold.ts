import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateGold } from '../formulas/gold';
import { marketDataService } from '../../lib/market-data/market-data-service';

const schema = z.object({
  transactionType: z.string(),
  instrumentType: z.string(),
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

export const goldCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_gold_001',
  slug: 'altin',
  status: 'published',
  name: 'Altın Hesaplama',
  shortDescription: 'Canlı altın fiyatları üzerinden elinizdeki altının değerini veya paranızla ne kadar altın alabileceğinizi hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Canlı Altın Hesaplama | Hesapera',
    description: 'Güncel altın alış ve satış kurları üzerinden elinizdeki altının toplam değerini ya da paranızla ne kadar altın alabileceğinizi anında hesaplayın.',
    keywords: ["altın hesaplama", "çeyrek altın", "gram altın hesapla", "canlı altın"],
    canonical: 'https://hesapera.com.tr/hesaplama/altin',
    icon: 'Coins',
    faq: [
      {
        question: "Altın hesaplama aracındaki fiyatlar güncel mi?",
        answer: "Evet, hesaplama aracımız piyasalardaki canlı (anlık) altın fiyatları (alış ve satış kurları) üzerinden işlem yapmaktadır."
      },
      {
        question: "Altın bozdururken hangi fiyat (alış mı, satış mı) geçerlidir?",
        answer: "Elinizdeki fiziki altını bozdururken veya bankadaki altınınızı TL'ye çevirirken her zaman 'Alış' fiyatı geçerlidir. Satış fiyatı, kuyumcunun veya bankanın size altını sattığı (sizin altın aldığınız) fiyattır."
      },
      {
        question: "Çeyrek altın kaç gramdır?",
        answer: "Standart bir çeyrek altın 1.75 gram ağırlığında ve 22 ayar (0.916) saflığındadır. İçerisindeki saf altın miktarı ise 1.6065 gramdır."
      },
      {
        question: "Ata Altın ile Tam (Ziynet) Altın aynı şey mi?",
        answer: "Hayır. Her ikisi de 22 ayardır ancak ağırlıkları farklıdır. Tam (Ziynet) altın 7.01 gram ağırlığındayken, Ata (Cumhuriyet) altını 7.21 gram ağırlığındadır. Bu nedenle Ata altını daha değerlidir."
      },
      {
        question: "24 ayar ile 22 ayar altın arasındaki fark nedir?",
        answer: "Ayar, altının saflık derecesini belirtir. 24 ayar altın içerisinde hiç yabancı metal barındırmayan saf altına (0.995 - 0.999) denir. 22 ayar altın ise %91.6 oranında saf altın içerirken geri kalanı dayanıklılık için bakır/gümüş karışımıdır."
      },
      {
        question: "Banka makas aralığı neden hafta sonları açılır?",
        answer: "Hafta sonları ve mesai saatleri dışında uluslararası piyasalar kapalı olduğundan, bankalar kur riskinden korunmak amacıyla alış ve satış fiyatları arasındaki makas aralığını genişletirler."
      }
    ],
    features: [
      { label: 'Canlı Piyasa Fiyatları', icon: 'LineChart' },
      { label: 'Alış/Satış Kuru Ayrımı', icon: 'ArrowRightLeft' },
      { label: 'Gerçek Zamanlı Çeviri', icon: 'Clock' }
    ],
    infoBox: {
      title: 'Canlı Piyasa Verileri',
      text: 'Hesaplama, canlı piyasa alış ve satış kurları kullanılarak yapılır. Kuyumcuya göre oluşabilecek ek komisyon veya farklı fiyatlar hesaba dahil değildir. Veriler Türkiye piyasalarında güvenilir bir kaynak olan Truncgil üzerinden sağlanmaktadır.',
      icon: 'Info'
    },
    content: {
      intro: "Canlı altın hesaplama aracı, alış/satış kurları ve altın türleri hakkında bilinmesi gerekenler",

      sections: [
        {
          title: "Altın Hesaplama Nasıl Yapılır?",
          paragraphs: [
            "Altın hesaplama işlemi, elinizdeki altını bozdururken (satış yaparken) veya nakit paranızla altın alırken piyasadaki güncel alış ve satış fiyatları kullanılarak yapılır.",
            "Bozdurma işlemlerinde piyasanın 'Alış' fiyatı (kuyumcu veya bankanın sizden aldığı fiyat) geçerlidir. Altın alırken ise piyasanın 'Satış' fiyatı (kuyumcu veya bankanın size sattığı fiyat) baz alınır."
          ],
          bullets: [
            "Altından Paraya (Satış): Elinizdeki miktar (adet/gram) x Güncel Alış Fiyatı",
            "Paradan Altına (Alış): Nakit Tutarınız / Güncel Satış Fiyatı"
          ]
        },

        {
          title: "Altın Türleri ve Gramajları Nelerdir?",
          paragraphs: [
            "Halk arasında en çok bilinen ve yatırım amacıyla kullanılan altın türleri standart gramaj ve saflık derecelerine (ayar) sahiptir. Piyasada en çok işlem gören altın türlerinin özellikleri şunlardır:"
          ],
          bullets: [
            "Gram Altın: Genellikle 24 ayar (0.995 saflık) olarak üretilir. 1 gramdır.",
            "Çeyrek Altın: 22 ayar saflıktadır. Toplam ağırlığı 1.75 gram olup, içindeki saf altın miktarı 1.6065 gramdır.",
            "Yarım Altın: 22 ayar saflıktadır. 3.50 gramdır (Çeyreğin 2 katı).",
            "Tam (Ziynet) Altın: 22 ayar saflıktadır. 7.01 gram ağırlığındadır.",
            "Ata (Cumhuriyet) Altını: 22 ayar saflıktadır ancak standart tam altından daha ağırdır. 7.21 gram ağırlığındadır."
          ]
        },

        {
          title: "Alış ve Satış Arasındaki Makas Farkı (Spread)",
          paragraphs: [
            "Piyasalarda altının alış fiyatı ile satış fiyatı arasında daima bir fark bulunur. Bu farka 'makas' (spread) denir.",
            "Fiziki altın alım-satımında (kuyumcularda) makas aralığı genellikle Kapalıçarşı serbest piyasa koşullarına göre belirlenir. Bankalardaki altın hesaplarında (kaydi altın) ise mesai saatleri içinde makas daralırken, mesai saatleri dışında ve hafta sonlarında risk primi nedeniyle makas ciddi oranda açılabilir."
          ]
        },

        {
          title: "İşçilik Maliyeti Nedir?",
          paragraphs: [
            "Altın bilezik, kolye, küpe gibi takı amacıyla üretilmiş ziynet eşyalarında altın değerinin üzerine işçilik (üretim emeği) maliyeti eklenir.",
            "Yatırım amacıyla altın alırken genellikle 'işçiliksiz' veya işçilik maliyeti en düşük olan gram altın, külçe altın veya standart basım altınlar (çeyrek, yarım, tam) tercih edilmelidir. İşçilikli altınlar bozdurulurken işçilik bedeli düşüldüğü için değer kaybı daha yüksek olur."
          ]
        }
      ],

      example: {
        title: "Bozdurma ve Alım Örneği",
        text: "Elinizdeki 10 adet Çeyrek Altını bozdurmak (satmak) istediğinizi düşünelim. Eğer piyasada Çeyrek Altın Alış fiyatı 4.000 TL ise, elinize geçecek tutar 10 x 4.000 = 40.000 TL olacaktır. Aksine, 40.000 TL nakit paranızla Çeyrek Altın almak istediğinizde ve Satış fiyatı 4.150 TL ise, 40.000 / 4.150 = 9.63 adet (yani 9 adet tam çeyrek) alabilirsiniz."
      },

      sources: [
        {
          name: "Borsa İstanbul (BİST) - Kıymetli Madenler ve Kıymetli Taşlar Piyasası",
          url: "https://www.borsaistanbul.com/"
        },
        {
          name: "Darphane ve Damga Matbaası Genel Müdürlüğü",
          url: "https://www.darphane.gov.tr/"
        }
      ]
    },

    relatedCalculators: ["doviz", "ihtiyac-kredisi"]
  },
  fields: [
    {
      id: "instrumentType",
      label: "Altın Türü",
      type: "select",
      required: true,
      options: [
        { label: "Gram Altın", value: "Gram Altın" },
        { label: "Çeyrek Altın", value: "Çeyrek Altın" },
        { label: "Yarım Altın", value: "Yarım Altın" },
        { label: "Tam / Ziynet Altın", value: "Tam Altın" },
        { label: "Ata Cumhuriyet Altını", value: "Ata Altın" },
        { label: "Gremse Altın", value: "Gremse Altın" },
        { label: "Gümüş", value: "Gümüş" }
      ]
    },
    {
      id: "transactionType",
      label: "İşlem Yönü",
      type: "select",
      required: true,
      options: [
        {
          label: "Altından Paraya (Satış Yapıyorum)",
          value: "to_cash"
        },
        {
          label: "Paradan Altına (Alış Yapıyorum)",
          value: "to_gold"
        }
      ]
    },
    {
      id: "quantity",
      label: "Miktar (Adet/Gram)",
      type: "number",
      required: true,
      min: 0,
      step: 0.01,
      conditions: [
        {
          fieldId: "transactionType",
          operator: "equals",
          value: "to_cash"
        }
      ]
    },
    {
      id: "cashAmount",
      label: "Para Tutarı (TL)",
      type: "currency",
      required: true,
      min: 0,
      conditions: [
        {
          fieldId: "transactionType",
          operator: "equals",
          value: "to_gold"
        }
      ]
    }
  ],
  schema,
  calculate: async (input) => {
    // 1. Canlı veriyi çek
    const quote = await marketDataService.getGoldQuote(input.instrumentType);
    
    // 2. İşlem yönüne göre uygun fiyatı (alış/satış) belirle ve formüle aktar
    return calculateGold(
      input.transactionType, 
      input.instrumentType, 
      input.quantity, 
      input.cashAmount,
      quote
    );
  }
};


