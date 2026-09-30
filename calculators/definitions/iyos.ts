import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateIyos } from '../formulas/iyos';

export const iyosCalculatorDef: CalculatorDefinition<any, any> = {
  id: 'iyos',
  name: 'İYÖS Puan Hesaplama',
  slug: 'iyos-puan',
  shortDescription: 'İdari Yargı Ön Sınavı puanınızı 2026 göreli değerlendirme veya eski oransal sisteme göre hesaplayın.',
  category: 'education',
  type: 'complex',
  status: 'published',
  metadata: {
    title: 'İYÖS Puan Hesaplama 2026 | Hesapera',
    description: '2026 İYÖS doğru sayınıza göre ham puanınızı hesaplayın; sınav istatistikleri biliniyorsa güncel göreli değerlendirme formülüyle İdari Yargı Ön Sınavı puanınızı hesaplayın.',
    canonical: 'https://www.hesapera.com.tr/hesaplama/iyos-puan',
    relatedCalculators: ['hmgs-puan', 'h-kim-ve-savci-yardimciligi-sinavi-puan', 'isg-puan', 'kpss-puan'],
    faq: [
      {
        question: 'İYÖS nedir?',
        answer: 'İdari Yargı Ön Sınavı (İYÖS), idari yargı hakim yardımcılığı sınavına girebilmek veya avukatlık stajına başlayabilmek için geçilmesi gereken temel ön sınavdır.'
      },
      {
        question: 'İYÖS kaç sorudur?',
        answer: 'Sınavda adaylara toplam 120 soru yöneltilmektedir.'
      },
      {
        question: 'İYÖS kaç dakika?',
        answer: 'Sınav süresi toplam 155 dakika olarak uygulanmaktadır.'
      },
      {
        question: 'Yanlışlar doğruları götürür mü?',
        answer: 'Hayır, İYÖS değerlendirmesinde yanlış cevaplar doğru cevapları götürmez. Puanlama tamamen doğru cevap sayısı (ham puan) üzerinden yapılır.'
      },
      {
        question: 'İYÖS başarı puanı kaçtır?',
        answer: 'Adayların başarılı sayılabilmesi için 100 üzerinden en az 70 puan alması gerekmektedir.'
      },
      {
        question: '2026 İYÖS puanı nasıl hesaplanır?',
        answer: '2026 yılı itibarıyla göreli değerlendirme sistemine geçilmiştir. Puanınız; ham puanınız, sınava giren tüm adayların ortalama ham puanı, standart sapma ve sınavdaki en yüksek ham puan kullanılarak matematiksel bir formülle hesaplanır.'
      },
      {
        question: 'Ham puan HP nedir?',
        answer: 'Adayın sınavdaki doğru cevap sayısıdır. Yanlışlar doğruları götürmediği için direkt doğru sayısına eşittir.'
      },
      {
        question: 'X nedir?',
        answer: 'Sınava katılan ve değerlendirmeye alınan tüm adayların ham puanlarının ortalamasıdır (Ortalama Ham Puan).'
      },
      {
        question: 'S nedir?',
        answer: 'Sınava katılan tüm adayların ham puanlarının standart sapmasıdır.'
      },
      {
        question: 'B nedir?',
        answer: 'İlgili sınavda herhangi bir aday tarafından elde edilen en yüksek ham puandır.'
      },
      {
        question: 'X/S/B bilinmeden kesin puan hesaplanabilir mi?',
        answer: 'Hayır, yeni göreli değerlendirme sisteminde sınav istatistikleri (Ortalama, Standart Sapma, En Yüksek Puan) ÖSYM tarafından açıklanmadan kesin başarı puanı hesaplanamaz.'
      },
      {
        question: '84 doğru 70 puan mıdır?',
        answer: 'Eski oransal sistemde 120 soruda 84 doğru sabit 70 puana denk gelirken, yeni göreli değerlendirme sisteminde 84 doğrunun puanı sınav istatistiklerine (X, S, B) göre değişmektedir.'
      },
      {
        question: '2025 İYÖS nasıl hesaplanıyordu?',
        answer: '2025 yılında İYÖS oransal değerlendirme ile hesaplanıyordu. Soru başına sabit puan düşer ve iptal edilen sorular çıkarılarak kalan sorular üzerinden 100 tam puan formülü uygulanırdı.'
      },
      {
        question: 'İptal edilen sorular puanı nasıl etkiler?',
        answer: '2025 gibi oransal sistemlerde iptal edilen sorular toplam soru sayısından düşülür ve kalan geçerli soru sayısı üzerinden her bir sorunun puan değeri artacak şekilde yeniden hesaplama yapılırdı.'
      },
      {
        question: '2026 İYÖS sonuçları ne zaman açıklanacak?',
        answer: 'ÖSYM sınav takvimine göre 27 Eylül 2026 tarihinde uygulanan 2026-İYÖS sonuçlarının 22 Ekim 2026 tarihinde açıklanması planlanmaktadır.'
      }
    ],
    content: {
      intro: '',
      sections: [
        {
                    title: 'İYÖS (İdari Yargı Ön Sınavı) Nedir?',
          paragraphs: ['İYÖS, hukuk mesleklerine giriş kapsamında idari yargı hakim yardımcılığı sınavlarına girmek isteyenlerin veya idari yargıda avukatlık stajı yapacakların başarılı olması gereken temel değerlendirme sınavıdır. ÖSYM tarafından yılda bir kez uygulanır ve başarı eşiği 100 tam puan üzerinden 70 olarak belirlenmiştir.']
        },
        {
                    title: 'Sınavın Yapısı ve Soru Sayısı',
          paragraphs: ['İYÖS toplam 120 sorudan oluşmakta olup sınav süresi 155 dakikadır. Sınav değerlendirmesinde yanlış cevaplar doğru cevapları götürmez, bu nedenle adayların hiçbir soruyu boş bırakmaması avantajınadır. Her adayın doğru cevap sayısı doğrudan onun "Ham Puanını (HP)" oluşturur.']
        },
        {
                    title: 'Konu Ağırlıkları',
          paragraphs: ['Sınavda yer alan konular ve resmî alan ağırlıkları şöyledir: Anayasa Hukuku %7,50, Anayasa Yargısı %2,50, İdare Hukuku %10, Türk İdari Teşkilatı %5, İdari Yargılama Usulü %7,50, Medeni Hukuk %7,50, Borçlar Hukuku (Genel Hükümler) %7,50, Ticari İşletme ve Şirketler Hukuku %2,50, Hukuk Yargılama Usulü %5, Ceza Hukuku (Genel Hükümler) %5, Ceza Yargılama Usulü %2,50, Vergi Hukuku %10, Vergi Usul Hukuku %5, Maliye ve Ekonomi %7,50, İmar ve Çevre Hukuku %2,50, Hukuk Felsefesi ve Sosyolojisi %2,50, Milletlerarası Hukuk %2,50, Milletlerarası Özel Hukuk %2,50, Genel Kamu Hukuku %2,50, Sosyal Güvenlik Hukuku %2,50.']
        },
        {
                    title: '2026 Göreli Değerlendirme Sistemi (Yeni Sistem)',
          paragraphs: ['ÖSYM, 2026 İYÖS ile birlikte Göreli Değerlendirme sistemine geçmiştir. Bu sistemde puanınız sadece doğru sayınıza değil, rakiplerinizin performansına da bağlıdır. Hesaplama şu değişkenlerle yapılır: Adayın Ham Puanı (HP), tüm adayların Ortalama Ham Puanı (X), Standart Sapma (S) ve En Yüksek Ham Puan (B). Bu istatistikler açıklanmadan kesin puan hesaplanamaz.']
        },
        {
                    title: '2025 Oransal Değerlendirme Sistemi (Eski Sistem)',
          paragraphs: ['2025-İYÖS değerlendirmesinde her soru eşit puanlı oransal sistem kullanılıyordu. Bu sistemde 120 soruda 84 doğru yapmak net olarak 70 puana eşitti. Ayrıca 2025-İYÖS sonuç değerlendirmesinde ÖSYM tarafından 75 numaralı sorunun iptal edildiği açıklanmıştır. İptal durumunda o soru değerlendirme dışı bırakılır ve kalan geçerli sorular üzerinden oransal 100 tam puan hesabı yapılırdı.']
        },
        {
                    title: 'Önemli Tarihler',
          paragraphs: ['ÖSYM sınav takvimine göre 27 Eylül 2026 tarihinde uygulanan 2026-İYÖS sonuçlarının 22 Ekim 2026 tarihinde açıklanması planlanmaktadır.']
        }
      ]
    }
  },
  schema: z.any(),
  fields: [
    {
      id: 'system',
      label: 'Dönem / Puanlama Sistemi',
      type: 'select',
      required: true,
      defaultValue: 'current',
      options: [
        { label: '2026-İYÖS (Göreli Değerlendirme)', value: 'current' },
        { label: '2025-İYÖS (Oransal Değerlendirme)', value: 'legacy' }
      ]
    },
    {
      id: 'hp',
      label: 'Ham Puan / Doğru Sayısı (HP)',
      type: 'number',
      required: true,
      min: 0,
      max: 120,
      description: 'Yanlış cevaplar doğru cevapları götürmez. İptal edilen soru varsa ÖSYM\'nin değerlendirmesinde oluşan geçerli ham puanı esas alın.'
    },
    {
      id: 'x',
      label: 'Ortalama Ham Puan (X)',
      type: 'number',
      min: 0,
      max: 120,
      conditions: [{ fieldId: 'system', operator: 'equals', value: 'current' }]
    },
    {
      id: 's',
      label: 'Standart Sapma (S)',
      type: 'number',
      min: 0.0001,
      max: 120,
      conditions: [{ fieldId: 'system', operator: 'equals', value: 'current' }]
    },
    {
      id: 'b',
      label: 'En Yüksek Ham Puan (B)',
      type: 'number',
      min: 0,
      max: 120,
      conditions: [{ fieldId: 'system', operator: 'equals', value: 'current' }]
    },
    {
      id: 'cancelled',
      label: 'İptal Edilen Soru Sayısı',
      type: 'number',
      min: 0,
      max: 119,
      defaultValue: 0,
      conditions: [{ fieldId: 'system', operator: 'equals', value: 'legacy' }]
    }
  ],
  calculate: calculateIyos
};
