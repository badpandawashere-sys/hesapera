import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKaloriIhtiyaci } from '../formulas/kaloriIhtiyaci';

const schema = z.object({
  cinsiyet: z.enum(['Erkek', 'Kadın']),
  yas: z.number().min(1).max(120),
  boy: z.number().min(50).max(250),
  kilo: z.number().min(20).max(300),
  aktiviteFaktoru: z.number()
});

type Input = z.infer<typeof schema>;

export const gunlukKaloriIhtiyaciCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_gunluk_kalori_ihtiyaci_001',
  slug: 'gunluk-kalori-ihtiyaci',
  status: 'published',
  name: 'Günlük Kalori İhtiyacı Hesaplama',
  shortDescription: 'Bazal Metabolizma Hızınızı (BMR) ve aktivite faktörünüzü kullanarak tahmini Günlük Toplam Enerji Harcamanızı (TDEE) hesaplayın.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Günlük Kalori İhtiyacı Hesaplama (TDEE) | Hesapera',
    description: 'Mifflin-St Jeor formülü ve fiziksel aktivite seviyeniz ile tahmini günlük kalori ihtiyacınızı (TDEE) bilimsel olarak hesaplayın.',
    keywords: ['günlük kalori ihtiyacı hesaplama', 'tdee hesaplama', 'kalori hesabı', 'günlük enerji ihtiyacı', 'zayıflamak için kalori'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/gunluk-kalori-ihtiyaci',
    faq: [
      {
        question: "Hesaplanan kalori miktarından az yersem kilo verir miyim?",
        answer: "Matematiksel olarak günlük yaktığınız kalori (TDEE) miktarından daha az enerji (kalori açığı) almanız halinde vücut eksik enerjiyi yağ depolarından karşılar ve kilo kaybı yaşanır. Ancak aşırı düşük kalorili şok diyetler kas kaybına ve metabolizmanın yavaşlamasına yol açabileceğinden uzman kontrolünde ilerlenmelidir."
      },
      {
        question: "Mifflin-St Jeor formülü nedir?",
        answer: "Yaş, boy, kilo ve cinsiyet değişkenlerini kullanarak bazal metabolizma hızını hesaplayan, tıp ve beslenme dünyasında doğruluk payı en yüksek kabul edilen denklem yöntemlerinden biridir."
      },
      {
        question: "Hesaplama sonucum 100% kesin midir?",
        answer: "Hayır. Araçtaki fiziksel aktivite katsayıları genel ortalamalara dayanır. Gün içerisindeki stres seviyeniz, genetik hızınız veya yediğiniz gıdaların termik etkisi (sindirilirken harcanan enerji) gibi değişkenler sonucu bir miktar değiştirebilir."
      }
    ],
    content: {
      intro: "Mifflin-St Jeor formülüyle günlük bazal metabolizma hızı (BMR) ve aktiviteye bağlı tahmini enerji harcaması (TDEE) hakkında bilgilendirme",

      sections: [
        {
          title: "Günlük Kalori İhtiyacı (TDEE) Nedir?",
          paragraphs: [
            "Günlük kalori ihtiyacı (Total Daily Energy Expenditure - TDEE); vücudunuzun yaşamsal faaliyetlerini sürdürmesi için gereken temel enerji (BMR) ile, gün içerisindeki fiziksel aktiviteleriniz (PAL) nedeniyle yaktığınız ekstra enerjinin toplamıdır.",
            "Kilonuzu korumak istiyorsanız harcadığınız kalori kadar besin almanız gerekir. Kilo vermek veya almak isteyenler bu referans değere göre günlük menülerinde kalori açığı veya fazlası oluştururlar."
          ]
        },
        {
          title: "Bazal Metabolizma Hızı (BMR) ve Hesaplama Yöntemi",
          paragraphs: [
            "Hesaplama aracı, bilimsel literatürde en güvenilir modern yöntemlerden biri kabul edilen 'Mifflin-St Jeor' formülünü kullanır. Bu formül; cinsiyetiniz, yaşınız, boyunuz ve kilonuza göre vücudunuzun tam dinlenme (hiç hareket etmeme) halindeki enerji ihtiyacını bulur.",
            "Bulunan BMR değeri, seçtiğiniz fiziksel aktivite faktörü (hareketsizden çok aktife doğru) ile çarpılarak nihai günlük enerji gereksiniminiz elde edilir."
          ]
        },
        {
          title: "Tıbbi Sınırlandırmalar ve Uyarılar",
          paragraphs: [
            "Bu araç, tıbbi bir teşhis veya kesin diyet reçetesi sunmaz. Her bireyin genetiği, kas-yağ kompozisyonu, tiroid gibi hormonal dengeleri ve sağlık geçmişi farklıdır.",
            "Kilo kontrolü (zayıflama veya kilo alma) amacıyla kalori azaltımı veya artırımı yapmadan önce, özellikle kronik bir rahatsızlığınız veya özel bir durumunuz (gebelik vb.) varsa bir beslenme uzmanına (diyetisyen) ve hekiminize danışmanız hayati önem taşır."
          ]
        },
      ],
      example: {
        title: "Tahmini Enerji İhtiyacı Örneği",
        text: "Mifflin-St Jeor formülüne göre bazal metabolizması 1.600 kcal olarak hesaplanan bir kişinin, masa başı ve hareketsiz (sedanter) bir yaşam sürdüğü seçildiğinde (aktivite çarpanı 1.2), günlük toplam kalori ihtiyacı (TDEE) 1.600 x 1.2 = 1.920 kcal olarak hesaplanır. Kişi mevcut kinosunu korumak için günde ortalama bu kadar kalori tüketmelidir."
      },
      sources: [
        {
          name: "Dünya Sağlık Örgütü (WHO) - Enerji İhtiyacı Raporları",
          url: "https://www.who.int/"
        },
        {
          name: "Mifflin-St Jeor Equation (Klinik Araştırmalar)",
          url: "https://pubmed.ncbi.nlm.nih.gov/"
        }
      ]
    },

    relatedCalculators: ['bazal-metabolizma-hizi', 'gunluk-makro-besin-ihtiyaci']
  },
  fields: [
    {
      id: 'cinsiyet',
      label: 'Cinsiyet',
      type: 'select',
      required: true,
      options: [
        { label: 'Erkek', value: 'Erkek' },
        { label: 'Kadın', value: 'Kadın' }
      ]
    },
    { id: 'yas', label: 'Yaş', type: 'number', required: true, min: 1, max: 120 },
    { id: 'boy', label: 'Boy (cm)', type: 'number', required: true, min: 50, max: 250 },
    { id: 'kilo', label: 'Kilo (kg)', type: 'number', required: true, min: 20, max: 300 },
    {
      id: 'aktiviteFaktoru',
      label: 'Fiziksel Aktivite Seviyesi',
      type: 'select',
      required: true,
      options: [
        { label: 'Sedanter (Masa başı iş, az egzersiz)', value: 1.2 },
        { label: 'Hafif Aktif (Haftada 1-3 gün hafif egzersiz)', value: 1.375 },
        { label: 'Orta Aktif (Haftada 3-5 gün orta şiddette egzersiz)', value: 1.55 },
        { label: 'Çok Aktif (Haftada 6-7 gün ağır egzersiz)', value: 1.725 },
        { label: 'Çok Yoğun Aktif (Fiziksel güç gerektiren iş veya profesyonel antrenman)', value: 1.9 }
      ],
      defaultValue: 1.2
    }
  ],
  schema,
  calculate: (input) => calculateKaloriIhtiyaci(input)
};


