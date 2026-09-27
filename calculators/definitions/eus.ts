import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateEus } from '../formulas/eus';

const schema = z.object({
  katsayi: z.enum(['2017']),
  durum: z.enum(['1', '2', '3', '4']),
  dogru: z.number().min(-18.75).max(75),
  yanlis: z.number().min(0).max(75).optional()
}).refine(data => {
  if (data.yanlis !== undefined) {
    if (data.dogru < 0) return false;
    return data.dogru + data.yanlis <= 75;
  }
  return true;
}, {
  message: 'Geçersiz doğru veya yanlış sayısı. Doğru ve yanlış toplamı 75\'i geçemez.',
  path: ['dogru']
});

type Input = z.infer<typeof schema>;

export const eusCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_eus_001',
  slug: 'eus-puan',
  status: 'published',
  name: 'EUS Puan Hesaplama',
  shortDescription: '2026-EUS (Eczacılıkta Uzmanlık Eğitimi Giriş Sınavı) puanınızı güncel sınav sistemine göre hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'EUS Puan Hesaplama — Eczacılıkta Uzmanlık Eğitimi Giriş Sınavı | Hesapera',
    description: '2026 EUS (Eczacılıkta Uzmanlık Eğitimi Giriş Sınavı) güncel puan ve net hesaplama aracı. EUS doğru ve yanlış sayılarınızı girerek tahmini standart puanınızı hesaplayın.',
    keywords: ["eus puan hesaplama","eczacılık uzmanlık sınavı","eus 2026","eus hesabı", "eus net hesaplama"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/eus-puan',
    relatedCalculators: ["yks-puan","kpss-puan"],
    content: {

    intro: 'Bu araç ile Eczacılıkta Uzmanlık Eğitimi Giriş Sınavı (EUS) testlerindeki doğru ve yanlış sayınıza göre netinizi ve yerleştirmeye esas tahmini standart puanınızı hesaplayabilirsiniz.',
    sections: [
      {
        title: 'EUS Puanı Nasıl Hesaplanır?',
        paragraphs: [
          'EUS Puanı, adayın Mesleki Bilgi Sınavı testindeki doğru ve yanlış cevapları kullanılarak hesaplanan net sayısı (ham puan) üzerinden standartlaştırma yapılarak elde edilir. Sınav toplam 75 sorudan oluşmakta olup her 4 yanlış cevap 1 doğru cevabı götürmektedir.',
          'Puanın kesin olarak hesaplanabilmesi için sınava giren tüm adayların ortalama ve standart sapma verilerine ihtiyaç vardır. Bu araçta tahmini puan hesaplaması yapılırken, bilinen geçmiş sınavların istatistikleri referans alınmaktadır.'
        ]
      },
      {
        title: 'Yerleştirmeye Esas Puanda Düşüş (%2 Kuralı)',
        paragraphs: [
          'ÖSYM kuralları gereği aşağıdaki durumlarda adayların yerleştirmeye esas mesleki bilgi puanı %2 oranında düşürülmektedir:',
          '- Uzmanlık eğitimine devam etmekte iken sınava girildiğinde,',
          '- Uzmanlık eğitimine devam etmekte iken istifa edenlerin istifalarını takip eden ilk sınavda,',
          '- Bir uzmanlık programına yerleştirildiği hâlde eğitime başlamayanların takip eden ilk sınavda.'
        ]
      },
      {
        title: 'Tercih Barajı ve Yabancı Dil Şartı',
        paragraphs: [
          'EUS sonucuna göre uzmanlık programlarını tercih edebilmek için adayların EUS Mesleki Bilgi Sınavı Puanının en az 45 olması gerekmektedir.',
          'Ayrıca, uzmanlık eğitimine yerleştirme işlemlerinin yapılabilmesi için yabancı dil yeterliliği (YDS, YÖKDİL vb. sınavlardan en az 50 puan) aranmaktadır.'
        ]
      }
    ],
    example: {
      title: 'Örnek Hesaplama',
      text: '75 soruluk sınavda 50 doğru ve 10 yanlış yapan (ve puan kesintisi durumuna girmeyen) bir adayın toplam neti 47,5 olur. İlgili katsayılarla bu netin tahmini EUS Puanı yaklaşık 68,458 olarak hesaplanır.'
    },
    sources: [
      {
        name: 'ÖSYM 2026 EUS Kılavuzu',
        url: 'https://www.osym.gov.tr/'
      }
    ]
  }
  },
  fields: [
    {
      id: "katsayi",
      label: "Katsayı Yılı",
      type: "select",
      required: true,
      options: [
        { value: "2017", label: "2017 Yılı EUS" }
      ],
      defaultValue: "2017"
    },
    {
      id: "durum",
      label: "Durumunuz",
      type: "select",
      required: true,
      options: [
        { value: "1", label: "Uzmanlık eğitimine devam etmekte iken sınava gireceğim" },
        { value: "2", label: "Uzmanlık eğitimine devam etmekte iken istifa edip, istifa sonrası ilk defa sınava gireceğim" },
        { value: "3", label: "Bir uzmanlık programına yerleştiğim halde eğitime başlamayıp, bunun sonrasında ilk defa sınava gireceğim" },
        { value: "4", label: "Yukarıdakilerin hiçbiri" }
      ],
      defaultValue: "4"
    },
    {
      id: "dogru",
      label: "Doğru Sayısı (veya Net)",
      type: "number",
      required: true,
      min: -18.75,
      max: 75
    },
    {
      id: "yanlis",
      label: "Yanlış Sayısı",
      type: "number",
      required: false,
      min: 0,
      max: 75
    }
  ],
  schema,
  calculate: (input) => {
    return calculateEus(input.katsayi, input.durum, input.dogru, input.yanlis);
  }
};
