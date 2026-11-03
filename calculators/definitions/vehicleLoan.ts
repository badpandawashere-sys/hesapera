import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateVehicleLoan } from '../formulas/vehicleLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const vehicleLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_vehicleLoan_001',
  slug: 'tasit-kredisi',
  status: 'published',
  name: 'Taşıt Kredisi Hesaplama',
  shortDescription: 'Otomobil veya diğer taşıt alımlarınız için kullanacağınız kredinin taksit ve ödeme planını anında hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Taşıt Kredisi Hesaplama Aracı | Hesapera',
    description: 'Otomobil veya diğer taşıt alımlarınız için kullanacağınız kredinin taksit ve ödeme planını anında hesaplayın.',
    keywords: ["taşıt kredisi","araç kredisi","araba kredisi hesaplama","kredi taksiti"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/tasit-kredisi',
    faq: [
      {
        question: "Taşıt kredisi taksiti nasıl hesaplanır?",
        answer: "Bireysel taşıt kredisi taksitleri; kredi anaparası, bankanın aylık saf faiz oranı ve yasal vergiler (%15 KKDF ve %15 BSMV) eklenerek eşit taksitli (anüite) amortisman formülüyle hesaplanır. Aylık saf faiz oranının %30 fazlası efektif faizi oluşturur."
      },
      {
        question: "Taşıt kredisinde BDDK azami kredi tutarı ve vade sınırları nelerdir?",
        answer: "BDDK düzenlemelerine göre azami kredi tutarı ve vade; aracın içten yanmalı/hibrit/ithal elektrikli mi yoksa özel düzenleme kapsamındaki yerli elektrikli araç mı olduğuna ve nihai fatura/kasko değerine göre belirlenir. Değer arttıkça hem kredi kullandırma oranı (%70'ten %0'a) hem de azami vade (48 aydan 12 aya) kademeli olarak düşer."
      },
      {
        question: "İthal elektrikli araçlar yerli elektrikli araç limitlerinden yararlanabilir mi?",
        answer: "Hayır. BDDK'nın 10586, 10880 ve 11158 sayılı kararları yalnızca Türkiye'de üretilen elektrik motorlu taşıtlar için avantajlı matrah ve vadeler tanımıştır. İthal elektrikli araçlar, Bankaların Kredi İşlemlerine İlişkin Yönetmelik m. 12/A uyarınca 10099 sayılı genel taşıt kredisi sınırlarına tabidir."
      },
      {
        question: "Bu hesaplama bankanın kesin kredi onayı anlamına gelir mi?",
        answer: "Hayır. Bu araç bir matematiksel taksit simülasyonudur. Bankanın nihai kredi onayı; aracın sıfır/ikinci el durumuna, fatura veya kasko değerine, ekspertiz raporuna, müşterinin gelir belgesine ve BDDK limit uygunluğuna göre banka şubesince netleştirilir."
      },
      {
        question: "Bireysel ve ticari taşıt kredisi arasındaki vergi farkı nedir?",
        answer: "Gerçek kişilerin bireysel araç alımlarında faiz üzerinden %15 KKDF ve %15 BSMV kesilir. Şirketler veya işletmeler adına kullanılan ticari taşıt kredilerinde ise KKDF kesintisi yapılmaz (%0) ve BSMV oranı %5 olarak uygulanır (bu hesaplama için Ticari Taşıt Kredisi aracımızı inceleyebilirsiniz)."
      },
      {
        question: "Araç kredisi erken kapatılabilir mi?",
        answer: "Evet. Tüketici Kanunu uyarınca borcun tamamı vadesinden önce ödenebilir. Bu durumda henüz vadesi gelmemiş dönemlere ait faiz, KKDF ve BSMV tutarları düşülerek erken ödeme indirimi uygulanır."
      }
    ],
    content: {
      intro: "Bireysel taşıt kredisi faiz hesaplama, BDDK yasal sınırları, elektrikli araç rejimleri ve vergi yapısı rehberi",
      sections: [
        {
          title: "Taşıt Kredisi Hesaplama Mantığı ve Yasal Vergiler",
          paragraphs: [
            "Bireysel taşıt kredisi, gerçek kişilerin sıfır kilometre veya ikinci el araç alımlarını finanse etmek için kullandıkları eşit taksitli tüketici kredisidir.",
            "Tüketici kredileri mevzuatı gereği, bireysel araç kredilerinde tahakkuk eden aylık faiz üzerinden %15 Kaynak Kullanımını Destekleme Fonu (KKDF) ve %15 Banka ve Sigorta Muameleleri Vergisi (BSMV) olmak üzere toplam %30 yasal vergi kesintisi uygulanır.",
            "Bu hesaplayıcı, kullanıcıların girdikleri tutar ve vadeye göre teorik ödeme planını gösteren bir matematiksel simülasyondur; bankanın tahsis şartlarına veya BDDK yasal uygunluk onayına garanti teşkil etmez."
          ]
        },
        {
          title: "BDDK Taşıt Kredisi Düzenlemeleri: Karar Eşleştirmesi ve Limitler",
          paragraphs: [
            "Bankacılık Düzenleme ve Denetleme Kurulu (BDDK), finansal riskleri sınırlandırmak amacıyla taşıt kredilerinde fatura/kasko değerine dayalı azami kredi tutarı ve azami vade sınırlamaları uygulamaktadır. Kararlar araç niteliğine göre ayrışmaktadır:"
          ],
          bullets: [
            "Genel Taşıt Kredisi Sınırları (BDDK Kararı No: 10099 - 21.02.2022): İçten yanmalı, hibrit ve ithal elektrikli araçlar için geçerlidir. Fatura/kasko değeri 400.000 TL ve altına azami %70 kredi / 48 ay vade; 400.001 - 800.000 TL arasına azami %50 kredi / 36 ay vade; 800.001 - 1.200.000 TL arasına azami %30 kredi / 24 ay vade; 1.200.001 - 2.000.000 TL arasına azami %20 kredi / 12 ay vade verilebilir. 2.000.000 TL üzerindeki araçlara kredi kullandırılamaz (%0).",
            "Türkiye'de Üretilen Elektrik Motorlu Taşıtlar Düzenleme Geçmişi: Yerli üretim elektrikli araçlar için ilk özel genişletme 06.05.2023 tarihli 10586 sayılı kararla yapılmış, ardından 22.02.2024 tarihli 10880 sayılı kararla güncellenmiştir.",
            "Güncel Yerli Elektrikli Taşıt Sınırları (BDDK Kararı No: 11158 - 06.03.2025): Yalnızca Türkiye'de üretilen elektrik motorlu taşıtlar için uygulanır. Değeri 2.500.000 TL ve altına azami %70 kredi / 48 ay vade; 2.500.001 - 5.000.000 TL arasına azami %50 kredi / 36 ay vade; 5.000.001 - 6.500.000 TL arasına azami %30 kredi / 24 ay vade; 6.500.001 - 7.500.000 TL arasına azami %20 kredi / 12 ay vade uygulanır. 7.500.000 TL üzerindeki araçlar için kredi kullandırılamaz (%0).",
            "İthal Elektrikli Taşıtların Hukuki Durumu: Yönetmelik m. 12/A uyarınca özel genişletmeler yalnızca yerli üretim elektrikli taşıtları kapsadığından, ithal elektrik motorlu taşıtlar 10099 sayılı genel kurul kararındaki sınırlara tabidir."
          ]
        },
        {
          title: "Taşıt Kredisinde Ek Masraflar ve Ticari Kredi Ayrımı",
          paragraphs: [
            "Kredi çekerken taksitlerin yanı sıra yasal olarak kredi tutarının binde 5'i kadar kredi tahsis ücreti (+%15 BSMV), rehin tesis ücreti, kasko poliçesi ve hayat sigortası masrafları doğabilir.",
            "İşletmeler ve şirketler adına kullanılan ticari taşıt kredilerinde ise KKDF oranı %0 olup BSMV %5 olarak tahakkuk ettirilir. Ticari araç alımı yapacak kullanıcılarımızın Ticari Taşıt Kredisi hesaplama modülünü kullanmaları önerilir."
          ]
        }
      ],
      example: {
        title: "Adım Adım Sayısal Taşıt Kredisi Simülasyonu",
        text: "Simülasyon Şartları: 500.000 TL kredi anaparası, 36 ay vade, aylık %3,50 faiz oranı (%15 KKDF ve %15 BSMV yasal kesintileri dahil).\n\n1. Efektif Aylık Faiz Oranı: %3,50 × 1,30 = %4,55 (0,0455)\n2. Eşit Aylık Taksit Tutarı: 500.000 × [0,0455 × (1,0455)^36] / [(1,0455)^36 - 1] ≈ 28.491,9074 TL. İlk 35 ayın aylık taksiti 28.491,91 TL'dir.\n3. İlk Ayın Maliyet Dökümü: 500.000 TL anapara üzerinden aylık saf faiz 17.500,00 TL; KKDF (%15) 2.625,00 TL; BSMV (%15) 2.625,00 TL; ödenen anapara 5.741,91 TL; aylık taksit 28.491,91 TL.\n4. Son Ay (36. Ay) Kapanış Taksiti: Kalan son anapara 27.251,72 TL, saf faiz 953,81 TL, KKDF 143,07 TL, BSMV 143,07 TL olmak üzere 28.491,67 TL ile borç tamamen kapatılır.\n5. Toplam Geri Ödeme: 1.025.708,52 TL (500.000,00 TL Anapara + 404.391,16 TL Saf Faiz + 60.658,68 TL KKDF + 60.658,68 TL BSMV). Toplam yasal vergi 121.317,36 TL, toplam finansman faiz maliyeti ise 525.708,52 TL'dir. Amortisman tablosundaki her satırın vergi toplamı ile bu genel toplam kuruşu kuruşuna örtüşmektedir."
      },
      sources: [
        {
          name: "Bankacılık Düzenleme ve Denetleme Kurumu (BDDK) – Karar No: 10099 (Genel Taşıt Sınırları)",
          url: "https://www.bddk.org.tr/"
        },
        {
          name: "Bankacılık Düzenleme ve Denetleme Kurumu (BDDK) – Karar No: 11158 (Yerli Elektrikli Taşıt Sınırları)",
          url: "https://www.bddk.org.tr/"
        },
        {
          name: "T.C. Ticaret Bakanlığı – Tüketici Hakları ve Finansman Rehberi",
          url: "https://tuketici.ticaret.gov.tr/"
        },
        {
          name: "Gelir İdaresi Başkanlığı – Tüketici Kredilerinde BSMV ve KKDF Uygulama Esasları",
          url: "https://www.gib.gov.tr/"
        }
      ]
    },

    relatedCalculators: ['kredi', 'ihtiyac-kredisi', 'yakit-tuketimi', 'mtv-hesaplama']
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateVehicleLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};

