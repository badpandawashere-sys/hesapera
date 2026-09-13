import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateDersNotu } from '../formulas/dersNotu';

const schema = z.object({
  hesaplamaTuru: z.enum(['basit', 'agirlikli']),
  notlar: z.array(z.object({
    not: z.number().min(0).max(100),
    agirlik: z.number().min(0).optional()
  })).min(1, "En az bir not girmelisiniz.")
});

type Input = z.infer<typeof schema>;

export const dersNotuCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ders_notu_001',
  slug: 'ders-notu',
  status: 'published',
  name: 'Ders Notu Hesaplama',
  shortDescription: 'Bir derse ait sınav, proje veya performans notlarınızı girerek basit veya ağırlıklı ders ortalamanızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Ders Notu ve Ortalama Hesaplama | Hesapera',
    description: 'Vize, final, proje veya performans notlarınızı kullanarak ders başarı durumunuzu ve genel ortalamanızı hesaplayın. Ağırlıklı hesaplama seçeneği mevcuttur.',
    keywords: ['ders notu hesaplama', 'ağırlıklı ortalama hesaplama', 'vize final hesaplama', 'ders ortalaması'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/ders-notu',
    faq: [
      {
        question: "Projeler ders notuna nasıl etki eder?",
        answer: "MEB yönetmeliklerine göre teslim edilen proje ödevinin notu, o dersteki yazılı sınav ve performans notları ile aynı şekilde toplanıp aritmetik ortalamaya dahil edilir."
      },
      {
        question: "Dersin haftalık ders saati (kredisi) bu hesabı etkiler mi?",
        answer: "Bir 'dersin kendi içindeki' notunu hesaplarken ders saati önemli değildir, sadece notların aritmetik ortalaması alınır. Ancak bu dersin 'Karne Ortalamasına (Dönem Ağırlıklı Puanı)' etkisi hesaplanırken, ders saati katsayı olarak kullanılır."
      },
      {
        question: "Sınava giremediğimde ne olur?",
        answer: "Geçerli ve okul idaresince onaylanmış bir mazeretiniz varsa, 'G' (Girmedi) yazılmaz ve mazeret sınavına alınırsınız. Ancak mazeretsiz girilmeyen sınavlar hesaplamada sıfır (0) olarak işleme alınır ve ortalamayı düşürür."
      }
    ],
    content: {
      intro: "Ders başarı notu hesaplaması, sınav, proje ve performans notlarının ağırlıkları hakkında rehber",

      sections: [
        {
          title: "Ders Notu Nasıl Hesaplanır?",
          paragraphs: [
            "İlköğretim ve ortaöğretim kurumlarında bir dersin dönem notu; öğrencinin girdiği yazılı sınavlar, performans çalışmaları (ders içi katılım/sözlü) ve varsa proje ödevlerinden aldığı notların aritmetik ortalaması alınarak belirlenir.",
            "Hesaplama yapılırken ilgili derse ait tüm not kalemleri toplanıp, not sayısına bölünür."
          ]
        },
        {
          title: "Ondalık Sonuçların Yuvarlanması",
          paragraphs: [
            "Okullardaki not değerlendirme sisteminde (e-Okul gibi), elde edilen aritmetik ortalamanın küsuratlı çıkması durumunda genellikle yarım (0.50) ve üzeri değerler bir üst tam sayıya yuvarlanır.",
            "Ancak sınıf geçme ve belge (Takdir/Teşekkür) hesaplamalarında, sistem notların virgülden sonraki dört basamağını dahi dikkate alarak hesaplama yapabilmektedir."
          ]
        },
        {
          title: "Performans ve Proje Notunun Önemi",
          paragraphs: [
            "Sadece yazılı sınav notları değil, öğretmenlerin takdir ettiği performans (sözlü/katılım) ve proje notları da dönem sonu puanınızı doğrudan etkiler. Tüm notlar eşit katsayıda (aritmetik) ortalamaya dahil edildiği için, düşük bir sınav notunu iyi bir performans notuyla yükseltmek mümkündür."
          ]
        },
      ],
      example: {
        title: "Basit Ortalamaya Örnek",
        text: "Bir dersten 1. sınavınız 60, 2. sınavınız 80 olsun. Ayrıca 2 adet performans notunuz 90 ve 90 olsun. Toplam 4 adet notunuz olur: (60 + 80 + 90 + 90) = 320. Bu toplam 4'e bölündüğünde ilgili dersin dönem sonu puanı 80.00 olarak hesaplanır."
      },
      sources: [
        {
          name: "MEB - İlköğretim ve Ortaöğretim Kurumları Yönetmeliği",
          url: "https://www.meb.gov.tr/"
        }
      ]
    },

    relatedCalculators: ['e-okul-not']
  },
  fields: [
    {
      id: 'hesaplamaTuru',
      label: 'Hesaplama Türü',
      type: 'select',
      required: true,
      options: [
        { label: 'Basit Ortalama (Tüm notlar eşit değerde)', value: 'basit' },
        { label: 'Ağırlıklı Ortalama (Kredi veya yüzde ile)', value: 'agirlikli' }
      ]
    },
    {
      id: 'notlar',
      label: 'Ders Notları',
      type: 'array',
      required: true,
      description: 'Lütfen hesaplamak istediğiniz notları girin.',
      subFields: [
        { id: 'not', label: 'Not (0-100)', type: 'number', required: true, min: 0, max: 100 },
        { 
          id: 'agirlik', 
          label: 'Ağırlık / Kredi', 
          type: 'number', 
          required: false, 
          min: 0,
          conditions: [{ fieldId: 'hesaplamaTuru', operator: 'equals', value: 'agirlikli' }] 
        }
      ]
    }
  ],
  schema,
  calculate: (input) => calculateDersNotu(input.notlar, input.hesaplamaTuru === 'agirlikli')
};


