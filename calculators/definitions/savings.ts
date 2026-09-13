import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateSavings } from '../formulas/savings';

const schema = z.object({
  initialDeposit: z.number().min(0, 'Başlangıç tutarı negatif olamaz'),
  periodicContribution: z.number().min(0, 'Aylık katkı negatif olamaz'),
  annualInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz'),
  termMonths: z.number().int().positive('Süre pozitif olmalıdır')
});

type Input = z.infer<typeof schema>;

export const savingsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_savings_001',
  slug: 'birikim',
  status: 'published',
  name: 'Birikim Hesaplama',
  shortDescription: 'Başlangıç sermayeniz ve düzenli aylık katkılarınızla, varsayımsal bir getiri oranı üzerinden gelecekteki birikiminizi hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Birikim Hesaplama Aracı | Hesapera',
    description: 'Başlangıç sermayeniz ve düzenli aylık katkılarınızla, varsayımsal bir getiri oranı üzerinden gelecekteki birikiminizi hesaplayın.',
    keywords: ["birikim hesaplama","düzenli yatırım","mevduat hesaplama","yatırım getirisi"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/birikim',
    faq: [
      {
        question: "Enflasyon birikimimi etkiler mi?",
        answer: "Evet, bu araç sadece paranın sayısal (nominal) büyümesini hesaplar. Gelecekteki birikiminizin gerçek alım gücü enflasyon oranından etkilenecektir."
      },
      {
        question: "Bileşik getiri tam olarak bu hesaplamaya dahil mi?",
        answer: "Evet, başlangıç tutarınız ve her dönem yatırdığınız katkı payları, yatırıldıkları andan itibaren vade sonuna kadar belirtilen oranda bileşik getiri üretir."
      }
    ],
    content: {
      intro: "Birikim hedefi oluşturma, düzenli katkı payları ve toplam yatırılan tutarın getiri ile büyümesi hakkında rehber",

      sections: [
        {
          title: "Birikim Hesabı Nedir?",
          paragraphs: [
            "Birikim hesabı; başlangıçta elinizde olan toplu bir paranın ve/veya düzenli olarak (aylık veya yıllık) sisteme eklediğiniz katkı paylarının, belirli bir getiri (faiz) oranıyla zamana yayılarak ne kadar büyüyeceğini gösteren bir projeksiyon aracıdır.",
            "Bu hesaplama, özellikle BES (Bireysel Emeklilik Sistemi), vadeli mevduat veya yatırım fonu gibi düzenli alım yaptığınız portföylerin gelecekteki değerini tahmin etmede kullanılır."
          ]
        },
        {
          title: "Düzenli Katkının Birikime Etkisi",
          paragraphs: [
            "Küçük ama düzenli yatırılan tutarlar (örneğin her ay yatırılan 1.000 TL), faiz veya getiri ile birleştiğinde 'Bileşik Getiri' etkisi yaratır. İlk aylarda yatırdığınız paralar, vadenin sonuna kadar sürekli getiri üreteceği için uzun vadede sadece kenara koyduğunuz anaparadan çok daha büyük bir toplama ulaşırsınız."
          ]
        },
        {
          title: "Matematiksel Mantık ve Yorumlama",
          paragraphs: [
            "Hesaplama aracı; Başlangıç Birikimini, Düzenli Yatırım tutarını ve girilen Faiz Oranını (belirtilen periyotlarda bileşerek) birleştirir. Sonuç ekranındaki 'Toplam Birikim', cebinizden çıkan net tutarı ve bu tutarların vade boyunca kazandırdığı toplam faizi tek bir kalemde sunar.",
            "Gerçek dünyada, elde edilen yatırım geliri üzerinden vergiler (stopaj) veya fon yönetim kesintileri uygulanabilir. Bu araç brüt, saf matematiksel büyüme üzerinden sonuç verir."
          ]
        },
      ],
      example: {
        title: "Düzenli Yatırımın Gücü",
        text: "Hiç başlangıç birikiminiz olmadığını, ancak her ay 2.000 TL kenara ayırıp aylık %3 oranında net getiri sağlayan bir fona yatırım yaptığınızı varsayalım. 5 yıl (60 ay) sonunda cebinizden toplam 120.000 TL çıkmış olur. Ancak aylık kazandığınız faizlerin de faiz üretmesiyle toplam birikiminiz çok daha yüksek bir meblağa (örn. 326.000 TL civarına) ulaşır. Bu aradaki devasa fark, zamanın ve düzenli katkının gücüdür."
      }
    },

    relatedCalculators: ["bilesik-buyume","altin"]
  },
  fields: [
  {
    "id": "initialDeposit",
    "label": "Başlangıç Birikimi (TL)",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "periodicContribution",
    "label": "Aylık Düzenli Katkı (TL)",
    "type": "currency",
    "required": true,
    "min": 0
  },
  {
    "id": "annualInterestRate",
    "label": "Beklenen Yıllık Getiri Oranı (%)",
    "type": "percentage",
    "required": true,
    "min": 0,
    "step": 0.01,
    "description": "Bankaların sunduğu faiz değil, sizin öngördüğünüz tahmini brüt getiri oranıdır."
  },
  {
    "id": "termMonths",
    "label": "Süre (Ay)",
    "type": "number",
    "required": true,
    "min": 1,
    "max": 1200
  }
],
  schema,
  calculate: (input) => {
    return calculateSavings(input.initialDeposit, input.periodicContribution, input.annualInterestRate, input.termMonths);
  }
};

