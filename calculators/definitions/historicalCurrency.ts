import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateHistoricalCurrency } from '../formulas/historicalCurrency';

const schema = z.object({
  amount: z.number().min(0, 'Tutar negatif olamaz'),
  currency: z.string(),
  rateType: z.string(),
  date: z.string()
});

type Input = z.infer<typeof schema>;

export const historicalCurrencyCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_historicalCurrency_001',
  slug: 'gecmis-doviz-kurlari',
  status: 'published',
  name: 'Geçmiş Döviz Kurları Hesaplama',
  shortDescription: 'Belirli bir tarihteki döviz kurlarını kullanarak geçmiş tutarların TL karşılığını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Geçmiş Döviz Kurları Hesaplama Aracı | Hesapera',
    description: 'Belirli bir tarihteki döviz kurlarını kullanarak geçmiş tutarların TL karşılığını hesaplayın.',
    keywords: ["geçmiş döviz kurları","tarihsel kur çeviri","eski dolar kuru","eski euro kuru"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/gecmis-doviz-kurlari',
    faq: [
      {
        question: "Kur Tipi seçeneklerinden hangisini seçmeliyim?",
        answer: "Sadece hesaptaki (dijital) parayla işlem yapıyorsanız 'Döviz', elden (banknot) nakit döviz bozduruyorsanız 'Efektif' kurlar kullanılır. İşlemin yönüne göre (TL alacaksanız Alış, Döviz alacaksanız Satış) tercih yapmalısınız."
      },
      {
        question: "Sonuç ekranında neden bir önceki günün tarihi yazıyor?",
        answer: "TCMB, günlük kurları her iş günü saat 15:30'da belirler ve bu kurlar genellikle bir sonraki günün işlemleri için 'Resmî Gösterge Kuru' olarak kabul edilir. Tatil günleri seçildiğinde ise algoritma verinin son güncellendiği tarihi gösterir."
      }
    ],
    content: {
      intro: "TCMB veritabanından çekilen gösterge döviz kurları ile geçmiş tarihlere ait kur çevirimi ve analizi",

      sections: [
        {
          title: "Geçmiş Döviz Kur Hesaplaması",
          paragraphs: [
            "Bu araç, belirtilen geçmiş bir tarihte (örneğin 10 yıl önceki bir günde) elinizdeki belirli bir miktarın Türk Lirası karşılığını veya ilgili döviz tutarını hesaplamanıza yardımcı olur.",
            "Türkiye Cumhuriyet Merkez Bankası (TCMB) EVDS altyapısından alınan resmî gösterge kurları temel alınır. Hesaplamada 'Döviz Alış', 'Döviz Satış', 'Efektif Alış' (nakit döviz alış) ve 'Efektif Satış' gibi resmi kur tipleri arasından seçim yapabilirsiniz."
          ]
        },
        {
          title: "Resmî Tatiller ve Hafta Sonları (Veri Akışı)",
          paragraphs: [
            "TCMB, döviz kurlarını hafta içi iş günlerinde açıklar. Hafta sonu (Cumartesi-Pazar) veya resmî tatillere denk gelen bir tarih seçtiğinizde o güne ait taze bir kur verisi bulunmaz.",
            "Araç, bu gibi durumlarda otomatik olarak geriye doğru tarama yapar (örneğin Pazar günü için Cuma gününün kurunu bulur) ve hesabı o gün üzerinden tamamlayarak sonucu size 'En yakın önceki iş günü baz alınmıştır' uyarısıyla sunar."
          ]
        },
        {
          title: "TCMB ve Serbest Piyasa Ayrımı",
          paragraphs: [
            "TCMB kurları, bankalara ve resmî kurumlara gösterge (referans) niteliğindedir. Yani 'Döviz Bürosu (Serbest Piyasa)' veya kendi banka uygulamanızdaki o tarihteki işlem kurları TCMB değerlerinden biraz daha farklı (genellikle daha yüksek bir makas aralığıyla) gerçekleşmiş olabilir."
          ]
        },
      ],
      example: {
        title: "Evrak ve İthalat Hesaplaması",
        text: "Eğer şirket muhasebeniz, geçmiş bir tarihteki (örneğin 15 Mayıs) gümrük işlemi için 10.000 Dolar'ın o günkü resmî TL karşılığını istiyorsa, araca ilgili tarihi ve tutarı girersiniz. Araç TCMB arşivinden 15 Mayıs Döviz Alış kurunu bularak tutarla çarpar ve resmî evraklara girebilecek referans TL tutarını size verir."
      },
      sources: [
        {
          name: "TCMB - Kurlar",
          url: "https://www.tcmb.gov.tr/kurlar/kurlar_tr.html"
        },
        {
          name: "TCMB - EVDS (Elektronik Veri Dağıtım Sistemi)",
          url: "https://evds2.tcmb.gov.tr/"
        }
      ]
    },

    relatedCalculators: ["doviz","gecmis-altin-fiyatlari","enflasyon"]
  },
  fields: [
    {
      id: "amount",
      label: "Döviz Tutarı",
      type: "number",
      required: true,
      min: 0,
      step: 0.01
    },
    {
      id: "currency",
      label: "Para Birimi",
      type: "select",
      required: true,
      options: [
        { label: "Amerikan Doları (USD)", value: "USD" },
        { label: "Euro (EUR)", value: "EUR" },
        { label: "İngiliz Sterlini (GBP)", value: "GBP" }
      ]
    },
    {
      id: "rateType",
      label: "Kur Tipi",
      type: "select",
      required: true,
      options: [
        { label: "Döviz Alış", value: "forexBuying" },
        { label: "Döviz Satış", value: "forexSelling" },
        { label: "Efektif Alış", value: "banknoteBuying" },
        { label: "Efektif Satış", value: "banknoteSelling" }
      ]
    },
    {
      id: "date",
      label: "Tarih",
      type: "date",
      required: true
    }
  ],
  schema,
  calculate: async (input) => {
    return await calculateHistoricalCurrency(input.amount, input.currency, input.rateType, input.date);
  }
};
