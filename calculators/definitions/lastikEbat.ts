import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLastikEbat } from '../formulas/lastikEbat';

const tireSchema = z.object({
  width: z.number().min(0).optional(),
  aspectRatio: z.number().min(0).optional(),
  rimInch: z.number().min(0).optional(),
});

const schema = z.object({
  oldTire: tireSchema,
  newTire: tireSchema,
  indicatedSpeed: z.number().min(0).optional().default(100)
});

type Input = z.infer<typeof schema>;

export const lastikEbatCalculatorDef: CalculatorDefinition<Input, any> = {
  fields: [],
  schema,
  calculate: (input) => calculateLastikEbat(input as any),
  id: 'calc_lastik_ebat_001',
  slug: 'lastik-ebat-hesaplama',
  status: 'published',
  name: 'Lastik Ebat Hesaplama',
  shortDescription: 'Mevcut ve yeni lastik ölçülerini karşılaştırarak çap, çevre, yanak yüksekliği, yerden yükseklik ve hız göstergesi farkını hesaplayın.',
  category: 'other',
  type: 'simple',
  metadata: {
    title: 'Lastik Ebat Hesaplama – Lastik Çapı ve Hız Farkı Karşılaştır',
    description: 'Mevcut ve yeni lastik ölçülerini karşılaştırarak çap, çevre, yanak yüksekliği, yerden yükseklik ve hız göstergesi farkını hesaplayın.',
    keywords: ['lastik ebat hesaplama', 'lastik çapı hesaplama', 'lastik karşılaştırma', 'yanak yüksekliği', 'hız göstergesi sapması', 'lastik çevresi'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/lastik-ebat-hesaplama',
    icon: 'Disc',
    content: {
      intro: 'Lastik Ebat Hesaplama aracı, aracınızın mevcut lastikleri ile yeni takmayı düşündüğünüz lastikler arasındaki geometrik farkları bulmanızı sağlar. Çap farkı, yerden yükseklik değişimi ve hız göstergesi sapması gibi verileri detaylıca karşılaştırabilirsiniz.',
      sections: [
        {
          title: '1. Lastik ebatı nasıl okunur?',
          paragraphs: ['Lastik üzerinde yer alan 205/55 R16 gibi rakamlar ve harfler, lastiğin fiziksel boyutlarını temsil eder. İlk rakam taban genişliğini, ikinci rakam yanak oranını, R harfi lastik tipini (Radial), son rakam ise inç cinsinden jant çapını belirtir.']
        },
        {
          title: '2. 205/55 R16 ne anlama gelir?',
          paragraphs: ['Bu ölçüde 205 rakamı milimetre (mm) cinsinden lastiğin taban genişliğidir. 55 rakamı yanak oranını gösterir; yani yanak yüksekliği, taban genişliğinin %55\'idir. R16 ise bu lastiğin 16 inçlik bir janta uygun olduğunu ifade eder.']
        },
        {
          title: '3. Lastik çapı nasıl hesaplanır?',
          paragraphs: ['Toplam lastik çapı, iki yanak yüksekliği ile jant çapının milimetreye çevrilip toplanmasıyla elde edilir. Jant çapını inçten milimetreye çevirmek için 25.4 ile çarpmalısınız. Ardından iki yanak yüksekliğini (üst ve alt) bu değere ekleyerek genel çapı bulursunuz.']
        },
        {
          title: '4. Yanak yüksekliği nasıl hesaplanır?',
          paragraphs: ['Yanak yüksekliği doğrudan yazılmaz, taban genişliğine oranla hesaplanır. [Yüzde Hesaplama](/hesaplama/yuzde) mantığıyla, 205 mm genişliğinde ve %55 yanak oranına sahip bir lastiğin yanağı: 205 * 0.55 = 112.75 mm olarak hesaplanır.']
        },
        {
          title: '5. Lastik çevresi nasıl hesaplanır?',
          paragraphs: ['Lastiğin tam bir tur döndüğünde kat ettiği mesafe olan çevre, lastik çapının Pi sayısı (yaklaşık 3.14159) ile çarpılmasıyla bulunur. Bu değer, aracınızın 1 kilometrede kaç tekerlek turu attığını bulmak için kullanılır.']
        },
        {
          title: '6. Farklı lastik ebatı hız göstergesini nasıl etkiler?',
          paragraphs: ['Aracınızın hız göstergesi fabrikasyon lastik çapına göre kalibre edilmiştir. Eğer daha büyük çaplı bir lastik takarsanız, lastik bir turda daha fazla mesafe kateder. Bu durumda gösterge 100 km/s hız gösterirken gerçekte daha hızlı (örneğin 103 km/s) gidiyor olabilirsiniz.']
        },
        {
          title: '7. Jant büyüyünce lastik çapı mutlaka büyür mü?',
          paragraphs: ['Hayır. Jant boyutunu büyütürken yanak oranını (profilini) düşürürseniz, toplam lastik çapını mevcut lastiğinizle aynı veya çok yakın tutabilirsiniz. Bu işleme "inç-up" adı verilir ve genellikle estetik veya yol tutuş amacıyla yapılır.']
        },
        {
          title: '8. Lastik ebatı değişince yerden yükseklik nasıl değişir?',
          paragraphs: ['Yerden yükseklik farkı, eski lastik ile yeni lastiğin toplam çap farkının yarısıdır. Örneğin yeni lastiğinizin çapı eski lastikten 10 mm daha büyükse, aracınızın yerden yüksekliği 5 mm artacaktır.']
        },
        {
          title: '9. Teker dönüş sayısı neden değişir?',
          paragraphs: ['Tekerlek çevresi büyüdükçe aynı mesafeyi kat etmek için gereken tur (dönüş) sayısı azalır. Bu durum, aracın vites oranlarındaki devir/hız eğrisini etkiler, çekişi düşürüp yakıt tüketimini dolaylı yönden değiştirebilir. [Yakıt Maliyeti Hesaplama](/hesaplama/yakit-maliyeti) veya [Yakıt Tüketimi Hesaplama](/hesaplama/yakit-tuketimi) yaparken bu ufak kayıpları göze almanız gerekebilir.']
        },
        {
          title: '10. Alternatif lastik ebatı seçerken nelere dikkat edilir?',
          paragraphs: ['Aracınızın geometrik özelliklerinin yanı sıra araç üreticisinin onayladığı ölçüler, jant genişliği, yük endeksi, hız endeksi ve çamurluk/süspansiyon boşluğu gibi başka kritik faktörler vardır. Çap farkı arttıkça hız göstergesi, sürüş yüksekliği ve araç sistemlerinin hesapları etkilenebilir. Çap farkının genellikle ±%3 sınırları içinde kalması tavsiye edilir ancak kesin uygunluk için profesyonel destek almalısınız. Yeni bir araç veya modifiye bütçesi planlıyorsanız finansman seçenekleri için [Taşıt Kredisi Hesaplama](/hesaplama/tasit-kredisi) aracımıza göz atabilirsiniz.']
        }
      ]
    },
    faq: [
      {
        question: '205/55 R16 ne demek?',
        answer: '205 lastik genişliğini (mm), 55 yanak oranını (genişliğin yüzdesi), R radyal tip olduğunu, 16 ise jant çapını (inç) belirtir.'
      },
      {
        question: 'Lastik çapı nasıl hesaplanır?',
        answer: 'İki adet yanak yüksekliği ile jant çapının (inçten milimetreye çevrilerek) toplanmasıyla elde edilir.'
      },
      {
        question: 'Lastik ebatı büyürse hız göstergesi nasıl değişir?',
        answer: 'Daha büyük çaplı lastik, bir turda daha fazla mesafe gideceğinden aracınızın gerçek hızı, göstergede yazan hızdan daha yüksek olacaktır.'
      },
      {
        question: 'Daha büyük lastik takınca araç yükselir mi?',
        answer: 'Evet, yeni lastiğinizin toplam çapı eski lastikten büyükse, aradaki çap farkının yarısı kadar aracınız yerden yükselecektir.'
      },
      {
        question: '205/55 R16 ile 225/45 R17 arasındaki fark nedir?',
        answer: 'İki ebat arasındaki çap farkı yaklaşık +%0.38\'dir. Yerden yükseklik ise yalnızca +1.2 mm artar. Gösterge hızında önemli bir farklılık yaratmadığı için sık yapılan değişimlerden biridir.'
      },
      {
        question: 'Jant büyütürken lastik yanağı neden küçültülür?',
        answer: 'Orijinal lastik çapını korumak için, jant (metal kısım) büyüdükçe lastiğin yanak (kauçuk kısım) yüksekliğinin düşürülmesi gerekir. Böylece hız göstergesi sapması yaşanmaz.'
      },
      {
        question: 'Lastik çevresi neden önemlidir?',
        answer: 'Lastiğin yola temas ederek bir tam turda aldığı yolu ifade eder. Hız, kilometre sayacı ve araç bilgisayarının (ABS, ESP vb.) doğru çalışması doğrudan bu değere bağlıdır.'
      },
      {
        question: 'Aynı çapta farklı lastik ölçüsü kullanılabilir mi?',
        answer: 'Teorik olarak çap aynı kaldığı sürece kullanılabilir, ancak yeni ölçünün jant genişliğine uyması ve sürtme yapmaması (çamurluk payı) gerekir. Mutlaka üretici tavsiyesine uyulmalıdır.'
      }
    ],
    relatedCalculators: [
      'yakit-maliyeti',
      'yakit-tuketimi',
      'tasit-kredisi',
      'yuzde'
    ]
  }
};
