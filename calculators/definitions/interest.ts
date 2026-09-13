import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateInterest } from '../formulas/interest';

const schema = z.object({
  calculationType: z.enum(['simple', 'compound']),
  principal: z.number()
    .positive('Ana para 0\'dan büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)'),
  annualRate: z.number()
    .min(0, 'Faiz oranı negatif olamaz')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)'),
  term: z.number()
    .positive('Süre 0\'dan büyük olmalıdır')
    .finite('Geçersiz değer (Infinity)')
    .refine(v => !isNaN(v), 'Geçersiz değer (NaN)'),
  termUnit: z.enum(['month', 'year']),
  compoundingFrequency: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.calculationType === 'compound') {
    if (!data.compoundingFrequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bileşik faiz için bileşikleşme sıklığı gereklidir.',
        path: ['compoundingFrequency']
      });
    } else {
      const freq = parseInt(data.compoundingFrequency, 10);
      if (![1, 2, 4, 12, 365].includes(freq)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Geçersiz bileşikleşme sıklığı.',
          path: ['compoundingFrequency']
        });
      }
    }
  }
});

type Input = z.infer<typeof schema>;

export const interestCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_interest_027',
  slug: 'faiz',
  status: 'published',
  name: 'Faiz Hesaplama',
  shortDescription: 'Ana para, faiz oranı ve süre ile basit veya bileşik faiz getirinizi genel olarak hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Faiz Hesaplama Aracı | Hesapera',
    description: 'Basit faiz ve bileşik faiz hesaplama aracı ile anapara, faiz oranı ve süreye göre getirinizi anında hesaplayın.',
    keywords: ["faiz hesaplama","basit faiz","bileşik faiz","ana para","faiz oranı","süre"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/faiz',
    faq: [
      {
        question: "Aylık faiz ile yıllık faiz aynı mıdır?",
        answer: "Hayır. Yıllık faiz, bir yılın sonundaki brüt getiri oranını ifade eder. Hesaplama yaparken vade aylık seçilirse, yıllık faiz oranı ilgili ay süresine orantılanarak (örneğin 12'ye bölünerek) işlem yapılır."
      },
      {
        question: "Hesaplanan faiz tutarı net midir?",
        answer: "Genel faiz formülü brüt getiriyi hesaplar. Vadeli hesap veya tahvil gibi gerçek dünya yatırımlarında, faiz geliri üzerinden devlet tarafından stopaj (gelir vergisi) kesintisi yapılır."
      }
    ],
    content: {
      intro: "Faiz hesaplama, basit ve bileşik faizin mantığı ve vade kavramları hakkında bilmeniz gerekenler",

      sections: [
        {
          title: "Faiz Nedir ve Nasıl Hesaplanır?",
          paragraphs: [
            "Faiz, bir miktar paranın belirli bir süre boyunca kullanılması karşılığında ödenen bedel veya elde edilen getiridir. Hesaplama temelde anapara, uygulanan faiz oranı ve vade (süre) parametrelerinin birbiriyle çarpılmasına dayanır.",
            "Araç üzerinden hem tek seferlik faiz kazancını gösteren 'Basit Faiz', hem de kazanılan faizin de tekrar faiz getirdiği 'Bileşik Faiz' hesaplaması yapılabilmektedir."
          ]
        },
        {
          title: "Basit Faiz ve Bileşik Faiz Arasındaki Fark",
          paragraphs: [
            "Basit faizde, vade boyunca elde edilen getiri sadece ilk yatırılan anapara üzerinden hesaplanır. Yani her dönem aynı tutarda faiz getirisi elde edilir.",
            "Bileşik faizde ise, belirli periyotlarla (örneğin aylık veya yıllık) elde edilen faiz kazancı anaparaya eklenir. Bir sonraki dönemin faizi, bu büyümüş yeni tutar üzerinden hesaplanır. Bu durum uzun vadede getirinin kar topu gibi büyümesini sağlar."
          ]
        },
      ],
      example: {
        title: "Basit ve Bileşik Faiz Örneği",
        text: "10.000 TL anaparayı, yıllık %20 faizle 2 yıllığına bankaya yatırdığınızı varsayalım. Basit faizle hesaplandığında her yıl 2.000 TL kazanır, vade sonunda toplam 14.000 TL elde edersiniz. Bileşik faizle (yıllık bileşme) yatırırsanız ilk yıl 2.000 TL kazanır, ikinci yıl ise 12.000 TL üzerinden faiz (2.400 TL) kazanarak toplamda 14.400 TL elde edersiniz."
      }
    },

    relatedCalculators: ["basit-faiz", "bilesik-faiz-hesaplama"]
  },
  fields: [
    {
      id: "calculationType",
      label: "İşlem Türü",
      type: "select",
      required: true,
      options: [
        { label: "Basit Faiz", value: "simple" },
        { label: "Bileşik Faiz", value: "compound" }
      ],
      defaultValue: "simple"
    },
    {
      id: "principal",
      label: "Ana Para (TL)",
      type: "currency",
      required: true,
      min: 1,
      placeholder: "100000"
    },
    {
      id: "annualRate",
      label: "Yıllık Faiz Oranı (%)",
      type: "percentage",
      required: true,
      min: 0,
      step: 0.01,
      placeholder: "20"
    },
    {
      id: "term",
      label: "Süre",
      type: "number",
      required: true,
      min: 1,
      placeholder: "12"
    },
    {
      id: "termUnit",
      label: "Süre Birimi",
      type: "select",
      required: true,
      options: [
        { label: "Ay", value: "month" },
        { label: "Yıl", value: "year" }
      ],
      defaultValue: "month"
    },
    {
      id: "compoundingFrequency",
      label: "Bileşikleşme Sıklığı",
      type: "select",
      options: [
        { label: "Yıllık (1)", value: "1" },
        { label: "6 Aylık (2)", value: "2" },
        { label: "3 Aylık (4)", value: "4" },
        { label: "Aylık (12)", value: "12" },
        { label: "Günlük (365)", value: "365" }
      ],
      conditions: [{
        fieldId: "calculationType",
        operator: "equals",
        value: "compound"
      }],
      defaultValue: "12"
    }
  ],
  schema,
  calculate: (input) => {
    return calculateInterest(
      input.calculationType,
      input.principal,
      input.annualRate,
      input.term,
      input.termUnit,
      input.compoundingFrequency
    );
  }
};

