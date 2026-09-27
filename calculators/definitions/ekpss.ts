import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateEkpss } from '../formulas/ekpss';

const schema = z.object({
  educationLevel: z.enum(['secondary', 'associate', 'bachelor']),
  gyCorrect: z.number().int().min(0, 'Doğru sayısı 0\'dan küçük olamaz').max(30, 'Doğru sayısı 30\'u aşamaz'),
  gyWrong: z.number().int().min(0, 'Yanlış sayısı 0\'dan küçük olamaz').max(30, 'Yanlış sayısı 30\'u aşamaz'),
  gkCorrect: z.number().int().min(0, 'Doğru sayısı 0\'dan küçük olamaz').max(30, 'Doğru sayısı 30\'u aşamaz'),
  gkWrong: z.number().int().min(0, 'Yanlış sayısı 0\'dan küçük olamaz').max(30, 'Yanlış sayısı 30\'u aşamaz')
}).refine(data => data.gyCorrect + data.gyWrong <= 30, {
  message: 'Genel Yetenek doğru ve yanlış toplamı 30 soruyu aşamaz.',
  path: ['gyCorrect']
}).refine(data => data.gkCorrect + data.gkWrong <= 30, {
  message: 'Genel Kültür doğru ve yanlış toplamı 30 soruyu aşamaz.',
  path: ['gkCorrect']
});

type Input = z.infer<typeof schema>;

