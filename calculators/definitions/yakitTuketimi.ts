import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calcModA, calcModB, calcModC, YAKIT_TUKETIMI_LIMITS } from '../formulas/yakitTuketimi';
import type { YakitTuketimiResult } from '../formulas/yakitTuketimi';

const positiveNumber = (field: keyof typeof YAKIT_TUKETIMI_LIMITS) =>
  z.number({ error: 'Geçerli ve sonlu bir sayı girin.' })
    .finite('Geçerli ve sonlu bir sayı girin.')
    .positive("Değer 0'dan büyük olmalıdır.")
    .max(YAKIT_TUKETIMI_LIMITS[field], `En fazla ${YAKIT_TUKETIMI_LIMITS[field]} girilebilir.`);

const schema = z.discriminatedUnion('mod', [
  z.object({
    mod: z.literal('A'),
    paidAmount: positiveNumber('paidAmount'),
    distance: positiveNumber('distance'),
    fuelPrice: positiveNumber('fuelPrice').optional(),
  }),
  z.object({
    mod: z.literal('B'),
    budget: positiveNumber('budget'),
    costPerKm: positiveNumber('costPerKm'),
  }),
  z.object({
    mod: z.literal('C'),
    distance: positiveNumber('distance'),
    costPerKm: positiveNumber('costPerKm'),
  }),
]);

type Input = z.infer<typeof schema>;

