import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculatePerimeter } from '../formulas/perimeter';

const sekilEnum = z.enum(['Kare', 'Dikdörtgen', 'Üçgen', 'Paralelkenar', 'Yamuk', 'Daire']);
const birimEnum = z.enum(['cm', 'm', 'mm']);

const schema = z.object({
  sekil: sekilEnum.default('Dikdörtgen'),
  birim: birimEnum.default('cm'),
  kenarA: z.number().optional(),
  kenarB: z.number().optional(),
  kenarC: z.number().optional(),
  kenarD: z.number().optional(),
  yaricap: z.number().optional()
}).superRefine((data, ctx) => {
  const requireField = (val: number | undefined, path: string) => {
    if (val === undefined || isNaN(val) || val <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bu şekil için bu alan zorunludur ve 0'dan büyük olmalıdır.", path: [path] });
      return false;
    }
    return true;
  };

  if (data.sekil === 'Kare') {
    requireField(data.kenarA, 'kenarA');
  } else if (data.sekil === 'Dikdörtgen' || data.sekil === 'Paralelkenar') {
    requireField(data.kenarA, 'kenarA');
    requireField(data.kenarB, 'kenarB');
  } else if (data.sekil === 'Üçgen') {
    const aValid = requireField(data.kenarA, 'kenarA');
    const bValid = requireField(data.kenarB, 'kenarB');
    const cValid = requireField(data.kenarC, 'kenarC');

    if (aValid && bValid && cValid && data.kenarA! && data.kenarB! && data.kenarC!) {
      const a = data.kenarA;
      const b = data.kenarB;
      const c = data.kenarC;
      if (a + b <= c || a + c <= b || b + c <= a) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Geçersiz üçgen: Herhangi iki kenarın toplamı üçüncü kenardan büyük olmalıdır.", path: ['kenarA'] });
      }
    }
  } else if (data.sekil === 'Yamuk') {
    requireField(data.kenarA, 'kenarA');
    requireField(data.kenarB, 'kenarB');
    requireField(data.kenarC, 'kenarC');
    requireField(data.kenarD, 'kenarD');
  } else if (data.sekil === 'Daire') {
    requireField(data.yaricap, 'yaricap');
  }
});

type Input = z.infer<typeof schema>;

