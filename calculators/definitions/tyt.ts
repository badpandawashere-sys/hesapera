import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateTyt } from '../formulas/tyt';

const schema = z.object({
  turkceCorrect: z.number().int().min(0).max(40),
  turkceWrong: z.number().int().min(0).max(40),
  sosyalCorrect: z.number().int().min(0).max(20),
  sosyalWrong: z.number().int().min(0).max(20),
  matematikCorrect: z.number().int().min(0).max(40),
  matematikWrong: z.number().int().min(0).max(40),
  fenCorrect: z.number().int().min(0).max(20),
  fenWrong: z.number().int().min(0).max(20)
});

type Input = z.infer<typeof schema>;

export const tytCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_tyt_001',
  slug: 'tyt-puan',
  status: 'published',
  name: 'TYT Puan Hesaplama',
  shortDescription: 'ÖSYM 2026-YKS Türkçe, Sosyal Bilimler, Matematik ve Fen Bilimleri test netlerinizi girerek TYT Sınav Puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'TYT Puan Hesaplama 2026 | Hesapera',
    description: '2026-YKS Temel Yeterlilik Testi (TYT) netlerinize göre standart sapma tahmini ile yaklaşık TYT sınav puanınızı hesaplayın.',
    keywords: ['tyt puan hesaplama', 'tyt net hesaplama', '2026 tyt', 'yks tyt puan'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/tyt-puan',
    faq: [
      {
        question: "TYT puanı hesaplarken standart sapma dikkate alınıyor mu?",
        answer: "Gerçek TYT sınavında ÖSYM standart sapmayı uygular. Hesaplama aracımız ise geçmiş yıllara ait katsayı ortalamalarını baz alarak gerçeğe en yakın tahmini sonucu oluşturur."
      },
      {
        question: "4 yanlış 1 doğruyu götürür mü?",
        answer: "Evet, YKS ve TYT formatındaki tüm ÖSYM sınavlarında 4 yanlış cevap 1 doğru cevabı eksiltmektedir."
      },
      {
        question: "OBP diploma notu TYT'ye ne kadar etki eder?",
        answer: "Genel kural olarak diploma notunuzun (100 üzerinden) 0,6 ile çarpılmasıyla elde edilen puan TYT ham puanınıza eklenerek yerleştirme puanınız bulunur."
      }
    ],
    content: {
      intro: "TYT (Temel Yeterlilik Testi) puan hesaplaması, netler ve Ortaöğretim Başarı Puanı (OBP) ilişkisi hakkında rehber",

      sections: [
        {
          title: "TYT Puanı Nedir?",
          paragraphs: [
            "Yükseköğretim Kurumları Sınavı'nın (YKS) ilk oturumu olan TYT (Temel Yeterlilik Testi), üniversite adaylarının temel yetkinliklerini ölçen ve YKS'nin tüm puan türleri için taban oluşturan sınavdır.",
            "TYT puanı, Türkçe, Sosyal Bilimler, Temel Matematik ve Fen Bilimleri testlerindeki doğru ve yanlış cevaplarınıza göre hesaplanan ham puana (varsa OBP eklenerek) ulaşılan yerleştirme puanıdır."
          ]
        },
        {
          title: "TYT Neti Nasıl Hesaplanır?",
          paragraphs: [
            "ÖSYM'nin genel değerlendirme kurallarına göre çoktan seçmeli sınavlarda kural olarak 4 yanlış 1 doğru cevabı götürmektedir. Sınavda boş bırakılan soruların net hesabına olumlu veya olumsuz bir etkisi yoktur.",
            "Örneğin Türkçe testinden 30 doğru ve 8 yanlışınız varsa, 8 yanlışınız 2 doğru cevabınızı sileceği için ilgili testteki netiniz 28 olarak hesaplanır."
          ]
        },
        {
          title: "OBP'nin TYT Puanına Etkisi",
          paragraphs: [
            "Lise mezuniyet ortalamanıza göre belirlenen Ortaöğretim Başarı Puanı (OBP), adayın diploma notunun katsayıyla çarpılması (genellikle 0.6 ile) sonucu hesaplanır ve sınavdan aldığınız ham puana eklenerek 'Yerleştirme TYT Puanı' (Y-TYT) elde edilir.",
            "Sınavın zorluk derecesi, standart sapma ve aday katsayıları sınavın yapıldığı yıla göre ÖSYM tarafından istatistiksel olarak oluşturulur."
          ]
        },
      ],
      example: {
        title: "Tahmini Sonuçlar Üzerine Bilgilendirme",
        text: "Hesaplama araçları, geçmiş yıllardaki YKS/TYT verilerini ve standart sapma değerlerini (ortalama test ağırlıklarını) kullanarak 'tahmini' bir puan sunar. Sınavınızın yapılacağı yılın Türkiye ortalamaları belli olmadan kesin bir TYT puanı hesaplanamaz; bu nedenle sonuçlar çalışma hedeflerinizi belirlemek amaçlı öngörü niteliğindedir."
      },
      sources: [
        {
          name: "ÖSYM - YKS Başvuru ve Sınav Kılavuzu",
          url: "https://www.osym.gov.tr/"
        }
      ]
    },

    relatedCalculators: ['obp-okul-puani', 'universite-yks-taban-puanlari']
  },
  fields: [
    { id: 'turkceCorrect', label: 'Türkçe Doğru (Maks 40)', type: 'number', required: true, min: 0, max: 40 },
    { id: 'turkceWrong', label: 'Türkçe Yanlış', type: 'number', required: true, min: 0, max: 40 },
    { id: 'sosyalCorrect', label: 'Sosyal Bilimler Doğru (Maks 20)', type: 'number', required: true, min: 0, max: 20 },
    { id: 'sosyalWrong', label: 'Sosyal Bilimler Yanlış', type: 'number', required: true, min: 0, max: 20 },
    { id: 'matematikCorrect', label: 'Temel Matematik Doğru (Maks 40)', type: 'number', required: true, min: 0, max: 40 },
    { id: 'matematikWrong', label: 'Temel Matematik Yanlış', type: 'number', required: true, min: 0, max: 40 },
    { id: 'fenCorrect', label: 'Fen Bilimleri Doğru (Maks 20)', type: 'number', required: true, min: 0, max: 20 },
    { id: 'fenWrong', label: 'Fen Bilimleri Yanlış', type: 'number', required: true, min: 0, max: 20 }
  ],
  schema,
  calculate: (input) => calculateTyt(
    input.turkceCorrect, input.turkceWrong,
    input.sosyalCorrect, input.sosyalWrong,
    input.matematikCorrect, input.matematikWrong,
    input.fenCorrect, input.fenWrong
  )
};


