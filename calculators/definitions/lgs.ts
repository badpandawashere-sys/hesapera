import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLgs } from '../formulas/lgs';

const schema = z.object({
  turkceCorrect:    z.number().int().min(0).max(20),
  turkceWrong:      z.number().int().min(0).max(20),
  matematikCorrect: z.number().int().min(0).max(20),
  matematikWrong:   z.number().int().min(0).max(20),
  fenCorrect:       z.number().int().min(0).max(20),
  fenWrong:         z.number().int().min(0).max(20),
  inkılapCorrect:   z.number().int().min(0).max(10),
  inkılapWrong:     z.number().int().min(0).max(10),
  dinCorrect:       z.number().int().min(0).max(10),
  dinWrong:         z.number().int().min(0).max(10),
  yabancıDilCorrect:z.number().int().min(0).max(10),
  yabancıDilWrong:  z.number().int().min(0).max(10)
});

type Input = z.infer<typeof schema>;

export const lgsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_lgs_001',
  slug: 'lgs-puan',
  status: 'published',
  name: 'LGS Puan Hesaplama',
  shortDescription: '2026 LGS (Liselere Giriş Sınavı) 6 test doğru/yanlış sayılarınıza göre yaklaşık puanınızı (100â€“500) hesaplayın. MEB resmi kılavuzu esas alınmıştır.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'LGS Puan Hesaplama 2026 â€” Liselere Giriş Sınavı | Hesapera',
    description: '2026 LGS Türkçe, Matematik, Fen, İnkılap, Din Kültürü ve Yabancı Dil testleri doğru/yanlış sayılarınıza göre yaklaşık LGS puanınızı hesaplayın.',
    keywords: ['lgs puan hesaplama', 'lgs 2026', 'liselere giriş sınavı puan', 'lgs net hesaplama'],
    canonical: 'https://hesapera.com.tr/hesaplama/lgs-puan',
    faq: [
      {
        question: "LGS'de kaç yanlış bir doğruyu götürüyor?",
        answer: "Yürürlükteki LGS yönergelerine göre 3 yanlış cevap 1 doğru cevabı eksiltmektedir."
      },
      {
        question: "LGS Puanı (MSP) en fazla kaç olabilir?",
        answer: "LGS'de merkezi sınav puanı (MSP) tüm soruların doğru cevaplanması halinde 500 tam puan olarak hesaplanır."
      },
      {
        question: "Katsayısı düşük olan dersleri boş bıraksam olur mu?",
        answer: "Sınavda her net değerlidir. Din, İnkılap veya Yabancı Dil derslerinin ağırlık katsayısı 1 olsa da, standart sapma ve tam puan almak için o alanlardaki soruların da doğru yanıtlanması kritik öneme sahiptir."
      }
    ],
    content: {
      intro: "LGS (Liselere Geçiş Sistemi) puan hesaplaması, netler, yüzdelik dilim ve MEB kuralları hakkında rehber",

      sections: [
        {
          title: "LGS Puanı Nedir?",
          paragraphs: [
            "LGS (Liselere Geçiş Sistemi) Merkezi Sınavı, 8. sınıf öğrencilerinin sınavla öğrenci alan nitelikli liselere (Fen Liseleri, Anadolu Liseleri, vb.) yerleşebilmesi için MEB tarafından uygulanan sınavdır.",
            "Sınav; Sözel Bölüm (Türkçe, T.C. İnkılap Tarihi ve Atatürkçülük, Din Kültürü, Yabancı Dil) ve Sayısal Bölüm (Matematik, Fen Bilimleri) olmak üzere iki oturumdan oluşur."
          ]
        },
        {
          title: "Doğru ve Yanlışların Netlere Etkisi",
          paragraphs: [
            "LGS sistemindeki standart değerlendirme kurallarına göre çoktan seçmeli sorularda 3 yanlış cevap 1 doğru cevabı götürmektedir. Boş bırakılan sorular puanlamayı ne olumlu ne de olumsuz etkiler.",
            "Elde edilen netler (ham puanlar), derslerin MEB tarafından belirlenen ağırlık katsayıları (Örn: Türkçe, Mat, Fen 4 katsayılı; İnkılap, Din, Yabancı Dil 1 katsayılıdır) ile çarpılarak Merkezi Sınav Puanı (MSP) bulunur."
          ]
        },
        {
          title: "LGS Puanı ve Yüzdelik Dilim Ayrımı",
          paragraphs: [
            "Liseye yerleştirmede sadece LGS puanı değil, adayın o yıl sınava giren öğrenciler arasındaki başarı sırasını gösteren 'Yüzdelik Dilim' çok daha belirleyicidir.",
            "Sınavın zor olduğu yıllarda düşük puanla yüksek bir yüzdelik dilime girilebilir. Bu nedenle hesaplama aracındaki tahmini LGS puanı tek başına yerleşme garantisi vermez."
          ]
        },
      ],
      example: {
        title: "Tahmini Sonuçlar Hakkında Uyarı",
        text: "Milli Eğitim Bakanlığı, gerçek LGS puanını hesaplarken testlerin ulusal ortalaması ve standart sapması üzerinden T-Skoru hesaplar. Araç üzerinden yapılan hesaplamalar geçmiş MEB verilerine dayanan yaklaşık sonuçlardır; resmi yerleştirme için mutlaka yıl sonundaki orijinal sınav karnesi esas alınmalıdır."
      },
      sources: [
        {
          name: "MEB - Millî Eğitim Bakanlığı LGS Kılavuzu",
          url: "https://www.meb.gov.tr/"
        }
      ]
    },

    relatedCalculators: ['dgs-puan', 'ales-puan']
  },
  fields: [
    { id: 'turkceCorrect',    label: 'Türkçe Doğru',                            type: 'number', required: true, min: 0, max: 20 },
    { id: 'turkceWrong',      label: 'Türkçe Yanlış',                            type: 'number', required: true, min: 0, max: 20 },
    { id: 'matematikCorrect', label: 'Matematik Doğru',                          type: 'number', required: true, min: 0, max: 20 },
    { id: 'matematikWrong',   label: 'Matematik Yanlış',                         type: 'number', required: true, min: 0, max: 20 },
    { id: 'fenCorrect',       label: 'Fen Bilimleri Doğru',                      type: 'number', required: true, min: 0, max: 20 },
    { id: 'fenWrong',         label: 'Fen Bilimleri Yanlış',                     type: 'number', required: true, min: 0, max: 20 },
    { id: 'inkılapCorrect',   label: 'T.C. İnkılap Tarihi ve Atatürkçülük Doğru', type: 'number', required: true, min: 0, max: 10 },
    { id: 'inkılapWrong',     label: 'T.C. İnkılap Tarihi ve Atatürkçülük Yanlış', type: 'number', required: true, min: 0, max: 10 },
    { id: 'dinCorrect',       label: 'Din Kültürü ve Ahlak Bilgisi Doğru',       type: 'number', required: true, min: 0, max: 10 },
    { id: 'dinWrong',         label: 'Din Kültürü ve Ahlak Bilgisi Yanlış',      type: 'number', required: true, min: 0, max: 10 },
    { id: 'yabancıDilCorrect', label: 'Yabancı Dil (İngilizce) Doğru',           type: 'number', required: true, min: 0, max: 10 },
    { id: 'yabancıDilWrong',  label: 'Yabancı Dil (İngilizce) Yanlış',           type: 'number', required: true, min: 0, max: 10 }
  ],
  schema,
  calculate: (input) => calculateLgs({
    turkceC: input.turkceCorrect,     turkceW: input.turkceWrong,
    matematikC: input.matematikCorrect, matematikW: input.matematikWrong,
    fenC: input.fenCorrect,           fenW: input.fenWrong,
    inkılapC: input.inkılapCorrect,   inkılapW: input.inkılapWrong,
    dinC: input.dinCorrect,           dinW: input.dinWrong,
    yabancıDilC: input.yabancıDilCorrect, yabancıDilW: input.yabancıDilWrong
  })
};

