import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateVki } from '../formulas/vki';

const schema = z.object({
  boy: z.number().min(50).max(250),
  kilo: z.number().min(20).max(400)
});

type Input = z.infer<typeof schema>;

export const vkiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_vki_001',
  slug: 'vucut-kitle-endeksi',
  status: 'published',
  name: 'Vücut Kitle Endeksi (VKİ) Hesaplama',
  shortDescription: 'Boyunuza ve kilonuza göre Vücut Kitle Endeksinizi (VKİ/BMI) hesaplayın ve WHO standartlarına göre kilonuzun durumunu öğrenin.',
  category: 'health',
  type: 'simple',
  metadata: {
    title: 'Vücut Kitle Endeksi (VKİ / BMI) Hesaplama | Hesapera',
    description: 'Boy ve kilo ölçüleriniz ile Vücut Kitle Endeksinizi (VKİ) hesaplayın. Dünya Sağlık Örgütü (WHO) standartlarında kilonuzun hangi kategoride olduğunu öğrenin.',
    keywords: ['vücut kitle endeksi hesaplama', 'vki hesaplama', 'bmi hesaplama', 'boy kilo endeksi', 'obezite testi'],
    canonical: 'https://hesapera.com.tr/hesaplama/vucut-kitle-endeksi',
    icon: 'HeartPulse',
    faq: [
      {
        question: "VKİ'm yüksek çıkarsa kesin obez miyim?",
        answer: "Hayır. VKİ bir teşhis aracı değil, sadece bir ön tarama (istatistik) aracıdır. Kas kütleniz yüksekse VKİ yüksek çıkabilir. Sağlık durumunuzla ilgili kesin bir sonuca varmak için hekiminize veya bir diyetisyene danışarak vücut yağ oranı ölçümü yaptırmanız gerekir."
      },
      {
        question: "Çocukların boy ve kilosunu buradan hesaplayabilir miyim?",
        answer: "Standart VKİ aracı 18 yaş ve üzeri yetişkinler için tasarlanmıştır. Çocuklar ve ergenler (0-18 yaş) için gelişim eğrilerini (persentil) dikkate alan farklı pediatrik değerlendirme tabloları kullanılır."
      },
      {
        question: "Hesaplama aracı cinsiyet ayrımı yapıyor mu?",
        answer: "Standart VKİ matematiksel formülünde cinsiyet veya yaş çarpanı yoktur. Boy ve kilo oranı üzerinden çalışır. Ancak gerçek vücut yağ oranı ve metabolizma hesaplamalarında cinsiyet ve yaş önemlidir."
      }
    ],
    features: [
      { label: 'Obezite Testi', icon: 'Activity' },
      { label: 'Sağlık Skoru', icon: 'Heart' },
      { label: 'WHO Standartları', icon: 'Globe' }
    ],
    infoBox: {
      title: 'Sağlıklı Bir Beden',
      text: 'Vücudunuzun sinyallerini dinleyin.',
      icon: 'Activity'
    },
    content: {
      intro: "Vücut Kitle Endeksi (VKİ) hesaplaması, sınıflandırmalar ve sonuçların nasıl değerlendirilmesi gerektiği hakkında istatistiksel rehber",

      sections: [
        {
          title: "Vücut Kitle Endeksi (VKİ) Nedir?",
          paragraphs: [
            "Vücut Kitle Endeksi (Body Mass Index - BMI), yetişkin bir insanın kilosunun boyuna oranla sağlıklı bir aralıkta olup olmadığını tahmin etmek için kullanılan, Dünya Sağlık Örgütü (WHO) tarafından da referans kabul edilen istatistiksel bir tarama yöntemidir.",
            "VKİ formülü evrensel olarak: Vücut Ağırlığı (kg) / Boy Uzunluğunun Karesi (m²) şeklinde hesaplanır."
          ]
        },
        {
          title: "Sonuçlar ve Yetişkin Sınıflandırması",
          paragraphs: [
            "WHO standartlarına göre, hesaplanan endeks değerinin 18.5'in altında olması 'Zayıf', 18.5 - 24.9 arasında olması 'Normal', 25.0 - 29.9 arasında olması 'Fazla Kilolu' ve 30'un üzerinde olması 'Obezite' kategorisi olarak tanımlanır.",
            "Bu sınıflandırmalar yetişkin ve normal fiziksel aktiviteye sahip bireyler için genel bir çerçeve sunar."
          ]
        },
        {
          title: "Kısıtlamalar (VKİ'nin Tek Başına Yanıltıcı Olabileceği Durumlar)",
          paragraphs: [
            "Bu araç TIBBİ BİR TEŞHİS VEYA TANI KOYMAZ. Vücut Kitle Endeksi, insan vücudundaki kas, yağ ve kemik yoğunluğu oranlarını birbirinden ayıramaz.",
            "Örneğin yoğun kas kütlesine sahip profesyonel sporcuların VKİ değeri, boylarına göre ağır çektikleri için 'Fazla Kilolu' veya 'Obez' sınıfında çıkabilir. Aynı şekilde hamile kadınlarda, gelişme çağındaki çocuk ve ergenlerde (18 yaş altı) standart VKİ formülü ve sınıflandırması yanıltıcı sonuçlar doğurur."
          ]
        },
      ],
      example: {
        title: "İstatistiksel Matematik Örneği",
        text: "Kilosu 70 kg, boyu 1.75 metre olan bir yetişkinin hesaplaması: 70 / (1.75 x 1.75) = 70 / 3.0625 = 22.8 olarak bulunur. Bu değer Dünya Sağlık Örgütü tablosunda 18.5 - 24.9 aralığına denk geldiği için kişi istatistiksel olarak 'Normal' ağırlıkta kabul edilir."
      },
      sources: [
        {
          name: "Dünya Sağlık Örgütü (WHO) - BMI Klasifikasyonu",
          url: "https://www.who.int/"
        },
        {
          name: "T.C. Sağlık Bakanlığı - Obezite Bilgilendirme",
          url: "https://hsgm.saglik.gov.tr/"
        }
      ]
    },

    relatedCalculators: ['ideal-kilo', 'bazal-metabolizma-hizi', 'vucut-yag-orani']
  },
  fields: [
    { id: 'boy', label: 'Boyunuz (cm)', type: 'number', required: true, min: 50, max: 250 },
    { id: 'kilo', label: 'Kilonuz (kg)', type: 'number', required: true, min: 20, max: 400 }
  ],
  schema,
  calculate: (input) => calculateVki(input)
};


