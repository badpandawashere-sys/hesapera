import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKomisyon } from '../formulas/komisyon';

const schema = z.object({
  mode: z.enum(['calculate_commission', 'calculate_target_gross', 'calculate_rate']),
  grossAmount: z.number().min(0).optional(),
  commissionRate: z.number().min(0).optional(),
  targetNet: z.number().min(0).optional(),
  commissionAmount: z.number().min(0).optional()
});

type Input = z.infer<typeof schema>;

export const komisyonCalculatorDef: CalculatorDefinition<Input, any> = {
  fields: [],
  schema,
  calculate: (input) => calculateKomisyon(input as any),
  id: 'calc_komisyon_001',
  slug: 'komisyon-hesaplama',
  status: 'published',
  name: 'Komisyon Hesaplama',
  shortDescription: 'Satış tutarı ve komisyon oranını girerek kesilecek komisyonu ve net kazancı hesaplayın; hedef net tutara göre gerekli satış fiyatını bulun.',
  category: 'finance',
  type: 'simple',
  metadata: {
    title: 'Komisyon Hesaplama – Komisyon Oranı ve Net Tutar Hesapla',
    description: 'Satış tutarı ve komisyon oranını girerek kesilecek komisyonu ve net kazancı hesaplayın; hedef net tutara göre gerekli satış fiyatını bulun.',
    keywords: ['komisyon hesaplama', 'komisyon oranı', 'net tutar hesaplama', 'pazaryeri komisyonu', 'pos komisyonu'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/komisyon-hesaplama',
    content: {
      intro: 'Komisyon hesaplama, satış işlemleri sonrası aracı kurumlara ödenen bedeli ve elinize geçecek net kazancı hesaplamanızı sağlayan finansal bir araçtır.',
      sections: [
        {
          title: '1. Komisyon Nedir ve Nasıl Hesaplanır?',
          paragraphs: ['Ticari hayatta satılan bir mal veya sunulan bir hizmet üzerinden, aracıya veya satıcıya belirli bir oranda ödenen bedele komisyon denir. Komisyon hesaplama işlemi temelde basit bir [Yüzde Hesaplama](/hesaplama/yuzde) işlemidir. Komisyon tutarı şu formülle hesaplanır: Komisyon Tutarı = Satış Tutarı × (Komisyon Oranı / 100)']
        },
        {
          title: '2. Komisyon Sonrası Net Tutar Nasıl Bulunur?',
          paragraphs: ['Bir satış işlemi gerçekleştirdiğinizde elinize geçecek net tutarı bulmak için kesilecek komisyon tutarını ana paradan çıkarmanız gerekir. Net Tutar = Satış Tutarı - Komisyon Tutarı']
        },
        {
          title: '3. Komisyon Oranı Nasıl Bulunur?',
          paragraphs: ['Elinizde satış tutarı ve kesilen komisyon tutarı varsa uygulanan oranı bulmak [Oran Hesaplama](/hesaplama/oran) mantığıyla çok kolaydır: Komisyon Oranı = (Komisyon Tutarı / Satış Tutarı) × 100']
        },
        {
          title: '4. Net Kazançtan Gerekli Satış Fiyatı Nasıl Bulunur?',
          paragraphs: ['Satıcıların en çok zorlandığı nokta budur. Elinize net 1.000 TL geçmesini istiyorsunuz ve komisyon oranınız %20. Bu durumda ürünü 1.200 TL\'ye satarsanız (%20\'si 240 TL yapar) elinize 960 TL geçer! Doğru formül şudur: Satış Fiyatı = Hedef Net Tutar / (1 - (Komisyon Oranı / 100)). Bu formüle göre 1.000 / (1 - 0.20) = 1.000 / 0.80 = 1.250 TL.']
        },
        {
          title: '5. Yüzde Komisyon Hesaplama Formülü Özeti',
          paragraphs: ['Komisyon: Fiyat × Oran, Net Tutar: Fiyat × (1 - Oran), Satış Fiyatı: Net Tutar / (1 - Oran)']
        },
        {
          title: '6. Pazaryeri Komisyonu Hesaplama Mantığı',
          paragraphs: ['Pazaryerlerinde satış yapan satıcılar ürünlerinin listelenmesi ve satılması karşılığında ilgili platforma kategori bazlı bir komisyon öderler. Komisyon, kargo veya KDV dahil satış fiyatı üzerinden kesilebilir.']
        },
        {
          title: '7. POS Komisyonu Hesaplama Mantığı',
          paragraphs: ['Kredi kartı ile ödeme alırken banka veya ödeme kuruluşları (POS) belirli bir oranda kesinti yapar. Ertesi gün valörlü veya 30 gün blokeli anlaşmalara göre kesinti oranları değişir.']
        },
        {
          title: '8. Komisyon ile Kâr Marjı Arasındaki Fark',
          paragraphs: ['Komisyon, başkasına ödediğiniz aracı kurum bedelidir. [Kâr Marjı Hesaplama](/hesaplama/kar-marji-hesaplama) işlemi ise maliyetler ve komisyonlar düşüldükten sonra cebinize kalan kazancın satış fiyatına oranını ifade eder. Birbiriyle karıştırılmamalıdır.']
        },
        {
          title: '9. Komisyon Hesaplarken KDV ve Diğer Kesintiler',
          paragraphs: ['Komisyonun hangi tutar üzerinden hesaplandığı platforma, sözleşmeye ve ücretlendirme modeline göre değişebilir. Bazı sistemlerde [KDV Hesaplama](/hesaplama/kdv-hesaplama) sonrası oluşan KDV dahil satış/tahsilat tutarı esas alınabilir; komisyon hizmetine ilişkin vergiler ayrıca uygulanabilir.']
        },
        {
          title: '10. B2B Komisyon Modelleri',
          paragraphs: ['Toptan satış veya bayi ağlarında uygulanan komisyonlar, genellikle ciro hedefleri aşıldıkça azalan veya artan (tiered) komisyon oranlarına sahiptir. Oranlar sözleşmeye göre değişir.']
        }
      ]
    },
    faq: [
      {
        question: '%10 komisyon nasıl hesaplanır?',
        answer: 'Satış tutarı ile 10 çarpılır ve 100\'e bölünür. Örneğin 1.000 TL\'nin %10\'u (1.000 x 10) / 100 = 100 TL yapar.'
      },
      {
        question: '1000 TL satıştan %15 komisyon kesilirse ne kadar kalır?',
        answer: '1.000 TL\'nin %15 komisyonu 150 TL\'dir. 1.000 TL - 150 TL = 850 TL net tutar kalır.'
      },
      {
        question: 'Komisyon oranı nasıl bulunur?',
        answer: 'Kesilen komisyon tutarını toplam satış tutarına bölüp 100 ile çarparak komisyon oranını bulabilirsiniz.'
      },
      {
        question: 'Elime 1000 TL geçmesi için kaç TL satış yapmalıyım?',
        answer: 'Komisyon oranınıza bağlıdır. Örneğin komisyon oranınız %20 ise, 1.000 / (1 - 0.20) = 1.250 TL satış yapmanız gerekir.'
      },
      {
        question: '%20 komisyon sonrası net tutar nasıl bulunur?',
        answer: 'Satış tutarınızın %20\'sini hesaplayıp ana paradan çıkarabilirsiniz veya kısaca satış tutarını 0.80 ile çarpabilirsiniz.'
      },
      {
        question: 'Komisyon ile kâr marjı aynı şey mi?',
        answer: 'Hayır. Komisyon aracılara ödenen bedeldir. Kâr marjı ise sizin elde ettiğiniz net kazancın oransal ifadesidir.'
      },
      {
        question: 'Komisyon oranı %100 olabilir mi?',
        answer: 'Komisyon tutarı hesaplanırken teorik olarak %100 komisyon olabilir, bu durumda elinize 0 TL geçer. Ancak net tutardan satış fiyatı bulmak isterseniz %100 komisyon matematiksel olarak imkansızdır (Sonsuzluk hatası verir).'
      },
      {
        question: 'Ondalıklı komisyon oranı kullanılabilir mi?',
        answer: 'Evet, finansal piyasalarda ve POS oranlarında genellikle %1,25 veya %2,50 gibi ondalıklı komisyon oranları kullanılır.'
      }
    ],
    relatedCalculators: [
      'kar-marji-hesaplama',
      'yuzde',
      'oran',
      'kdv-hesaplama'
    ]
  }
};
