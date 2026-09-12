import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateSimpleInterest } from '../formulas/simpleInterest';

const schema = z.object({
  principal: z.number().positive('Anapara 0 dan büyük olmalıdır'),
  annualRate: z.number().min(0, 'Oran negatif olamaz'),
  termYears: z.number().positive('Vade 0 dan büyük olmalıdır')
});

type Input = z.infer<typeof schema>;

export const simpleInterestCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_simpleInterest_001',
  slug: 'basit-faiz',
  status: 'published',
  name: 'Basit Faiz Hesaplama',
  shortDescription: 'Anapara, faiz oranı ve vade ile basit faiz getirisini hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Basit Faiz Hesaplama Aracı | Hesapera',
    description: 'Anapara, faiz oranı ve vade ile basit faiz getirisini hesaplayın.',
    keywords: ["basit faiz","faiz getirisi","kredi faizi"],
    canonical: 'https://hesapera.com.tr/hesaplama/basit-faiz',
    faq: [
      {
        question: "Araçtaki sonuçtan vergi düşülmüş müdür?",
        answer: "Hayır. Bu araç evrensel bir matematik aracıdır ve yalnızca brüt basit faizi hesaplar. Banka ürünleri için net getiri arıyorsanız 'Vadeli Mevduat Faizi' hesaplama aracımızı kullanabilirsiniz."
      },
      {
        question: "Kredi hesaplamaları basit faizle mi yapılır?",
        answer: "Genellikle hayır. Çoğu tüketici kredisinde kalan anapara üzerinden hesaplama yapan (azalan bakiyeli) taksitlendirme yöntemleri kullanılır. Basit faiz genellikle borçlar hukukundaki sabit gecikme tazminatlarında veya tek vadeli yatırımlarda kullanılır."
      }
    ],
    content: {
      intro: "Basit faiz formülü, anapara ve getiri ilişkisi hakkında rehber",

      sections: [
        {
          title: "Basit Faiz Nedir?",
          paragraphs: [
            "Basit faiz, hesaplanan vade süresi boyunca sadece yatırılan ilk anapara (başlangıç sermayesi) üzerinden faiz elde edildiği matematiksel yöntemdir.",
            "Bu yöntemde, her periyotta kazanılan faiz tutarı sabittir. Kazanılan faizler anaparaya eklenmez ve önceki dönemin getirisi bir sonraki dönemin getirisini artırmaz."
          ]
        },
        {
          title: "Basit Faiz Formülü Nasıl Çalışır?",
          paragraphs: [
            "Araçtaki hesaplamanın temel formülü şu şekildedir: Faiz Getirisi = Anapara x (Faiz Oranı / 100) x Süre (Vade).",
            "Eğer girdiğiniz süre aylık cinsinden ise (ve faiz oranınız yıllıksa), sistem formülde süreyi otomatik olarak 12'ye bölerek tek bir dönemin net kazancını bulur."
          ]
        },
        {
          title: "Gerçek Hayat ve Basit Faiz Ayrımı",
          paragraphs: [
            "Gündelik hayatta bankaların sunduğu 32 günlük vadeli mevduatlar gibi ürünlerde vade yenilenmediği takdirde basit faiz uygulanmış olur.",
            "Ancak bu hesaplayıcı tamamen vergisiz (brüt) matematiksel getiri sunar. Bankacılık işlemlerinde genellikle faiz gelirinin üzerinden stopaj (devlet vergisi) kesintisi uygulandığı unutulmamalıdır."
          ]
        },
      ],
      example: {
        title: "Basit Faiz Hesaplama Örneği",
        text: "100.000 TL anaparayı, yıllık %30 oranla basit faiz mantığıyla 2 yıl boyunca yatırdığınızı düşünelim. Anaparanız hiç değişmeyeceği için ilk yıl 30.000 TL, ikinci yıl da 30.000 TL kazanırsınız. 2 yılın sonunda (100.000 + 30.000 + 30.000) toplam 160.000 TL bakiyeniz olur."
      }
    },

    relatedCalculators: ["yuzde-hesaplama","bilesik-faiz-hesaplama"]
  },
  fields: [
  {
    "id": "principal",
    "label": "Anapara",
    "type": "currency",
    "required": true
  },
  {
    "id": "annualRate",
    "label": "Yıllık Faiz Oranı (%)",
    "type": "percentage",
    "required": true
  },
  {
    "id": "termYears",
    "label": "Vade (Yıl)",
    "type": "number",
    "required": true
  }
],
  schema,
  calculate: (input) => {
    return calculateSimpleInterest(
      input.principal, input.annualRate, input.termYears
    );
  }
};