export const yakitTuketimiCalculatorDef: CalculatorDefinition<Input, YakitTuketimiResult> = {
  id: 'calc_yakitTuketimi_001',
  slug: 'yakit-tuketimi',
  status: 'published',
  name: 'Yakıt Tüketimi Hesaplama',
  shortDescription: 'Gerçekleşmiş bir yolculuğun ardından ödediğiniz yakıt tutarı ve katettiğiniz mesafe ile kilometre başına ne kadar yaktığınızı (TL/km) ve 100 km maliyetinizi pratik bir şekilde hesaplayın.',
  category: 'other',
  type: 'simple',
  metadata: {
    title: 'Ne Kadar Yaktım? TL/km Yakıt Tüketimi Hesaplama | Hesapera',
    description: 'Ödediğiniz yakıt tutarı ve katettiğiniz mesafeyle gerçekleşmiş yolculuğun TL/km ve 100 km maliyetini; litre fiyatıyla L/100 km tüketimini hesaplayın.',
    keywords: [
      'yakıt tüketimi hesaplama',
      'km de ne kadar yakmışım',
      'tl/km hesaplama',
      'araç ne kadar yaktı',
      'km başına yakıt maliyeti',
    ],
    canonical: 'https://www.hesapera.com.tr/hesaplama/yakit-tuketimi',
    icon: 'Gauge',
    features: [
      { label: 'Gerçek Tüketim Tespiti', icon: 'Gauge' },
      { label: 'Km Başına Maliyet', icon: 'TrendingDown' },
      { label: '3 Farklı Hesaplama Modu', icon: 'Layers' },
    ],
    infoBox: {
      title: 'Gerçek Tüketim İçin',
      text: 'Depoyu tam doldurun, kilometreyi sıfırlayın; belirli bir mesafe sonra depoyu yeniden doldurun. O gidişte ödediğiniz tutarı ve km\'yi girin.',
      icon: 'Lightbulb',
    },
    faq: [
      {
        question: 'Km başına yakıt maliyeti nasıl hesaplanır?',
        answer: 'Akaryakıt için ödediğiniz toplam tutarın, bu yakıtla katettiğiniz toplam kilometreye bölünmesiyle bulunur. Örneğin 1000 TL yakıt harcayıp 250 km yol yaptıysanız kilometre başına maliyetiniz 4 TL\'dir.',
      },
      {
        question: '100 km maliyeti nasıl hesaplanır?',
        answer: 'Kilometre başına yakıt maliyetinin 100 ile çarpılmasıyla bulunur. 100 km üzerinden maliyet ve tüketim karşılaştırması yapmak yaygın bir yöntemdir.',
      },
      {
        question: 'L/100 km hesaplamak için litre fiyatı neden gerekir?',
        answer: 'Ödenen TL tutarının kaç litre yakıta karşılık geldiğini bulmak için yakıtı aldığınız dönemdeki litre fiyatına ihtiyaç vardır. Litre miktarı bilinmeden aracın 100 km\'de kaç litre tükettiği hesaplanamaz.',
      },
      {
        question: 'Yakıt fiyatını bilmiyorsam ne hesaplayabilirim?',
        answer: 'Litre fiyatını bilmiyorsanız ödediğiniz tutar ve gittiğiniz mesafe ile TL/km ve 100 km maliyetini hesaplayabilirsiniz. L/100 km sonucu için litre fiyatı gerekir.',
      },
      {
        question: 'Şehir içi ve şehir dışı sonuçlar neden farklı olur?',
        answer: 'Şehir içindeki dur-kalk trafik, rölantide bekleme, düşük hızlar ve sık hızlanma-frenleme gibi koşullar nedeniyle yakıt tüketimi şehir dışı sabit hızlı kullanıma göre genellikle daha yüksek olabilir.',
      },
      {
        question: 'Daha tutarlı yakıt tüketimi nasıl ölçülür?',
        answer: 'Depoyu doldurup kilometre sayacını sıfırlamak, belirli bir mesafe kullandıktan sonra tekrar depoyu doldurmak yaygın bir yöntemdir. Alınan yakıt ve yapılan kilometre birlikte değerlendirilerek daha tutarlı bir tüketim ölçümü elde edilebilir.',
      },
    ],
    content: {
      intro: 'Gerçekleşmiş yolculuk sonrasında yapılan ölçüm, aracın belirli kullanım koşullarındaki yakıt performansını anlamaya yardımcı olur.',
      sections: [
        {
          title: 'Nasıl Hesaplanır?',
          paragraphs: [],
        },
        {
          title: 'MOD A — "Km\'de ne kadar yaktım?"',
          paragraphs: [
            'Toplam ödenen yakıt tutarı, gidilen toplam mesafeye bölünerek 1 kilometrede kaç TL harcadığınız bulunur.',
            'Bu sonucu 100 ile çarparak 100 km maliyetinizi görebilirsiniz.',
            'Yakıtın litre fiyatını da girerseniz, ödenen tutar litre fiyatına bölünerek toplam tüketilen yakıt miktarı bulunur. Bu veri kullanılarak aracınızın 100 kilometrede yaklaşık kaç litre yakıt tükettiği hesaplanabilir.',
          ],
          bullets: [
            'Ödenen Tutar / Gidilen Mesafe = TL/km',
          ],
        },
        {
          title: 'MOD B — "Bu bütçeyle kaç km giderim?"',
          paragraphs: [
            'Toplam bütçeniz, aracınızın kilometre başına yakıt maliyetine (TL/km) bölünerek mevcut bütçenizle yaklaşık ne kadar mesafe gidebileceğiniz hesaplanır.',
          ],
          bullets: [
            'Bütçe / TL/km Maliyeti = Gidilebilecek Mesafe',
          ],
        },
        {
          title: 'MOD C — "Bu mesafe kaça mal olur?"',
          paragraphs: [
            'Gidilecek toplam mesafe, aracınızın bilinen kilometre başına yakıt maliyeti (TL/km) ile çarpılarak toplam yakıt masrafı hesaplanır.',
          ],
          bullets: [
            'Mesafe × TL/km Maliyeti = Toplam Maliyet',
          ],
        },
        {
          title: 'Yakıt Maliyeti vs Yakıt Tüketimi',
          paragraphs: [
            'Yakıt Tüketimi (Bu Araç): Gerçekleşmiş bir yolculuğun analizidir. Fiş tutarı ve yapılan kilometre gibi gerçekleşmiş verilerle "Ne kadar yaktım?" sorusuna yanıt verir ve aracınızın mevcut kullanım maliyetini değerlendirmenizi sağlar.',
            'Yakıt Maliyeti: Gelecekteki yolculuk planlamasıdır. Henüz yola çıkmadan önce aracınızın ortalama tüketim verisi ve litre fiyatıyla "Yolculuk ne kadar tutar?" sorusuna cevap verir.',
            'Bütçenizi önceden planlamak için [Yakıt Maliyeti Hesaplama](/hesaplama/yakit-maliyeti) aracını kullanabilirsiniz.',
            'Araç finansmanını değerlendirmek için [Taşıt Kredisi Hesaplama](/hesaplama/tasit-kredisi) aracını kullanabilirsiniz.',
          ],
        },
        {
          title: 'Yakıt Tüketimi Nedir?',
          paragraphs: [
            'Yakıt tüketimi, bir aracın belirli bir mesafeyi katetmek için kullandığı yakıt miktarını veya bunun ekonomik karşılığını ifade eder.',
            'Gerçekleşmiş yolculuk sonrasında yapılan ölçüm, aracın belirli kullanım koşullarındaki yakıt performansını anlamaya yardımcı olur.',
          ],
        },
        {
          title: 'TL/km ile L/100 km Arasındaki Fark',
          paragraphs: [
            'TL/km: Yaptığınız yolun cebinize yansıyan parasal maliyetini gösterir.',
            'Yakıt fiyatına doğrudan bağlıdır. Akaryakıt fiyatı değiştiğinde aracınız aynı miktarda yakıt tüketse bile TL/km değeri değişebilir.',
            'L/100 km: Aracın 100 kilometrede kullandığı yakıt miktarını litre cinsinden gösterir.',
            'Yakıt fiyatından bağımsız, hacimsel bir tüketim ölçüsüdür. Bu nedenle farklı tarihlerdeki tüketim performansını karşılaştırırken TL/km değerine göre daha doğrudan bir teknik karşılaştırma sağlar.',
          ],
        },
        {
          title: 'Yol Bilgisayarı ile Fiş/Depo Yöntemi Arasındaki Fark',
          paragraphs: [
            'Araçların yol bilgisayarları tüketimi çeşitli sensör ve sürüş verileri üzerinden hesaplar.',
            'Gerçek kullanım koşullarında yol bilgisayarındaki değer ile yakıt alımı üzerinden yapılan hesap arasında fark oluşabilir.',
            'Fiş tutarı ve yapılan kilometre üzerinden hesaplanan TL/km değeri, ilgili yolculukta cebinizden çıkan gerçek maliyeti görmenizi sağlar.',
          ],
        },
        {
          title: 'Tüketimi Etkileyen Faktörler',
          paragraphs: [
            'Yakıt tüketimi birçok değişkenden etkilenebilir.',
            'Örneğin:',
          ],
          bullets: [
            'trafik yoğunluğu',
            'sürüş tarzı',
            'ani hızlanma ve frenleme',
            'araç yükü',
            'lastik basıncı',
            'klima kullanımı',
            'yol eğimi',
            'hava koşulları',
            'ortalama hız',
            'Bu nedenle tek bir yolculuk sonucunu aracın her koşuldaki kesin tüketimi olarak değerlendirmemek gerekir.',
          ],
        },
        {
          title: 'Sonuçları Nasıl Yorumlamalısınız?',
          paragraphs: [
            'Tek bir yolculuğun sonucu trafik, hava koşulları, yük ve sürüş biçimi gibi değişkenlerden etkilenebilir.',
            'Aracınızın tüketimini daha anlamlı biçimde takip etmek için benzer koşullarda birden fazla ölçüm yapıp sonuçları karşılaştırabilirsiniz.',
            'TL/km değerini takip ederken yakıt fiyatındaki değişiklikleri de dikkate alın.',
            'Motorun yakıt tüketimini dönemler arasında daha doğrudan karşılaştırmak istiyorsanız litre fiyatını girerek L/100 km sonucunu kullanmak daha anlamlı olabilir.',
          ],
        },
      ],
      example: {
        title: 'Gerçek Örnek',
        text: 'Ödenen tutar 543 TL ve gidilen mesafe 142 km olduğunda hesap 543 TL / 142 km = 3,823943... TL/km olur. Gösterilen sonuç kilometre başına 3,82 TL/km ve 100 km için 382,39 TL\'dir.',
      },
    },
    relatedCalculators: ['yakit-maliyeti', 'tasit-kredisi'],
  },
  fields: [
    {
      id: 'mod', label: 'Hesaplama Türü', type: 'select', required: true,
      defaultValue: 'A',
      options: [
        { label: 'Tüketim Bul', value: 'A' },
        { label: 'Menzil Hesapla', value: 'B' },
        { label: 'Maliyet Hesapla', value: 'C' },
      ],
    },
    {
      id: 'paidAmount', label: 'Ödenen Yakıt Tutarı (TL)', type: 'number',
      required: true, max: YAKIT_TUKETIMI_LIMITS.paidAmount,
      placeholder: 'Örn: 543',
      conditions: [{ fieldId: 'mod', operator: 'equals', value: 'A' }],
    },
    {
      id: 'budget', label: 'Yakıt Bütçesi (TL)', type: 'number',
      required: true, max: YAKIT_TUKETIMI_LIMITS.budget,
      placeholder: 'Örn: 1.200',
      conditions: [{ fieldId: 'mod', operator: 'equals', value: 'B' }],
    },
    {
      id: 'distance', label: 'Mesafe (km)', type: 'number',
      required: true, max: YAKIT_TUKETIMI_LIMITS.distance,
      placeholder: 'Örn: 142',
      conditions: [{ fieldId: 'mod', operator: 'in', value: ['A', 'C'] }],
    },
    {
      id: 'fuelPrice', label: 'Yakıt Litre Fiyatı (TL/L)', type: 'number',
      required: false, max: YAKIT_TUKETIMI_LIMITS.fuelPrice,
      placeholder: 'Örn: 45,50',
      description: 'İsteğe bağlı. Litre ve L/100 km sonucunu görmek için girin.',
      conditions: [{ fieldId: 'mod', operator: 'equals', value: 'A' }],
    },
    {
      id: 'costPerKm', label: 'Ortalama Maliyet (TL/km)', type: 'number',
      required: true, max: YAKIT_TUKETIMI_LIMITS.costPerKm,
      placeholder: 'Örn: 3,82',
      conditions: [{ fieldId: 'mod', operator: 'in', value: ['B', 'C'] }],
    },
  ],
  schema,
  calculate: (input) => {
    switch (input.mod) {
      case 'A': return calcModA(input.paidAmount, input.distance, input.fuelPrice);
      case 'B': return calcModB(input.budget, input.costPerKm);
      case 'C': return calcModC(input.distance, input.costPerKm);
    }
  },
};
