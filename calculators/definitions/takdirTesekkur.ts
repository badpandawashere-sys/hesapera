import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateTakdirTesekkur } from '../formulas/takdirTesekkur';

const schema = z.object({
  egitimSeviyesi: z.enum(['Ortaokul', 'Lise']),
  donemOrtalamasi: z.number().min(0).max(100),
  basarisizDersVarMi: z.boolean(),
  ozursuzDevamsizlik: z.number().min(0),
  disiplinCezasiVarMi: z.boolean(),
  turkceDersiNotu: z.number().min(0).max(100).optional()
});

type Input = z.infer<typeof schema>;

export const takdirTesekkurCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_takdir_tesekkur_001',
  slug: 'takdir-tesekkur',
  status: 'published',
  name: 'Takdir / Teşekkür Belgesi Hesaplama',
  shortDescription: 'Dönem ortalamanız, devamsızlık ve ders başarınıza göre MEB takdir veya teşekkür belgesi alma durumunuzu hesaplayın.',
  category: 'education',
  type: 'simple',
  metadata: {
    title: 'Takdir Teşekkür Hesaplama (Ortaokul & Lise 2026) | Hesapera',
    description: 'Güncel MEB yönetmeliğiyle ortaokul veya lisede takdir, teşekkür belgesi alıp alamayacağınızı devamsızlık ve zayıf kontrolüyle öğrenin.',
    keywords: ['takdir teşekkür hesaplama', 'takdir hesaplama', 'teşekkür hesaplama', 'belge hesaplama meb', 'lise takdir teşekkür', 'ortaokul takdir teşekkür'],
    canonical: 'https://hesapera.com.tr/hesaplama/takdir-tesekkur',
    faq: [
      {
        question: "Ortalamam 84.9 olursa Takdir alabilir miyim?",
        answer: "Yönetmelik kural olarak Takdir belgesi için asgari 85.00 ortalama aramaktadır. Sistem 84.99'u genellikle matematiksel olarak Takdir sınırına yuvarlamaz."
      },
      {
        question: "Zayıf (50'nin altı) dersim varken Takdir veya Teşekkür alabilir miyim?",
        answer: "Mevcut eğitim mevzuatına göre, dönem ağırlıklı puanınız sınırları geçse bile, herhangi bir dersten 50,00'ın altında (zayıf) notunuz varsa veya devamsızlık sınırlarını (örn. 5 gün özürsüz) aşmışsanız belge alamazsınız."
      },
      {
        question: "Ağırlıklı ortalama düz aritmetik ortalamadan neden farklıdır?",
        answer: "Düz ortalamada tüm dersler eşit etkiye sahiptir. Ağırlıklı ortalamada ise dersin haftalık işlenme saati çok olan ders (Örn: Edebiyat, Matematik), karne notunuzu küçük saatli derslere göre daha şiddetli etkiler."
      }
    ],
    content: {
      intro: "Takdir ve Teşekkür Belgesi şartları, ağırlıklı dönem ortalaması ve MEB başarı kriterleri hakkında rehber",

      sections: [
        {
          title: "Takdir ve Teşekkür Belgesi Nedir?",
          paragraphs: [
            "Milli Eğitim Bakanlığı (MEB) mevzuatına göre, eğitim ve öğretim dönemi sonunda öğrencilerin derslerdeki gayret ve başarılarını ödüllendirmek amacıyla verilen onur belgeleridir.",
            "Belge alabilmek için öğrencinin tüm derslerden aldığı dönem puanlarının haftalık ders saatlerine (ağırlıklarına) göre hesaplanan 'Ağırlıklı Dönem Ortalaması'nın belirli eşikleri geçmesi gerekmektedir."
          ]
        },
        {
          title: "Ağırlıklı Ortalama Mantığı",
          paragraphs: [
            "Hesaplamada bir dersin sadece kaç puan olduğu değil, haftada kaç saat (kredi) işlendiği de önemlidir. Örneğin haftada 5 saat görülen Matematik dersinin karne ortalamasına etkisi, haftada 2 saat görülen bir seçmeli dersten çok daha fazladır.",
            "Her dersin puanı haftalık ders saatiyle çarpılır, elde edilen toplam puanlar genel ders saati toplamına bölünerek 'Ağırlıklı Ortalamaya' ulaşılır."
          ]
        },
        {
          title: "Puan Eşikleri ve Ek Şartlar",
          paragraphs: [
            "Geçerli Ortaöğretim Kurumları Yönetmeliğine göre kural olarak ağırlıklı dönem ortalaması 70,00 ile 84,99 arasında olanlar 'Teşekkür', 85,00 ve üzerinde olanlar ise 'Takdir' belgesi almaya hak kazanır.",
            "Ancak sadece not ortalamasını tutturmak yeterli değildir. Güncel MEB mevzuatına göre; özürsüz devamsızlık sınırının aşılmaması, zayıf/başarısız (50.00'nin altında) ders bulunmaması ve disiplin cezasının olmaması gibi ek kısıtlamalar da belgenin kazanılmasında rol oynar."
          ]
        },
      ],
      example: {
        title: "Belge Hesabına İlişkin Hatırlatma",
        text: "Hesaplama aracı sadece girdiğiniz ders saatleri ve notlar üzerinden matematiksel bir ortalama tahmini yapar. Resmi bir belge tahsisi okul idarelerince MEB (e-Okul) altyapısı üzerinden yürütüldüğünden, devamsızlık gibi yasal kısıtlar hesaplama ekranına tam olarak yansımayabilir."
      },
      sources: [
        {
          name: "MEB - Ortaöğretim Kurumları Yönetmeliği",
          url: "https://www.meb.gov.tr/"
        }
      ]
    },

    relatedCalculators: ['lise-ortalama', 'e-okul-not']
  },
  fields: [
    {
      id: 'egitimSeviyesi',
      label: 'Eğitim Seviyesi',
      type: 'select',
      required: true,
      options: [
        { label: 'Ortaokul (5, 6, 7, 8. Sınıf)', value: 'Ortaokul' },
        { label: 'Lise (9, 10, 11, 12. Sınıf)', value: 'Lise' }
      ],
      defaultValue: 'Lise'
    },
    { id: 'donemOrtalamasi', label: 'Dönem Ağırlıklı Ortalamanız (0-100)', type: 'number', required: true, min: 0, max: 100 },
    { id: 'basarisizDersVarMi', label: 'Herhangi Bir Dersten Başarısız (Zayıf) Oldunuz mu?', type: 'checkbox', required: true, defaultValue: false },
    { id: 'ozursuzDevamsizlik', label: 'Özürsüz Devamsızlık (Gün)', type: 'number', required: true, min: 0, defaultValue: 0 },
    { id: 'disiplinCezasiVarMi', label: 'Dönem İçinde Disiplin Cezası Aldınız mı?', type: 'checkbox', required: true, defaultValue: false },
    {
      id: 'turkceDersiNotu',
      label: 'Türkçe Dersi Dönem Notu (0-100)',
      type: 'number',
      required: false,
      min: 0,
      max: 100,
      defaultValue: 100,
      conditions: [
        { fieldId: 'egitimSeviyesi', operator: 'equals', value: 'Ortaokul' }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateTakdirTesekkur(input)
};


