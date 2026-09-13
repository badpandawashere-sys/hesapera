import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCurrency } from '../formulas/currency';
import { marketDataService } from '../../lib/market-data/market-data-service';

const schema = z.object({
  transactionType: z.string(),
  currencyCode: z.string(),
  quantity: z.number().min(0, 'Negatif miktar olamaz').optional().default(0),
  cashAmount: z.number().min(0, 'Negatif tutar olamaz').optional().default(0)
}).superRefine((data, ctx) => {
  if (data.transactionType === 'to_try' && data.quantity <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Miktar 0 dan büyük olmalıdır', path: ['quantity'] });
  }
  if (data.transactionType === 'to_currency' && data.cashAmount <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tutar 0 dan büyük olmalıdır', path: ['cashAmount'] });
  }
});

type Input = z.infer<typeof schema>;

export const currencyCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_currency_001',
  slug: 'doviz',
  status: 'published',
  name: 'Döviz Hesaplama',
  shortDescription: 'Canlı döviz kurları ile farklı para birimleri arasında değer çevrimi yapın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Canlı Döviz Kuru Hesaplama ve Çevirici | Hesapera',
    description: 'Güncel Amerikan Doları, Euro, Sterlin ve diğer para birimlerinin kurlarını takip ederek anında TL çevrimi yapın.',
    keywords: ["döviz hesaplama", "dolar hesapla", "euro hesapla", "kur çevirici", "canlı döviz"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/doviz',
    icon: 'Banknote',
    faq: [
      {
        question: "Döviz bozdururken hangi kur geçerlidir?",
        answer: "Elinizdeki yabancı parayı (Dolar, Euro vb.) Türk Lirasına çevirirken her zaman finans kuruluşunun belirlediği 'Alış' kuru geçerlidir."
      },
      {
        question: "Döviz hesaplama aracındaki kurlar kesin mi?",
        answer: "Araçtaki veriler piyasa referans kurlarını baz alır. Bankalar, döviz büroları veya uluslararası platformlar anlık piyasa hareketlerine, kendi komisyonlarına ve vergilere göre farklı kurlar uygulayabilir. Gerçek işlem kuru, işlemi yaptığınız kurum tarafından belirlenir."
      },
      {
        question: "Hafta sonu neden kurlar daha yüksek/düşük görünüyor?",
        answer: "Hafta sonları ve resmi tatillerde uluslararası döviz piyasaları kapalı olduğu için finans kuruluşları oluşabilecek ani kur dalgalanmalarına karşı risk almamak adına alış ve satış fiyatları arasındaki makası (spread) genişletirler."
      },
      {
        question: "Döviz alırken vergi kesiliyor mu?",
        answer: "Evet, Türkiye'de Türk Lirası verilerek yapılan yabancı para (kambiyo) alım işlemlerinde ilgili yasal mevzuat uyarınca belirli bir oranda Kambiyo Vergisi (BSMV) tahsil edilmektedir."
      },
      {
        question: "Çapraz kur hesaplaması nasıl yapılır?",
        answer: "Çapraz kur, iki farklı dövizin referans para birimi (genellikle USD) karşısındaki değerlerinin birbirine oranlanmasıyla bulunur."
      }
    ],
    features: [
      { label: 'Canlı Döviz Kurları', icon: 'LineChart' },
      { label: 'Alış/Satış Farkı Hesaplama', icon: 'ArrowRightLeft' },
      { label: 'Güncel Veriler', icon: 'Clock' }
    ],
    infoBox: {
      title: 'Döviz Piyasası Verileri',
      text: 'Serbest piyasa güncel kurları üzerinden matematiksel dönüşüm yapılır. Banka komisyonları ve anlık makas farkları değişiklik gösterebilir.',
      icon: 'Info'
    },
    content: {
      intro: "Canlı döviz kurları, döviz çeviri işlemleri ve piyasa terimleri hakkında bilmeniz gerekenler",

      sections: [
        {
          title: "Döviz Hesaplama Nasıl Yapılır?",
          paragraphs: [
            "Döviz hesaplama (çeviri) işlemi, piyasadaki güncel alış ve satış kurları kullanılarak bir para biriminin diğer para birimi (genellikle Türk Lirası) karşısındaki değerinin bulunmasıdır.",
            "Tıpkı altın piyasasında olduğu gibi döviz piyasasında da çift yönlü fiyatlama vardır. Elinizdeki yabancı parayı bozdururken piyasanın 'Alış' kuru; Türk Lirası verip yabancı para alırken ise piyasanın 'Satış' kuru geçerlidir."
          ],
          bullets: [
            "Döviz Bozma (Alış Kuru): Döviz Miktarı x Güncel Alış Kuru",
            "Döviz Alma (Satış Kuru): TL Tutarınız / Güncel Satış Kuru"
          ]
        },

        {
          title: "Alış ve Satış Arasındaki Makas Farkı (Spread)",
          paragraphs: [
            "Döviz kurlarındaki alış fiyatı ile satış fiyatı arasındaki farka 'makas' (spread) adı verilir. Bu fark, işlemi gerçekleştiren finansal kuruluşun (banka veya döviz bürosu) işlem maliyeti, kar marjı ve kur riskine karşı aldığı bir önlemdir.",
            "Banka veya döviz bürolarının uyguladıkları kurlar; serbest piyasa likiditesi, gün içi fiyat dalgalanmaları ve kendi fiyatlama politikalarına göre farklılık gösterebilir. Özellikle uluslararası piyasaların kapalı olduğu saatlerde veya hafta sonlarında, risk priminin artması nedeniyle makas aralığının ciddi şekilde genişlediği görülebilir."
          ]
        },

        {
          title: "Döviz Alım-Satım Vergisi (BSMV)",
          paragraphs: [
            "Türkiye'de döviz alım işlemlerinde (TL verilip döviz alınması) yasal olarak Banka ve Sigorta Muameleleri Vergisi (BSMV) veya Kambiyo Vergisi uygulanabilmektedir.",
            "Mevzuatta yapılan değişikliklere göre güncellenen bu vergi oranı, doğrudan alım maliyetinize eklenir. Dolayısıyla hesaplanan döviz miktarınız ile banka ekranınızda yansıyan nihai miktar arasında yasal vergi kesintilerinden kaynaklı küçük farklar olabilir."
          ]
        },

        {
          title: "Çapraz Kur Nedir?",
          paragraphs: [
            "Çapraz kur, iki farklı yabancı para biriminin kendi aralarındaki değişim oranını ifade eder. Örneğin, Euro (EUR) ile Amerikan Doları (USD) arasındaki parite (EUR/USD) bir çapraz kurdur.",
            "Doğrudan EUR satıp USD almak istediğinizde, işlem genellikle iki bacaklı (Önce EUR->TL, sonra TL->USD) yapılmak yerine doğrudan uluslararası çapraz kur oranı üzerinden hesaplanarak gerçekleştirilir."
          ]
        }
      ],

      example: {
        title: "Döviz Bozma ve Alım Örneği",
        text: "Elinizdeki 1.000 Amerikan Doları'nı (USD) bozdurmak istiyorsunuz. Bankanızın uyguladığı USD Alış kuru 34,00 TL ise, hesabınıza 34.000 TL geçer. Eğer elinizdeki 34.000 TL ile Euro (EUR) almak isterseniz ve bankanın EUR Satış kuru 38,00 TL ise, 34.000 / 38,00 formülü ile yaklaşık 894,73 Euro alabilirsiniz. İşlem anındaki makas farkları ve geçerli vergiler bu sonucu etkileyebilir."
      },

      sources: [
        {
          name: "TCMB - Türkiye Cumhuriyet Merkez Bankası (Kurlar)",
          url: "https://www.tcmb.gov.tr/"
        },
        {
          name: "Hazine ve Maliye Bakanlığı",
          url: "https://www.hmb.gov.tr/"
        }
      ]
    },

    relatedCalculators: ["altin", "ihtiyac-kredisi"]
  },
  fields: [
    {
      id: "currencyCode",
      label: "Döviz Türü",
      type: "select",
      required: true,
      options: [
        { label: "USD - Amerikan Doları", value: "USD" },
        { label: "EUR - Euro", value: "EUR" },
        { label: "GBP - İngiliz Sterlini", value: "GBP" },
        { label: "CHF - İsviçre Frangı", value: "CHF" },
        { label: "CAD - Kanada Doları", value: "CAD" },
        { label: "RUB - Rus Rublesi", value: "RUB" },
        { label: "AED - BAE Dirhemi", value: "AED" },
        { label: "AUD - Avustralya Doları", value: "AUD" },
        { label: "DKK - Danimarka Kronu", value: "DKK" },
        { label: "SEK - İsveç Kronu", value: "SEK" },
        { label: "NOK - Norveç Kronu", value: "NOK" },
        { label: "JPY - Japon Yeni", value: "JPY" },
        { label: "KWD - Kuveyt Dinarı", value: "KWD" },
        { label: "SAR - Suudi Arabistan Riyali", value: "SAR" },
        { label: "CNY - Çin Yuanı", value: "CNY" }
      ]
    },
    {
      id: "transactionType",
      label: "İşlem Yönü",
      type: "select",
      required: true,
      options: [
        {
          label: "Döviz → TL (Döviz Bozma)",
          value: "to_try"
        },
        {
          label: "TL → Döviz (Döviz Alma)",
          value: "to_currency"
        }
      ]
    },
    {
      id: "quantity",
      label: "Döviz Miktarı",
      type: "number",
      required: true,
      min: 0,
      step: 0.01,
      conditions: [
        {
          fieldId: "transactionType",
          operator: "equals",
          value: "to_try"
        }
      ]
    },
    {
      id: "cashAmount",
      label: "TL Tutarı",
      type: "currency",
      required: true,
      min: 0,
      conditions: [
        {
          fieldId: "transactionType",
          operator: "equals",
          value: "to_currency"
        }
      ]
    }
  ],
  schema,
  calculate: async (input) => {
    const quote = await marketDataService.getCurrencyQuote(input.currencyCode);
    return calculateCurrency(
      input.transactionType, 
      input.currencyCode, 
      input.quantity, 
      input.cashAmount,
      quote
    );
  }
};

