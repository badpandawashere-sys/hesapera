import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateVolume } from '../formulas/volume';

const sekilEnum = z.enum(['Küp', 'Dikdörtgenler Prizması', 'Küre', 'Silindir', 'Koni']);

const schema = z.object({
  sekil: sekilEnum.default('Dikdörtgenler Prizması'),
  birim: z.enum(['m', 'cm']).default('m'),
  kenarA: z.number().positive("Pozitif değer olmalıdır.").finite("Geçersiz (Infinity)").refine(v => !isNaN(v), "Geçersiz (NaN)").optional(),
  kenarB: z.number().positive("Pozitif değer olmalıdır.").finite("Geçersiz (Infinity)").refine(v => !isNaN(v), "Geçersiz (NaN)").optional(),
  kenarC: z.number().positive("Pozitif değer olmalıdır.").finite("Geçersiz (Infinity)").refine(v => !isNaN(v), "Geçersiz (NaN)").optional(),
  yaricap: z.number().positive("Pozitif değer olmalıdır.").finite("Geçersiz (Infinity)").refine(v => !isNaN(v), "Geçersiz (NaN)").optional(),
  yukseklik: z.number().positive("Pozitif değer olmalıdır.").finite("Geçersiz (Infinity)").refine(v => !isNaN(v), "Geçersiz (NaN)").optional()
}).superRefine((data, ctx) => {
  const req = (val: number | undefined, path: string) => {
    if (val === undefined || val <= 0 || isNaN(val) || !isFinite(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bu şekil için zorunlu ve geçerli bir değer olmalıdır.", path: [path] });
    }
  };
  switch (data.sekil) {
    case 'Küp': 
      req(data.kenarA, 'kenarA'); 
      break;
    case 'Dikdörtgenler Prizması': 
      req(data.kenarA, 'kenarA'); req(data.kenarB, 'kenarB'); req(data.kenarC, 'kenarC'); 
      break;
    case 'Küre': 
      req(data.yaricap, 'yaricap'); 
      break;
    case 'Silindir': 
      req(data.yaricap, 'yaricap'); req(data.yukseklik, 'yukseklik'); 
      break;
    case 'Koni': 
      req(data.yaricap, 'yaricap'); req(data.yukseklik, 'yukseklik'); 
      break;
  }
});

type Input = z.infer<typeof schema>;

export const volumeCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_volume_029',
  slug: 'hacim',
  status: 'published',
  name: 'Hacim Hesaplama',
  shortDescription: 'Küp, dikdörtgenler prizması, küre, silindir ve koni gibi geometrik cisimlerin hacmini pratik olarak hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Hacim Hesaplama Aracı | Hesapera',
    description: 'Farklı geometrik cisimlerin (Küp, Dikdörtgenler Prizması, Küre, Silindir, Koni) hacmini matematiksel formüllerle kolayca hesaplayın.',
    keywords: ["hacim hesaplama", "küp hacmi", "silindir hacmi", "küre hacmi", "koni hacmi", "prizma hacmi"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/hacim',
    faq: [
      {
        question: "Metreküp ile metrekare arasındaki fark nedir?",
        answer: "Metrekare (m²) iki boyutlu düz bir yüzeyin (örneğin halının kapladığı zemin) alanını verirken; metreküp (m³) üç boyutlu bir cismin (örneğin havuzun içine ne kadar su alacağı) boşluk kapasitesini ölçer."
      },
      {
        question: "Hesapladığım metreküp kaç litre suya eşittir?",
        answer: "1 metreküp (1 m³) hacim tam olarak 1.000 litre sıvıya (örneğin suya) eşdeğerdir. Aynı şekilde 1.000 santimetreküp (cm³) de 1 litre yapar."
      }
    ],
    content: {
      intro: "Geometrik cisimlerin hacim hesaplaması, metreküp (m³) kavramı ve günlük kullanım alanları hakkında rehber",

      sections: [
        {
          title: "Hacim Nedir?",
          paragraphs: [
            "Hacim, üç boyutlu (en, boy, yükseklik) bir cismin veya nesnenin uzayda kapladığı boşluğun (alanın) ölçüsüdür. Standart birimi genellikle metreküp (m³) veya santimetreküptür (cm³).",
            "Günlük hayatta bir su deposunun kaç litre kapasitesi olduğu, bir nakliye kolisinin kargo aracında ne kadar yer kaplayacağı veya bir odanın iklimlendirilmesi (klima) için ne kadar havanın soğutulması gerektiği doğrudan hacim formülleriyle hesaplanır."
          ]
        },
        {
          title: "Desteklenen Formüller",
          paragraphs: [
            "Hesaplayıcımız; Küp, Dikdörtgenler Prizması, Küre, Silindir ve Koni gibi temel 3D geometrik şekilleri destekler.",
            "Örneğin; eni, boyu ve yüksekliği farklı olan bir oda için 'Dikdörtgenler Prizması' seçilmeli ve 3 değer (uzunluk, genişlik, yükseklik) birbiriyle çarpılmalıdır. Tam yuvarlak bir depo için 'Küre', boru benzeri bir nesne için 'Silindir' hesaplaması (yarıçap ve yükseklik ile) kullanılır."
          ]
        },
        {
          title: "Birim Dönüşümleri ve Uyum",
          paragraphs: [
            "Matematiksel işlemin doğruluğu için girdiğiniz tüm kenar veya yarıçap değerlerinin aynı birimde (sadece metre veya sadece santimetre) olması şarttır.",
            "Eğer araca 'cm' olarak değer girerseniz, çıkan sonuç santimetreküp (cm³) olarak verilir. 1 Metreküp (m³) tam olarak 1.000.000 (bir milyon) santimetreküptür."
          ]
        },
      ],
      example: {
        title: "Koli Hacmi (Prizma) Örneği",
        text: "Kargoya vereceğiniz koli 50 cm boyunda, 40 cm eninde ve 30 cm yüksekliğinde olsun. Şekil olarak 'Dikdörtgenler Prizması'nı, birim olarak 'cm'yi seçersiniz. Sistem 50 x 40 x 30 formülünü çalıştırarak sonucun 60.000 cm³ olduğunu hesaplar. Eğer bu değerleri metre olarak girseydiniz (0.5 x 0.4 x 0.3), sonuç 0.06 m³ olarak çıkacaktı."
      }
    },

    relatedCalculators: ["alan", "cevre"]
  },
  fields: [
    {
      id: 'sekil',
      label: 'Geometrik Şekil',
      type: 'select',
      required: true,
      defaultValue: 'Dikdörtgenler Prizması',
      options: [
        { label: 'Dikdörtgenler Prizması', value: 'Dikdörtgenler Prizması' },
        { label: 'Küp', value: 'Küp' },
        { label: 'Silindir', value: 'Silindir' },
        { label: 'Küre', value: 'Küre' },
        { label: 'Koni', value: 'Koni' }
      ]
    },
    {
      id: 'birim',
      label: 'Birim',
      type: 'select',
      required: true,
      defaultValue: 'm',
      options: [
        { label: 'Metre (m)', value: 'm' },
        { label: 'Santimetre (cm)', value: 'cm' }
      ]
    },
    {
      id: 'kenarA',
      label: 'Uzunluk (a)',
      type: 'number',
      required: true,
      min: 0.01,
      step: 0.01,
      conditions: [
        { fieldId: 'sekil', operator: 'in', value: ['Küp', 'Dikdörtgenler Prizması'] }
      ]
    },
    {
      id: 'kenarB',
      label: 'Genişlik (b)',
      type: 'number',
      required: true,
      min: 0.01,
      step: 0.01,
      conditions: [
        { fieldId: 'sekil', operator: 'equals', value: 'Dikdörtgenler Prizması' }
      ]
    },
    {
      id: 'kenarC',
      label: 'Yükseklik (c)',
      type: 'number',
      required: true,
      min: 0.01,
      step: 0.01,
      conditions: [
        { fieldId: 'sekil', operator: 'equals', value: 'Dikdörtgenler Prizması' }
      ]
    },
    {
      id: 'yaricap',
      label: 'Yarıçap (r)',
      type: 'number',
      required: true,
      min: 0.01,
      step: 0.01,
      conditions: [
        { fieldId: 'sekil', operator: 'in', value: ['Küre', 'Silindir', 'Koni'] }
      ]
    },
    {
      id: 'yukseklik',
      label: 'Yükseklik (h)',
      type: 'number',
      required: true,
      min: 0.01,
      step: 0.01,
      conditions: [
        { fieldId: 'sekil', operator: 'in', value: ['Silindir', 'Koni'] }
      ]
    }
  ],
  schema,
  calculate: (input) => {
    return calculateVolume(input);
  }
};

