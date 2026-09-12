import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateAge } from '../formulas/age';

const schema = z.object({
  birthDate: z.string().min(1, 'Doğum tarihi seçiniz'),
  targetDate: z.string().optional()
}).refine(data => {
  const parseDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const bDate = parseDate(data.birthDate);
  const tDate = data.targetDate ? parseDate(data.targetDate) : new Date();
  tDate.setHours(0,0,0,0);
  return bDate <= tDate;
}, { message: 'Doğum tarihi, hedef tarihten büyük olamaz', path: ['birthDate'] });

type Input = z.infer<typeof schema>;

export const ageCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_age_001',
  slug: 'yas',
  status: 'published',
  name: 'Yaş Hesaplama',
  shortDescription: 'Doğum tarihinizden bugüne kadar ne kadar zaman geçtiğini detaylı hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Yaş Hesaplama Aracı | Hesapera',
    description: 'Doğum tarihinizden bugüne kadar ne kadar zaman geçtiğini detaylı hesaplayın.',
    keywords: ["yaş hesaplama","doğum günü","kaç yaşındayım"],
    canonical: 'https://hesapera.com.tr/hesaplama/yas',
    icon: 'CalendarDays',
    faq: [
      {
        question: "Hukuken yaş hesabı bu formülle mi yapılıyor?",
        answer: "Evet, resmi (hukuki, askerlik, emeklilik, ehliyet vb.) işlemlerde ay ve gün tam olarak doldurulmadan o yaşa girilmiş kabul edilmez. Aracın hesapladığı 'Yıl' verisi resmi yaşınızı yansıtır."
      },
      {
        question: "Geçmiş bir tarihe göre yaşımı hesaplayabilir miyim?",
        answer: "Evet, 'Bugün' yerine özel bir tarih girerseniz, o tarihteki yaşınızı ve gün farkını rahatlıkla bulabilirsiniz."
      }
    ],
    content: {
      intro: "Doğum tarihine veya belirli bir referans tarihine göre tam yaş (yıl, ay, gün) hesaplama mantığı",

      sections: [
        {
          title: "Yaş Nasıl Hesaplanır?",
          paragraphs: [
            "Yaş hesaplama işlemi, girdiğiniz doğum tarihi ile bulunduğunuz gün (veya seçtiğiniz hedef tarih) arasındaki tam zaman farkının yıl, ay ve gün cinsinden matematiksel olarak ayrıştırılmasıyla gerçekleştirilir."
          ]
        },
        {
          title: "Tam Yaş ile Takvim Yaşı Farkı",
          paragraphs: [
            "Günlük hayatta 'kaçıncı yaşın içinde olduğunuz' (takvim yılı eksi doğum yılı) söylense de, resmi (hukuki) işlemlerde 'doldurulan' veya 'tamamlanan' yaş esas alınır.",
            "Örneğin bugün doğum gününüzden 1 gün öncesiyse, mevcut yaşınızı henüz tam olarak doldurmamışsınız demektir. Hesaplayıcı, gün ve ay hesabı yaparak tam yaşı kusursuz bir şekilde ortaya çıkarır."
          ]
        },
        {
          title: "Artık Yıllar ve Ay Uzunlukları",
          paragraphs: [
            "Şubat ayının 28 veya 29 çekmesi ve ayların 30-31 günden oluşması gün farklarını etkiler. Formül, seçtiğiniz tarihten geriye doğru takvim algoritmasını (artık yılları gözeterek) çalıştırır ve eksi gün farkı çıkması durumunda bir önceki ayın toplam gün sayısını devreye sokar."
          ]
        },
      ],
      example: {
        title: "Tarih Farkı Örneği",
        text: "Diyelim ki 15 Nisan 2000 doğumlusunuz ve hesaplamayı 10 Mayıs 2024 tarihine göre yapıyorsunuz. 2024 - 2000 = 24 yıldır. Nisan (4) ile Mayıs (5) arasında 1 ay fark vardır. Günlerde ise 15 ile 10 arasında eksi gün olduğu için ay farkından 1 ay düşülür (0 ay) ve önceki ayın kalan günleri eklenerek tam yaşınız '23 Yıl, 11 Ay, 25 Gün' olarak hesaplanır."
      }
    },

    features: [
      { label: 'Detaylı Zaman', icon: 'Clock' },
      { label: 'Doğum Günü Sayacı', icon: 'Gift' }
    ],
    relatedCalculators: []
  },
  fields: [
  {
    "id": "birthDate",
    "label": "Doğum Tarihi",
    "type": "date",
    "required": true
  },
  {
    "id": "targetDate",
    "label": "Hedef Tarih (Opsiyonel)",
    "type": "date",
    "required": false,
    "description": "Boş bırakılırsa bugün baz alınır."
  }
],
  schema,
  calculate: (input) => {
    return calculateAge(input.birthDate, input.targetDate);
  }
};


