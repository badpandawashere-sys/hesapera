import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKpss } from '../formulas/kpss';

const schema = z.object({
  level: z.enum(['lisans', 'onlisans', 'ortaogretim']),
  scoreType: z.enum(['KPSSP1', 'KPSSP3', 'KPSSP93', 'KPSSP94']).optional(),
  gyCorrect: z.number().int().min(0).max(60),
  gyWrong: z.number().int().min(0).max(60),
  gkCorrect: z.number().int().min(0).max(60),
  gkWrong: z.number().int().min(0).max(60)
});

type Input = z.infer<typeof schema>;

export const kpssCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_kpss_001',
  slug: 'kpss-puan',
  status: 'published',
  name: 'KPSS Puan Hesaplama',
  shortDescription: '2026 KPSS Genel Yetenek ve Genel Kültür doğru/yanlış sayılarınıza göre netlerinizi hesaplayın; P1, P3, P93 ve P94 puan türlerini inceleyin.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'KPSS Puan ve Net Hesaplama 2026 | Hesapera',
    description: '2026 KPSS Genel Yetenek ve Genel Kültür doğru/yanlış sayılarınıza göre netlerinizi hesaplayın; KPSSP1, KPSSP3, KPSSP93 ve KPSSP94 puan türlerinin resmî değerlendirme yöntemini inceleyin.',
    keywords: ['kpss puan hesaplama', 'kpss 2026', 'kpssp3 hesaplama', 'kpss gk gy net', 'kpssp93 hesaplama', 'kpssp94 hesaplama', 'kpssp1'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/kpss-puan',
    faq: [
      {
        question: "KPSS'de 4 yanlış 1 doğruyu götürür mü?",
        answer: "Evet, KPSS lisans, önlisans ve ortaöğretim sınavlarında Genel Yetenek ve Genel Kültür testlerindeki her 4 yanlış cevap, 1 doğru cevabı eksiltmektedir."
      },
      {
        question: "Genel Yetenek (GY) testi kaç sorudur?",
        answer: "Lisans, Önlisans ve Ortaöğretim düzeylerinin tamamında Genel Yetenek testinde 60 soru sorulmaktadır."
      },
      {
        question: "Genel Kültür (GK) testi kaç sorudur?",
        answer: "Lisans, Önlisans ve Ortaöğretim düzeylerinin tamamında Genel Kültür testinde 60 soru sorulmaktadır."
      },
      {
        question: "Önlisans sınavı kaç sorudur?",
        answer: "Önlisans KPSS'de 60 Genel Yetenek ve 60 Genel Kültür olmak üzere toplam 120 soru yer almaktadır. Sınav süresi 130 dakikadır."
      },
      {
        question: "Lisans KPSSP3 nedir?",
        answer: "KPSSP3, üniversitelerin lisans (4 yıllık) bölümlerinden mezun olan adayların B Grubu memur kadrolarına atanmalarında kullanılan temel puan türüdür."
      },
      {
        question: "KPSSP1 nedir?",
        answer: "KPSSP1, genellikle Merkez Bankası, bazı bakanlıklar ve uzmanlık kadroları gibi A Grubu kariyer meslekleri için GY ağırlıklı değerlendirme yapan bir lisans puan türüdür."
      },
      {
        question: "KPSSP93 nedir?",
        answer: "KPSSP93, Meslek Yüksekokulları (2 yıllık önlisans) mezunlarının B Grubu memuriyet atamaları için kullanılan resmi KPSS puan türüdür."
      },
      {
        question: "KPSSP94 nedir?",
        answer: "KPSSP94, lise ve dengi okullardan (ortaöğretim) mezun olan adayların memur atamaları için kullanılan resmi KPSS puan türüdür."
      },
      {
        question: "KPSSP1 ağırlıkları nedir?",
        answer: "KPSSP1 puanı hesaplanırken Genel Yetenek (GY) standart puanı %70, Genel Kültür (GK) standart puanı %30 oranında ağırlıklandırılır."
      },
      {
        question: "KPSSP3 ağırlıkları nedir?",
        answer: "KPSSP3 puanı hesaplanırken GY ve GK testlerinin standart puanlarına eşit ağırlık (%50 GY, %50 GK) verilir. Aynı oranlar P93 ve P94 için de geçerlidir."
      },
      {
        question: "Kesin KPSS puanı neden yalnız netten hesaplanamaz?",
        answer: "Çünkü ÖSYM, puanlamada sabit bir katsayı kullanmaz. Adayların netleri (ham puanları) öncelikle Türkiye ortalaması ve standart sapmasıyla standart puanlara dönüştürülür. Bu istatistikler her yıl değiştiğinden, sınav sonrası veriler oluşmadan net bir KPSS puanı hesaplamak matematiksel olarak mümkün değildir."
      },
      {
        question: "Standart puan nedir?",
        answer: "Standart puan, adayın net sayısının, o teste giren tüm adayların net ortalamasından ne kadar farklı olduğunu standart sapma değeri ile orantılayarak gösteren istatistiksel bir ölçüdür."
      },
      {
        question: "Ağırlıklı Standart Puan (ASP) nedir?",
        answer: "Her test için hesaplanan standart puanların, ilgili puan türünün katsayılarıyla (örn. GY %50, GK %50) çarpılıp toplanmasıyla elde edilen puandır. Nihai 100 üzerinden KPSS puanı bu ASP değerleri kullanılarak üretilir."
      },
      {
        question: "Her testte en az 1 net şartı nedir?",
        answer: "ÖSYM kurallarına göre, KPSS puanının hesaplanabilmesi için adayın hem Genel Yetenek hem de Genel Kültür testlerinin her ikisinden de en az 1 ham puanı (1 net) bulunması zorunludur. Aksi halde adayın KPSS puanı hesaplanmaz."
      }
    ],
    content: {
      intro: "KPSS test netlerinin hesaplanması ve ÖSYM resmî değerlendirme süreci rehberi.",
      sections: [
        {
          title: "Doğru ve Yanlışların Netlere Etkisi",
          paragraphs: [
            "KPSS Genel Yetenek (GY) ve Genel Kültür (GK) testlerinde standart olarak 4 yanlış 1 doğruyu götürmektedir. Adayların 'Ham Puan'ı (Net Sayısı) hesaplanırken, doğru sayısından yanlış sayısının dörtte biri çıkarılır. Düşük performans gösteren testlerde negatif nete düşülebilir.",
            "2026 KPSS oturumlarında Lisans, Önlisans ve Ortaöğretim düzeylerinin tamamı 60 GY ve 60 GK olmak üzere toplam 120 sorudan oluşur ve sınav süresi 130 dakikadır."
          ]
        },
        {
          title: "Ağırlıklı Standart Puan (ASP) ve Standart Sapma",
          paragraphs: [
            "ÖSYM, adayların puanlarını hesaplarken sınavın genel zorluk derecesini ve katılımcıların başarı ortalamasını dikkate alan standart sapma yöntemini kullanır.",
            "Öncelikle her testin ortalama (X) ve standart sapma (S) değerleri ile standart puanlar elde edilir. Daha sonra ilgili puan türüne ait ağırlıklar (örneğin KPSSP3 için GY %50, GK %50) kullanılarak ASP oluşturulur. Nihai KPSS puanı, ASP dağılımının ortalama, standart sapma ve en yüksek değerleri kullanılarak ÖSYM'nin resmî değerlendirme formülüyle hesaplanır."
          ]
        },
        {
          title: "Puan Türleri ve Katsayı Ağırlıkları",
          paragraphs: [
            "Lisans mezunlarının genel B Grubu atamalarında KPSSP3 kullanılır (GY %50, GK %50). A Grubu bazı kadrolar için ise KPSSP1 gibi farklı test ağırlıklarına sahip (GY %70, GK %30) puan türleri değerlendirilir.",
            "Önlisans mezunları için KPSSP93 ve Ortaöğretim mezunları için KPSSP94 puan türleri hesaplanır. Bu puan türlerinde de test ağırlıkları %50 Genel Yetenek ve %50 Genel Kültür olarak uygulanır."
          ]
        },
        {
          title: "En Az 1 Net Kuralı",
          paragraphs: [
            "KPSS değerlendirme kılavuzuna göre; adayın KPSSP1, KPSSP3, KPSSP93 veya KPSSP94 gibi puanlarının hesaplanabilmesi için ilgili oturumdaki her iki testten (GY ve GK) ayrı ayrı en az 1 ham puanının (1 net) bulunması zorunludur. Eğer aday herhangi bir testten 1 netin altında kalırsa, ilgili KPSS puanı sistem tarafından hesaplanmaz."
          ]
        }
      ],
      sources: [
        {
          name: "ÖSYM - KPSS Sınav ve Değerlendirme Yönergeleri",
          url: "https://www.osym.gov.tr/"
        }
      ]
    },
    relatedCalculators: ['ekpss-puan', 'ales-puan', 'ags-puan']
  },
  fields: [
    {
      id: 'level',
      label: 'KPSS Düzeyi',
      type: 'select',
      required: true,
      options: [
        { label: 'Lisans', value: 'lisans' },
        { label: 'Önlisans', value: 'onlisans' },
        { label: 'Ortaöğretim', value: 'ortaogretim' }
      ]
    },
    {
      id: 'scoreType',
      label: 'Puan Türü',
      type: 'select',
      required: false,
      options: [
        { label: 'KPSSP3 – GY %50 + GK %50', value: 'KPSSP3' },
        { label: 'KPSSP1 – GY %70 + GK %30', value: 'KPSSP1' },
        { label: 'KPSSP93', value: 'KPSSP93' },
        { label: 'KPSSP94', value: 'KPSSP94' }
      ]
    },
    { id: 'gyCorrect', label: 'Genel Yetenek Doğru', type: 'number', required: true, min: 0, max: 60 },
    { id: 'gyWrong', label: 'Genel Yetenek Yanlış', type: 'number', required: true, min: 0, max: 60 },
    { id: 'gkCorrect', label: 'Genel Kültür Doğru', type: 'number', required: true, min: 0, max: 60 },
    { id: 'gkWrong', label: 'Genel Kültür Yanlış', type: 'number', required: true, min: 0, max: 60 }
  ],
  schema,
  calculate: (input) => calculateKpss(
    input.level,
    input.scoreType || 'KPSSP3',
    input.gyCorrect, input.gyWrong,
    input.gkCorrect, input.gkWrong
  )
};