import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateHmgs } from '../formulas/hmgs';

const schema = z.object({
  system: z.enum(['current', 'legacy']).default('current'),
  hp: z.number().int().min(0).max(120),
  x: z.number().min(0).max(120).optional().nullable(),
  s: z.number().positive().max(120).optional().nullable(),
  b: z.number().min(0).max(120).optional().nullable(),
  cancelled: z.number().int().min(0).max(119).optional().default(0),
});

type Input = z.infer<typeof schema>;

export const hmgsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_hmgs_001',
  slug: 'hmgs-puan',
  status: 'published',
  name: 'HMGS Puan Hesaplama',
  shortDescription: 'HMGS doğru sayınıza göre ham puanınızı hesaplayın; 2026-HMGS/2 ve sonrası göreli değerlendirme sisteminde sınav istatistiklerini kullanarak HMGS puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'HMGS Puan Hesaplama 2026 | Hesapera',
    description: 'HMGS doğru sayınıza göre ham puanınızı hesaplayın; 2026-HMGS/2 ve sonrası göreli değerlendirme sisteminde sınav istatistiklerini kullanarak HMGS puanınızı hesaplayın.',
    keywords: ['hmgs puan hesaplama', 'hmgs 2026', 'hukuk mesleklerine giriş sınavı', 'hmgs hesabı', 'hukuk sınavı puan'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/hmgs-puan',
    faq: [
      {
        question: 'HMGS kaç sorudur?',
        answer: 'Hukuk Mesleklerine Giriş Sınavı (HMGS) toplam 120 sorudan oluşmaktadır.'
      },
      {
        question: 'HMGS sınav süresi kaç dakikadır?',
        answer: 'HMGS adaylarına 120 soru için toplam 155 dakika süre verilmektedir.'
      },
      {
        question: 'Yanlış cevaplar doğru cevapları götürür mü?',
        answer: 'Hayır, HMGS puan hesaplamasında yanlış cevaplar doğru cevapları götürmez. Yalnızca doğru cevapladığınız sorular değerlendirmeye alınır.'
      },
      {
        question: 'HMGS ham puanı nedir?',
        answer: 'HMGS değerlendirmesinde ham puan (HP), adayın sınavda verdiği doğru cevap sayısıdır. Yanlışlar doğruları götürmediği için doğrularınız doğrudan ham puanınızdır.'
      },
      {
        question: 'HMGS başarı puanı kaçtır?',
        answer: 'Sınavda başarılı sayılmak için 100 üzerinden en az 70 puan alma şartı bulunmaktadır.'
      },
      {
        question: '2026-HMGS/2 puanı nasıl hesaplanır?',
        answer: '2026-HMGS/2 itibarıyla puanlar sadece kendi doğrunuza göre değil, sınava giren tüm adayların ortalaması (X), standart sapması (S) ve en yüksek ham puanına (B) dayalı özel bir formülle hesaplanır.'
      },
      {
        question: 'X değeri nedir?',
        answer: 'X değeri, sınava katılan tüm adayların ham puanlarının ortalamasını ifade eden istatistiksel bir değerdir.'
      },
      {
        question: 'S standart sapma nedir?',
        answer: 'S değeri, sınav sonucunda adayların ham puanlarının ortalamadan ne kadar saptığını gösteren standart sapma değeridir.'
      },
      {
        question: 'B en yüksek ham puan nedir?',
        answer: 'B değeri, o sınav dönemi içinde herhangi bir adayın aldığı en yüksek ham puan (doğru sayısı) değeridir.'
      },
      {
        question: 'X/S/B bilinmeden kesin HMGS puanı hesaplanabilir mi?',
        answer: 'Hayır. Göreli değerlendirme sisteminde adayın puanı diğer adayların başarısına bağlı olduğu için sınav istatistikleri (X, S, B) ÖSYM tarafından açıklanmadan kesin puan hesaplanamaz.'
      },
      {
        question: '84 doğru neden artık kesin 70 puan değildir?',
        answer: 'Önceki oransal sistemde 120 soruda 84 doğru sabit olarak 70 puana denk geliyordu. Ancak yeni göreli değerlendirme sisteminde puanınız tüm adayların ortalamasına ve standart sapmasına göre değişeceği için 84 doğrunun karşılığı 70 puanın altında veya üstünde olabilir.'
      },
      {
        question: '2026-HMGS/1 ve önceki sistem nasıl çalışıyordu?',
        answer: 'Daha önceki sistemde adayların doğrudan doğru sayıları geçerli soru sayısına orantılanarak 100 üzerinden puanlanıyordu. Adayın başarısı diğer adaylara bağlı değildi.'
      },
      {
        question: 'İptal edilen soru eski sistemde puanı nasıl etkiler?',
        answer: 'Eski sistemde iptal edilen sorular toplam soru sayısından çıkarılır ve kalan sorular üzerinden orantılama yapılırdı (örneğin 1 soru iptalinde 119 soru 100 puan üzerinden değerlendirilirdi).'
      }
    ],
    relatedCalculators: ['h-kim-ve-savci-yardimciligi-sinavi-puan', 'kpss-puan', 'yks-puan'],
    content: {
      intro: 'HMGS (Hukuk Mesleklerine Giriş Sınavı) puanınızı güncel ÖSYM kurallarına göre hesaplayın.',
      sections: [
        {
          title: 'HMGS (Hukuk Mesleklerine Giriş Sınavı) Nedir?',
          paragraphs: [
            'HMGS, hukuk fakültesi mezunlarının avukatlık stajı ile hâkim ve savcı yardımcılığı sınavına girebilmeleri veya noterlik stajına başlayabilmeleri için başarılı olmaları gereken resmî bir sınavdır. 120 sorudan oluşur ve süresi 155 dakikadır.',
            'Önemli bir kural olarak, yanlış cevaplar doğru cevapları götürmez. Dolayısıyla adayın doğru cevap sayısı doğrudan ham puanını oluşturur. Başarı eşiği 100 üzerinden 70 puandır.'
          ]
        },
        {
          title: '2026-HMGS/2 ve Sonrası Puanlama (Göreli Değerlendirme)',
          paragraphs: [
            '2026-HMGS/2, 27 Eylül 2026 tarihinde uygulandı. Bu sınav itibarıyla puanlama sisteminde göreli değerlendirme yöntemine geçilmiştir. Bu sistemde sadece kendi doğrularınız değil, tüm adayların başarı durumu da puanınızı etkiler: HP (Sizin ham puanınız), X (Ortalama ham puan), S (Standart sapma), B (En yüksek ham puan).',
            'Bu parametreler olmadan (örneğin sınava giren kitle belli olmadan önce) kesin bir HMGS puanı hesaplanamaz. Kesin sonuç, X, S ve B istatistikleri açıklandığında formül üzerinden hesaplanır. ÖSYM sınav takvimine göre sonuçların 22 Ekim 2026 tarihinde açıklanması planlanmaktadır.'
          ]
        },
        {
          title: '2026-HMGS/1 ve Öncesi (Oransal Sistem)',
          paragraphs: [
            'Daha önceki sistemde puanlama, iptal edilen sorular haricindeki geçerli soru sayısı üzerinden doğrudan orantı kurularak yapılıyordu. İptal edilen bir soru varsa, değerlendirme 119 soru üzerinden 100 puana tamamlanıyordu. Önceki sistemde (iptal soru olmadığında) 84 doğru direkt olarak 70 puana denk geliyordu. Ancak yeni sistemde 84 doğru doğrudan sabit 70 puan anlamına gelmez; değer sınav istatistiklerine göre değişir.'
          ]
        }
      ]
    }
  },
  fields: [
    {
      id: 'system',
      label: 'Dönem / Puanlama Sistemi',
      type: 'select',
      required: true,
      options: [
        { value: 'current', label: '2026-HMGS/2 ve sonrası (Göreli Değerlendirme)' },
        { value: 'legacy', label: '2026-HMGS/1 ve öncesi (Oransal Değerlendirme)' }
      ],
      defaultValue: 'current'
    },
    {
      id: 'hp',
      label: 'Doğru Sayısı',
      type: 'number',
      required: true,
      min: 0,
      max: 120,
    },
    {
      id: 'x',
      label: 'Ortalama Ham Puan (X)',
      type: 'number',
      required: false,
      min: 0,
      max: 120,
      conditions: [
        { fieldId: 'system', operator: 'equals', value: 'current' }
      ]
    },
    {
      id: 's',
      label: 'Standart Sapma (S)',
      type: 'number',
      required: false,
      min: 0,
      max: 120,
      conditions: [
        { fieldId: 'system', operator: 'equals', value: 'current' }
      ]
    },
    {
      id: 'b',
      label: 'En Yüksek Ham Puan (B)',
      type: 'number',
      required: false,
      min: 0,
      max: 120,
      conditions: [
        { fieldId: 'system', operator: 'equals', value: 'current' }
      ]
    },
    {
      id: 'cancelled',
      label: 'İptal Edilen Soru Sayısı',
      type: 'number',
      required: false,
      min: 0,
      max: 119,
      defaultValue: 0,
      conditions: [
        { fieldId: 'system', operator: 'equals', value: 'legacy' }
      ]
    }
  ],
  schema,
  calculate: (input) => {
    return calculateHmgs(
      input.system,
      input.hp,
      input.x ?? undefined,
      input.s ?? undefined,
      input.b ?? undefined,
      input.cancelled ?? 0
    );
  }
};
