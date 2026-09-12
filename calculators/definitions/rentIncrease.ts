import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateRentIncrease } from '../formulas/rentIncrease';

const schema = z.object({
  currentRent: z.number().positive('Kira 0 dan büyük olmalıdır'),
  increaseRate: z.number().min(0, 'Oran negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const rentIncreaseCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_rentIncrease_001',
  slug: 'kira-artis-orani',
  status: 'published',
  name: 'Kira Artış Oranı Hesaplama',
  shortDescription: 'Eski kira bedeli ve artış oranından yeni kira bedelinizi hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kira Artış Oranı Hesaplama Aracı | Hesapera',
    description: 'Eski kira bedeli ve artış oranından yeni kira bedelinizi hesaplayın.',
    keywords: ["kira artışı","kira artış oranı","yeni kira","tefe tüfe kira artışı"],
    canonical: 'https://hesapera.com.tr/hesaplama/kira-artis-orani',
    faq: [
      {
        question: "Ev sahibi yasal oranın (TÜFE) üzerinde zam yapabilir mi?",
        answer: "Hayır. Yürürlükteki Borçlar Kanunu'na göre, sözleşme yenilemelerinde belirlenen yasal üst sınır (geçerli yasal düzenleme veya TÜFE 12 aylık ortalaması) aşılamaz."
      },
      {
        question: "Hesaplanan tutar kesin olarak ödenmesi gereken tutar mıdır?",
        answer: "Hesaplama aracı sadece seçtiğiniz orana göre tavan tutarı matematiksel olarak gösterir. Taraflar anlaşarak yasal sınırın daha altında bir zam oranı da belirleyebilirler."
      },
      {
        question: "Kira artış oranı ne zaman belli olur?",
        answer: "Kira artışında kullanılacak TÜFE oranı, TÜİK tarafından genellikle her ayın 3'ünde (tatil gününe denk gelirse takip eden ilk iş gününde) açıklanır."
      }
    ],
    content: {
      intro: "Kira artış oranı hesaplama, TÜFE sınırları ve yasal zam kuralları hakkında rehber",

      sections: [
        {
          title: "Kira Artış Oranı Nedir?",
          paragraphs: [
            "Kira artış oranı, mevcut kira sözleşmesinin yenilendiği dönemde (genellikle yılda bir kez) eski kira bedelinin üzerine eklenecek zammın yüzdesel ifadesidir.",
            "Türkiye'de Borçlar Kanunu kapsamında konut ve işyeri kiralarına yapılacak artışlar, belirli resmi endekslere ve yasal sınırlara tabidir."
          ]
        },
        {
          title: "Kira Zammı Hangi Kriterlere Göre Belirlenir?",
          paragraphs: [
            "Yasal mevzuata göre kira artış oranlarında tavan (üst sınır), kural olarak Türkiye İstatistik Kurumu (TÜİK) tarafından açıklanan TÜFE (Tüketici Fiyat Endeksi) '12 Aylık Ortalamalara Göre Değişim Oranı' baz alınarak belirlenir.",
            "Belirli dönemlerde (örneğin Temmuz 2022 - Temmuz 2024 arası konutlar için uygulanan %25 sınırı gibi) geçici kanunlarla sabit üst sınırlar getirilebilir. Bu tür geçici düzenlemelerin bulunmadığı durumlarda, TÜFE 12 aylık ortalaması yasal maksimum artış oranıdır."
          ]
        },
        {
          title: "Yeni Kira Nasıl Hesaplanır?",
          paragraphs: [
            "Yeni kira hesaplaması şu temel matematikle çalışır: Mevcut Kira Bedeli + (Mevcut Kira Bedeli x Zam Oranı).",
            "Hesaplama aracı girdiğiniz oran üzerinden direkt matematiksel sonucu verir; ev sahibi ve kiracı sözleşme kapsamında bu sınırların altında kalmak şartıyla farklı bir oranda da anlaşabilir."
          ]
        },
      ],
      example: {
        title: "TÜFE'ye Göre Kira Artış Örneği",
        text: "Mevcut kiranızın 10.000 TL olduğunu ve o ay açıklanan 12 aylık ortalama TÜFE oranının %60 olduğunu varsayalım. Ev sahibinin yapabileceği maksimum yasal zam 6.000 TL olacaktır. Yeni kira dönemi için ödenecek tavan tutar 16.000 TL olarak hesaplanır."
      },
      sources: [
        {
          name: "Türkiye İstatistik Kurumu (TÜİK)",
          url: "https://www.tuik.gov.tr/"
        },
        {
          name: "Türk Borçlar Kanunu (İlgili Maddeler)",
          url: "https://www.mevzuat.gov.tr/"
        }
      ]
    },

    relatedCalculators: ["yuzde-hesaplama","zam-hesaplama","enflasyon"]
  },
  fields: [
  {
    "id": "currentRent",
    "label": "Mevcut Kira Bedeli",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "increaseRate",
    "label": "Artış Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01
  }
],
  schema,
  calculate: (input) => {
    return calculateRentIncrease(input.currentRent, input.increaseRate);
  }
};