export const ekpssCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ekpss_001',
  slug: 'ekpss-puan',
  status: 'published',
  name: 'EKPSS Puan Hesaplama',
  shortDescription: '2026-EKPSS Genel Yetenek ve Genel Kültür testlerindeki doğru ve yanlış sayılarınıza göre netinizi hesaplayın. EKPSSP1, EKPSSP2 ve EKPSSP3 türünüzü öğrenin.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'EKPSS Puan Hesaplama 2026 | Hesapera',
    description: '2026 EKPSS (Engelli Kamu Personeli Seçme Sınavı) net hesaplama aracı. P1, P2, P3 puan türünüzü öğrenin. Kesin ÖSYM sınav puanı standart sapmaya bağlıdır.',
    keywords: ["ekpss puan hesaplama", "ekpss net hesaplama", "ekpssp1", "ekpssp2", "ekpssp3", "ekpss 2026", "engelli memur sınavı"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/ekpss-puan',
    faq: [
      {
        question: "EKPSS kaç sorudur?",
        answer: "2026 EKPSS kılavuzuna göre adaylara toplam 60 soru sorulmaktadır."
      },
      {
        question: "Genel Yetenek kaç soru?",
        answer: "Genel Yetenek testinde toplam 30 soru bulunmaktadır."
      },
      {
        question: "Genel Kültür kaç soru?",
        answer: "Genel Kültür testinde toplam 30 soru bulunmaktadır."
      },
      {
        question: "4 yanlış 1 doğruyu götürür mü?",
        answer: "Evet, EKPSS'de her test bölümü için 4 yanlış cevap 1 doğru cevabı götürmektedir."
      },
      {
        question: "EKPSS neti nasıl hesaplanır?",
        answer: "Doğru sayınızdan, yanlış sayınızın dörde bölünmesiyle elde edilen sayının çıkarılmasıyla hesaplanır (Doğru - Yanlış/4)."
      },
      {
        question: "Negatif EKPSS neti olabilir mi?",
        answer: "Evet, eğer yanlış sayınızın dörtte biri doğru sayınızdan fazlaysa, o testteki ham puanınız (netiniz) negatif çıkabilir."
      },
      {
        question: "EKPSSP1 kimler için?",
        answer: "EKPSSP1 puan türü, ortaöğretim (lise) düzeyinden EKPSS'ye giren adaylar için hesaplanan puandır."
      },
      {
        question: "EKPSSP2 kimler için?",
        answer: "EKPSSP2 puan türü, ön lisans (2 yıllık üniversite) düzeyinden sınava giren adaylar için hesaplanan puandır."
      },
      {
        question: "EKPSSP3 kimler için?",
        answer: "EKPSSP3 puan türü, lisans (4 yıllık üniversite) düzeyinden sınava giren adaylar için hesaplanan puandır."
      },
      {
        question: "Netlerden kesin EKPSS puanı hesaplanabilir mi?",
        answer: "Hayır, kesin puan hesaplanamaz. ÖSYM, EKPSS puanlarını hesaplarken sınava giren tüm adayların net ortalamalarını ve standart sapmalarını kullanarak bağıl değerlendirme yapar."
      },
      {
        question: "EKPSS ile kura arasındaki fark nedir?",
        answer: "EKPSS'ye ortaöğretim, ön lisans ve lisans mezunları girer ve sınav sonucuna göre yerleştirilir. İlkokul, ortaokul ve ilköğretim mezunları ise sınava girmez, noter huzurunda yapılan kura usulü ile yerleştirilirler."
      }
    ],
    content: {
      intro: 'Engelli Kamu Personeli Seçme Sınavı (EKPSS), engelli vatandaşlarımızın devlet memurluğu kadrolarına yerleştirilmesi amacıyla ÖSYM tarafından düzenlenen merkezi bir sınavdır.',
      sections: [
        {
          title: '2026 EKPSS Kaç Sorudur?',
          paragraphs: [
            '2026 ÖSYM Kılavuzuna göre EKPSS\'de adaylara toplam 60 soru sorulmaktadır. Sınav, çoktan seçmeli sorulardan oluşan iki farklı testten meydana gelir. Adayların öğrenim seviyelerine ve engel gruplarına göre farklı soru kitapçıkları sunulsa da toplam soru sayısı değişmez.'
          ]
        },
        {
          title: 'Genel Yetenek Testi',
          paragraphs: [
            'EKPSS\'de uygulanan testlerden ilki Genel Yetenek testidir. Bu testte adaylara Türkçe ve Matematik alanlarından toplam 30 soru yöneltilir. Genel Yetenek testi, adayların analitik düşünme, okuduğunu anlama ve temel matematiksel işlem yeteneklerini ölçmeyi hedefler.'
          ]
        },
        {
          title: 'Genel Kültür Testi',
          paragraphs: [
            'Sınavın ikinci bölümü olan Genel Kültür testinde de 30 soru bulunmaktadır. Sorular; Atatürk İlkeleri ve İnkılap Tarihi, Temel Yurttaşlık Bilgisi, Türkiye Coğrafyası ve Türk Kültür ve Medeniyetleri gibi konulardan gelir.'
          ]
        },
        {
          title: 'EKPSS Neti Nasıl Hesaplanır?',
          paragraphs: [
            'EKPSS\'de net hesaplaması (ÖSYM\'nin tanımıyla "ham puan" hesaplaması), her bir test için ayrı ayrı yapılır. Bir testteki doğru cevap sayınızdan, yanlış cevap sayınızın dörtte birinin çıkarılması formülü uygulanır.'
          ]
        },
        {
          title: 'Dört Yanlış Bir Doğruyu Nasıl Götürür?',
          paragraphs: [
            'ÖSYM\'nin çoktan seçmeli sınav sistemlerindeki genel kural EKPSS\'de de geçerlidir. İşaretlediğiniz her 4 yanlış soru, bulduğunuz 1 doğru sorunun iptal edilmesine (netten düşülmesine) neden olur. Örneğin, 20 doğru ve 4 yanlışınız varsa, 4 yanlış 1 doğruyu götüreceğinden netiniz 19 olacaktır.'
          ]
        },
        {
          title: 'Negatif Net Olabilir mi?',
          paragraphs: [
            'Evet, matematiksel olarak mümkündür. Eğer bir testte yaptığınız yanlışların dörtte biri, doğru sayınızdan fazlaysa o testten alacağınız net eksi değer (negatif) çıkabilir. Örneğin 0 doğru ve 30 yanlış yapan bir adayın neti -7,50 olacaktır. (Daha detaylı [KPSS Puan Hesaplama](/hesaplama/kpss-puan) incelemelerinde de benzer mantık görülür.)'
          ]
        },
        {
          title: 'EKPSSP1 Nedir?',
          paragraphs: [
            'EKPSSP1, sınava ortaöğretim (lise ve dengi okullar) düzeyinden katılan engelli adaylar için hesaplanan ve atamalarda kullanılan puan türüdür.'
          ]
        },
        {
          title: 'EKPSSP2 Nedir?',
          paragraphs: [
            'EKPSSP2, sınava ön lisans (iki yıllık meslek yüksekokulu vb.) düzeyinden katılan engelli adaylar için hesaplanan puan türüdür.'
          ]
        },
        {
          title: 'EKPSSP3 Nedir?',
          paragraphs: [
            'EKPSSP3, sınava lisans (dört yıllık fakülte ve yüksekokul) düzeyinden katılan engelli adaylar için hesaplanan ve ilgili B Grubu kadro atamalarında kullanılan puan türüdür.'
          ]
        },
        {
          title: 'Kesin EKPSS Puanı Neden Yalnız Netlerden Hesaplanamaz?',
          paragraphs: [
            'ÖSYM, puanlama yaparken bağıl değerlendirme sistemi kullanır. Yani sizin puanınız, o yıl sınava giren diğer tüm adayların başarısına bağlıdır. Tüm adayların netleri toplanarak Türkiye Ortalaması ve Standart Sapma değerleri bulunur. Bu veriler olmadan, yalnızca doğru/yanlış sayılarına bakarak kesinleşmiş, gerçek ÖSYM sınav puanını matematiksel olarak hesaplamak imkânsızdır. Eğer bir site size "kesin puan" veriyorsa, bu rakam geçmiş yılların tahmini bir uydurmasından ibarettir.'
          ]
        },
        {
          title: 'EKPSS ve Kura Arasındaki Fark',
          paragraphs: [
            'EKPSS, ortaöğretim, ön lisans ve lisans mezunları içindir ve yerleştirme puan esasına dayanır. Kura ise ilkokul, ortaokul ve ilköğretim mezunu engelli vatandaşlarımızın devlet memurluğuna yerleştirilmesinde kullanılır. Kura usulünde adaylar herhangi bir yazılı sınava girmez ve dolayısıyla bir "net" veya "puan" hesabı yapılmaz.'
          ]
        },
        {
          title: 'Sonuçlar Nasıl Yorumlanmalı?',
          paragraphs: [
            'Hesapera\'nın sunduğu bu araç, tamamen kılavuza sadık kalarak sınav sonrasında netlerinizi kesin olarak öğrenmenizi sağlar. Puanlama işlemleri resmi olarak açıklanmadan önce gerçek sıralamanızı ve puanınızı bilmek mümkün olmadığından, bu sonuçları sadece kendi performansınızı değerlendirmek için bir referans olarak kullanmalısınız.'
          ]
        }
      ],
      example: {
        title: 'Örnek Net Hesaplaması',
        text: 'Diyelim ki Lisans düzeyinden sınava girdiniz. Genel Yetenek testinde 22 doğru, 6 yanlış yaptınız. Genel Kültür testinde ise 18 doğru, 10 yanlış yaptınız.\nGY Netiniz: 22 - (6/4) = 20,50\nGK Netiniz: 18 - (10/4) = 15,50\nToplam Netiniz: 36,00 olacaktır. Bu net, standart sapma katsayılarıyla birleşerek EKPSSP3 puanınızı oluşturacaktır.'
      },
      sources: [
        { name: '2026-EKPSS ve Kura Başvuru Kılavuzu', url: 'https://www.osym.gov.tr' }
      ]
    },
    relatedCalculators: ["kpss-puan", "yks-puan"]
  },
  fields: [
    {
      "id": "educationLevel",
      "label": "Öğrenim Düzeyi",
      "type": "select",
      "required": true,
      "options": [
        { "value": "secondary", "label": "Ortaöğretim" },
        { "value": "associate", "label": "Ön Lisans" },
        { "value": "bachelor", "label": "Lisans" }
      ],
      "defaultValue": "secondary"
    },
    {
      "id": "gyCorrect",
      "label": "Genel Yetenek Doğru",
      "type": "number",
      "required": true,
      "min": 0,
      "max": 30
    },
    {
      "id": "gyWrong",
      "label": "Genel Yetenek Yanlış",
      "type": "number",
      "required": true,
      "min": 0,
      "max": 30
    },
    {
      "id": "gkCorrect",
      "label": "Genel Kültür Doğru",
      "type": "number",
      "required": true,
      "min": 0,
      "max": 30
    },
    {
      "id": "gkWrong",
      "label": "Genel Kültür Yanlış",
      "type": "number",
      "required": true,
      "min": 0,
      "max": 30
    }
  ],
  schema,
  calculate: (input) => {
    return calculateEkpss(input.educationLevel, input.gyCorrect, input.gyWrong, input.gkCorrect, input.gkWrong);
  }
};