export const perimeterCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_perimeter_001',
  slug: 'cevre',
  status: 'published',
  name: 'Çevre Hesaplama',
  shortDescription: 'Kare, dikdörtgen, üçgen, paralelkenar, yamuk veya daire gibi geometrik şekillerin çevre uzunluğunu hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Çevre Hesaplama (Kare, Üçgen, Daire, Dikdörtgen) | Hesapera',
    description: 'Farklı geometrik şekillerin (Kare, Dikdörtgen, Üçgen, Daire, Paralelkenar, Yamuk) çevre uzunluğunu santimetre, metre veya milimetre cinsinden anında hesaplayın.',
    keywords: ['çevre hesaplama', 'üçgenin çevresi', 'dairenin çevresi', 'dikdörtgen çevre hesabı', 'geometrik çevre', 'çevre uzunluğu'],
    canonical: 'https://hesapera.com.tr/hesaplama/cevre',
    faq: [
      {
        question: "Üçgen çevresi hesaplarken neden 'Geçersiz üçgen' hatası alıyorum?",
        answer: "Matematikte 'Üçgen Eşitsizliği' kuralı vardır. Bir üçgenin herhangi iki kenarının toplam uzunluğu, mutlaka üçüncü kenardan büyük olmalıdır. Aksi halde o ölçülerle bir üçgen çizilemez (uçları birleşmez). Sistem bu hatayı yakalar."
      },
      {
        question: "Alan ile Çevre arasında doğrudan bir matematiksel orantı var mıdır?",
        answer: "Hayır. Örneğin çevresi 20 cm olan uzun ince bir dikdörtgenin alanı çok küçükken, çevresi yine 20 cm olan bir karenin alanı çok daha büyüktür. İkisi bağımsız hesaplanır."
      }
    ],
    content: {
      intro: "Kare, dikdörtgen, üçgen, daire gibi şekillerin dış sınır uzunluğunun (çevre) ölçümü ve hesaplama mantığı",

      sections: [
        {
          title: "Çevre Nedir?",
          paragraphs: [
            "Çevre, iki boyutlu kapalı bir geometrik şeklin tüm dış sınırlarının (kenarlarının) toplam uzunluğudur. Alanın aksine iç kısımla ilgilenmez; sadece şeklin etrafını saran çizginin ölçüsünü verir.",
            "Bir tarlanın etrafına çit çekmek, bir halının kenarına overlok yaptırmak veya bir odanın zeminine süpürgelik taktırmak için gereken malzeme miktarı 'Çevre' hesaplanarak bulunur."
          ]
        },
        {
          title: "Desteklenen Şekiller ve Mantığı",
          paragraphs: [
            "Hesaplayıcımız; Kare, Dikdörtgen, Üçgen, Paralelkenar, Yamuk ve Daire (çember) şekillerini destekler.",
            "- Kare/Yamuk/Üçgen gibi köşeli şekillerde formül basittir: Tüm kenar uzunlukları birbiriyle toplanır.",
            "- Dikdörtgen ve Paralelkenarda: Karşılıklı kenarlar eşit olduğundan (Kısa Kenar + Uzun Kenar) toplanıp 2 ile çarpılır.",
            "- Daire (Çember): Yuvarlak olduğu için kenarı yoktur. Yarıçap ve Pi sayısı (π) kullanılarak (2 × π × r) formülüyle dış sınır uzunluğu bulunur."
          ]
        },
        {
          title: "Birimlendirme ve Doğruluk",
          paragraphs: [
            "Çevre sadece bir 'uzunluk' olduğu için sonucu kareli (Örn: m²) veya küplü (Örn: m³) DEĞİL, dümdüz metre (m) veya santimetre (cm) olarak çıkar.",
            "Araca değerleri girerken mutlaka her kenarı aynı birime çevirdiğinizden emin olun (bir kenarı cm, diğerini m girmeyin). Seçtiğiniz 'Kullanılacak Ölçü Birimi', sonucun birimini belirleyecektir."
          ]
        },
      ],
      example: {
        title: "Arsa Çevresi (Çit) Örneği",
        text: "Dikdörtgen şeklinde bir arsanız var. Kısa kenarı 20 metre, uzun kenarı 50 metre. Araca bu verileri (Dikdörtgen ve m) girdiğinizde, formül (20 + 50) × 2 mantığıyla çalışarak 140 metre sonucunu verir. Arsanızı tel örgüyle çevirmek isterseniz tam 140 metre tel satın almanız gerekecektir."
      }
    },

    relatedCalculators: ["alan", "hacim"]
  },
  fields: [
    {
      id: 'sekil',
      label: 'Geometrik Şekil',
      type: 'select',
      required: true,
      options: [
        { label: 'Kare', value: 'Kare' },
        { label: 'Dikdörtgen', value: 'Dikdörtgen' },
        { label: 'Üçgen', value: 'Üçgen' },
        { label: 'Paralelkenar', value: 'Paralelkenar' },
        { label: 'Yamuk', value: 'Yamuk' },
        { label: 'Daire', value: 'Daire' }
      ],
      defaultValue: 'Dikdörtgen'
    },
    {
      id: 'birim',
      label: 'Kullanılacak Ölçü Birimi',
      type: 'select',
      required: true,
      options: [
        { label: 'Santimetre (cm)', value: 'cm' },
        { label: 'Metre (m)', value: 'm' },
        { label: 'Milimetre (mm)', value: 'mm' }
      ],
      defaultValue: 'cm'
    },
    {
      id: 'kenarA',
      label: '1. Kenar / Taban / Alt Taban (a)',
      type: 'number',
      required: false,
      conditions: [{ fieldId: 'sekil', operator: 'in', value: ['Kare', 'Dikdörtgen', 'Üçgen', 'Paralelkenar', 'Yamuk'] }]
    },
    {
      id: 'kenarB',
      label: '2. Kenar / Yan Kenar / Üst Taban (b)',
      type: 'number',
      required: false,
      conditions: [{ fieldId: 'sekil', operator: 'in', value: ['Dikdörtgen', 'Üçgen', 'Paralelkenar', 'Yamuk'] }]
    },
    {
      id: 'kenarC',
      label: '3. Kenar / 1. Yan Kenar (c)',
      type: 'number',
      required: false,
      conditions: [{ fieldId: 'sekil', operator: 'in', value: ['Üçgen', 'Yamuk'] }]
    },
    {
      id: 'kenarD',
      label: '4. Kenar / 2. Yan Kenar (d)',
      type: 'number',
      required: false,
      conditions: [{ fieldId: 'sekil', operator: 'equals', value: 'Yamuk' }]
    },
    {
      id: 'yaricap',
      label: 'Yarıçap (r)',
      type: 'number',
      required: false,
      conditions: [{ fieldId: 'sekil', operator: 'equals', value: 'Daire' }]
    }
  ],
  schema,
  calculate: (input) => calculatePerimeter(input)
};
