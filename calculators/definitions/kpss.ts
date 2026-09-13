import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKpss } from '../formulas/kpss';

const schema = z.object({
  level: z.enum(['lisans', 'onlisans', 'ortaogretim']),
  scoreType: z.enum(['KPSSP1', 'KPSSP3']),
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
  shortDescription: 'KPSS Genel Yetenek ve Genel Kültür testleri doğru/yanlış sayılarınıza göre KPSSP1 veya KPSSP3 yaklaşık puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'KPSS Puan Hesaplama â€” GY ve GK Bazlı | Hesapera',
    description: 'KPSS 2026 Genel Yetenek ve Genel Kültür testleri doğru/yanlış sayılarınıza göre KPSSP1 ve KPSSP3 yaklaşık puanınızı hesaplayın.',
    keywords: ['kpss puan hesaplama', 'kpss 2026', 'kpssp3 hesaplama', 'kpss gk gy net'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/kpss-puan',
    faq: [
      {
        question: "Hesaplanan KPSS puanı kesin midir?",
        answer: "Hayır. Hesaplama araçları, geçmiş yıllardaki puan oluşumlarına göre katsayı tahmini yaparak yaklaşık bir sonuç verir. Gerçek puan, sınavın yapıldığı senenin Türkiye ortalaması ve standart sapmasına göre ÖSYM tarafından açıklanan puandır."
      },
      {
        question: "4 yanlış 1 doğruyu götürür mü?",
        answer: "Evet, KPSS lisans, önlisans ve ortaöğretim sınavlarında Genel Yetenek ve Genel Kültür testlerindeki her 4 yanlış cevap, 1 doğru cevabı eksiltmektedir."
      },
      {
        question: "KPSSP3 nedir ve kimler kullanır?",
        answer: "KPSSP3 puan türü, üniversitelerin lisans (4 yıllık) bölümlerinden mezun olan adayların memur (B Grubu kadro) atamalarında kullanılan temel puan türüdür."
      }
    ],
    content: {
      intro: "KPSS puan türleri (KPSSP1, KPSSP3), net hesaplaması ve ÖSYM puanlama mantığı hakkında rehber",

      sections: [
        {
          title: "KPSS Puanı Nasıl Hesaplanır?",
          paragraphs: [
            "Kamu Personel Seçme Sınavı (KPSS) puanları doğrudan 'Net Sayısı x Sabit Bir Katsayı' formülüyle hesaplanmaz. ÖSYM, adayların puanlarını hesaplarken sınavın genel zorluk derecesini ve katılımcıların başarı ortalamasını dikkate alan standart sapma yöntemini kullanır.",
            "Hesaplama araçları ise geçmiş yılların ÖSYM verilerinden yola çıkarak ortalama bir katsayı üzerinden 'tahmini' puanlar üretir."
          ]
        },
        {
          title: "Doğru ve Yanlışların Netlere Etkisi",
          paragraphs: [
            "KPSS Genel Yetenek (GY) ve Genel Kültür (GK) testlerinde standart olarak 4 yanlış 1 doğruyu götürmektedir. Yani adayların testlerden elde ettiği 'Ham Puan' (Net Sayısı) hesaplanırken, doğru sayısından yanlış sayısının dörtte biri çıkarılır.",
            "Elde edilen net sayıları daha sonra standart sapma hesaplamalarına dahil edilerek adayın ilgili puan türündeki skoru oluşturulur."
          ]
        },
        {
          title: "Puan Türlerinin Katsayı Farklılıkları",
          paragraphs: [
            "KPSSP3 (Lisans B Grubu) gibi en yaygın kullanılan puan türlerinde genellikle Genel Yetenek testinin ağırlığı %50, Genel Kültür testinin ağırlığı %50'dir.",
            "Farklı memuriyet kadroları veya kurum sınavları (örneğin Merkez Bankası veya bazı uzmanlık kadroları) için kullanılan KPSSP1 gibi farklı puan türlerinde ise GY ve GK katsayı ağırlıkları değişebilmektedir (Örn: GY %70, GK %30 ağırlığında olabilir)."
          ]
        },
      ],
      example: {
        title: "Tahmini Net ve Puan Örneği",
        text: "Lisans düzeyinde sınava giren bir adayın Genel Yetenek testinde 45 doğru, 12 yanlış yaptığını varsayalım. 12 yanlış 3 doğruyu götüreceği için adayın GY neti 42 olacaktır. Genel Kültür testinde ise 50 doğru, 4 yanlış yaptığında neti 49 olur. Toplamda 91 net üzerinden o yılın sınav zorluğuna ve ortalamasına bağlı olarak tahmini bir KPSSP3 puanı üretilir."
      },
      sources: [
        {
          name: "ÖSYM - Sınav ve Değerlendirme Yönergeleri",
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
        { label: 'Lisans (GY: 60 soru, GK: 60 soru)', value: 'lisans' },
        { label: 'Önlisans (GY: 40 soru, GK: 40 soru)', value: 'onlisans' },
        { label: 'Ortaöğretim (GY: 40 soru, GK: 40 soru)', value: 'ortaogretim' }
      ]
    },
    {
      id: 'scoreType',
      label: 'Puan Türü',
      type: 'select',
      required: true,
      options: [
        { label: 'KPSSP3 â€” GY %50 + GK %50', value: 'KPSSP3' },
        { label: 'KPSSP1 â€” GY %30 + GK %70', value: 'KPSSP1' }
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
    input.scoreType,
    input.gyCorrect, input.gyWrong,
    input.gkCorrect, input.gkWrong
  )
};

