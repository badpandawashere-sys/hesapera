import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateYakitMaliyeti } from '../formulas/yakitMaliyeti';

const schema = z.object({
  distance: z.number().positive('Mesafe 0 dan büyük olmalıdır').max(1000000, 'Güvenli maksimum limit aşıldı'),
  fuelConsumption: z.number().positive('Yakıt tüketimi 0 dan büyük olmalıdır').max(100, 'Maksimum tüketim 100 L/100km'),
  fuelPrice: z.number().positive('Litre fiyatı 0 dan büyük olmalıdır').max(1000, 'Maksimum fiyat 1000 TL')
});

type Input = z.infer<typeof schema>;

export const yakitMaliyetiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_yakitMaliyeti_001',
  slug: 'yakit-maliyeti',
  status: 'published',
  name: 'Yakıt Maliyeti Hesaplama',
  shortDescription: 'Gidilecek mesafe, aracınızın 100 km ortalama tüketimi ve güncel pompa fiyatı ile seyahat yakıt masrafını ve kilometre başı maliyetini hesaplayın.',
  category: 'other',
  type: 'simple',
  metadata: {
    title: 'Yakıt Maliyeti Hesaplama: Yolculuk Ne Kadar Tutar? | Hesapera',
    description: 'Gideceğiniz mesafe, aracınızın 100 km ortalama yakıt tüketimi ve pompa litre fiyatına göre toplam yol masrafınızı ve kilometre başına yakıt maliyetinizi anında hesaplayın.',
    keywords: [
      'yakıt maliyeti hesaplama',
      'benzin maliyeti hesapla',
      'dizel yakıt hesaplama',
      'km başına yakıt',
      'yol masrafı hesaplama',
      '100 km yakıt tüketimi'
    ],
    canonical: 'https://www.hesapera.com.tr/hesaplama/yakit-maliyeti',
    icon: 'Car',
    features: [
      { label: 'Kilometre Başı Maliyet', icon: 'Gauge' },
      { label: 'Toplam Tüketim (Litre)', icon: 'Fuel' },
      { label: 'Net Bütçe Planı', icon: 'Coins' }
    ],
    infoBox: {
      title: 'Güncel Pompa Fiyatını Girin',
      text: 'Yakıt fiyatları dağıtım firması, istasyon ve şehre göre farklılık gösterdiğinden, en doğru sonuç için aracınıza aldığınız güncel pompa litre fiyatını girmeyi unutmayın.',
      icon: 'Info'
    },
    faq: [
      {
        question: 'Yolculuk maliyeti hesabında L/100 km değeri nasıl kullanılır?',
        answer: 'Aracınızın L/100 km değerini planlanan mesafeyle çarpıp 100\'e bölerek yolculukta tüketilecek litreyi tahmin edebilirsiniz. Bu litreyi güncel pompa fiyatıyla çarparak tahmini toplam maliyeti bulabilirsiniz.'
      },
      {
        question: 'Planlanan yolculukta kilometre başına maliyet nasıl bulunur?',
        answer: 'Tahmini toplam yakıt maliyetinin planlanan mesafeye bölünmesiyle bulunur. Örneğin 500 km yol için tahmini maliyet 1.500 TL ise kilometre başına planlanan maliyet 1.500 / 500 = 3,00 TL olur.'
      },
      {
        question: 'Klima yakıt tüketimini ne kadar artırır?',
        answer: 'Klima kullanımı motor yükünü artırdığından, sürüş koşullarına ve hava sıcaklığına bağlı olarak yakıt tüketimini ortalama %5 ile %15 arasında artırabilmektedir. Özellikle şehir içi dur-kalk trafikte klima etkisi daha belirgindir.'
      }
    ],
    content: {
      intro: 'Yakıt maliyeti hesaplama, 100 km ortalama tüketim formülü ve araç seyahat masraflarını düşürme rehberi',
      sections: [
        {
          title: 'Yakıt Maliyeti Nasıl Hesaplanır?',
          paragraphs: [
            'Yakıt maliyeti hesaplaması; seyahat edilecek mesafe (km), aracın 100 kilometrede harcadığı ortalama yakıt miktarı (Litre) ve satın alınan yakıtın güncel litre fiyatı (TL/L) temel alınarak yapılır.',
            'İlk adımda toplam tüketilecek litre miktarı hesaplanır: Tüketilen Yakıt = (Mesafe × 100 km Tüketimi) / 100. Ardından bu miktar litre fiyatı ile çarpılarak toplam seyahat masrafı ortaya çıkar.'
          ],
          bullets: [
            'Toplam Tüketilen Litre: (Mesafe × Ortalama Tüketim) / 100',
            'Toplam Masraf: Tüketilen Litre × Litre Fiyatı',
            'Kilometre Başı Maliyet: Toplam Masraf / Mesafe'
          ]
        },
        {
          title: 'Fabrika Tüketim Verileri ile Gerçek Tüketim Arasındaki Farklar',
          paragraphs: [
            'Otomobil üreticilerinin kataloglarında belirttikleri WLTP veya NEDC tüketim verileri laboratuvar şartlarında ve standart test döngülerinde ölçülür.',
            'Günlük sürüşte trafik yoğunluğu, araçtaki yük ve yolcu ağırlığı, lastik basınçları, hava durumu, yokuş çıkışları ve ani hızlanma/frenleme gibi faktörler nedeniyle gerçek tüketim fabrika verilerinden %10-%30 daha yüksek gerçekleşebilir.'
          ]
        },
        {
          title: 'Yakıt Tüketimini Azaltmanın Yolları',
          paragraphs: [
            'Doğru sürüş alışkanlıkları ve düzenli araç bakımı ile seyahat başına yakıt harcamanızı kayda değer ölçüde düşürebilirsiniz:'
          ],
          bullets: [
            'Sabit hızda ve uygun viteste sürüş (hız sabitleyici kullanımı uzun yolda tasarruf sağlar).',
            'Ani hızlanmalardan ve sert frenlerden kaçınmak.',
            'Araç lastik hava basınçlarını üreticinin önerdiği değerde tutmak (düşük basınç tüketimi %3-5 artırır).',
            'Gereksiz bagaj ağırlıklarını ve tavan bagajı/portbagaj gibi aerodinamik direnç oluşturan parçaları sökmek.',
            'Düzenli periyodik bakım (hava filtresi, buji, motor yağı kontrolü).'
          ]
        }
      ],
      example: {
        title: 'Örnek Seyahat Hesabı',
        text: 'İstanbul - Ankara arasında 450 km yol yapacak bir aracın ortalama tüketiminin 6,0 L/100 km ve benzin litre fiyatının 45 TL olduğunu varsayalım. Tüketilecek yakıt: (450 x 6,0) / 100 = 27 Litre. Toplam yakıt maliyeti: 27 x 45 = 1.215 TL. Kilometre başı maliyet ise 1.215 / 450 = 2,70 TL / km olacaktır.'
      },
      sources: [
        {
          name: 'Karayolları Genel Müdürlüğü (KGM) Yol Ağı ve Mesafeler',
          url: 'https://www.kgm.gov.tr/'
        },
        {
          name: 'Enerji Piyasası Düzenleme Kurumu (EPDK) Akaryakıt Fiyatlandırması',
          url: 'https://www.epdk.gov.tr/'
        }
      ]
    },
    relatedCalculators: ['tasit-kredisi', 'yuzde', 'oran']
  },
  fields: [
    {
      id: 'distance',
      label: 'Gidilecek Mesafe (km)',
      type: 'number',
      required: true,
      min: 1,
      max: 100000,
      defaultValue: 100,
      placeholder: 'Örn: 350'
    },
    {
      id: 'fuelConsumption',
      label: 'Ortalama Tüketim (L / 100 km)',
      type: 'number',
      required: true,
      min: 0.1,
      max: 100,
      step: 0.1,
      defaultValue: 6.5,
      placeholder: 'Örn: 6.5'
    },
    {
      id: 'fuelPrice',
      label: 'Yakıt Litre Fiyatı (TL / L)',
      type: 'currency',
      required: true,
      min: 0.01,
      max: 1000,
      step: 0.01,
      defaultValue: 45,
      placeholder: 'Örn: 45.50'
    }
  ],
  schema,
  calculate: (input) => {
    return calculateYakitMaliyeti(input.distance, input.fuelConsumption, input.fuelPrice);
  }
};
