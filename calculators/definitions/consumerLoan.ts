import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateConsumerLoan } from '../formulas/consumerLoan';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır').max(100000000, 'Güvenli maksimum limiti aştınız'),
  monthlyInterestRate: z.number().min(0, 'Faiz oranı negatif olamaz').max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number().int('Vade tam sayı olmalıdır').positive('Vade 0 dan büyük olmalıdır').max(360, 'Maksimum 360 ay (30 yıl) desteklenir')
});

type Input = z.infer<typeof schema>;

export const consumerLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_consumerLoan_001',
  slug: 'ihtiyac-kredisi',
  status: 'published',
  name: 'İhtiyaç Kredisi Hesaplama',
  shortDescription: 'Bireysel ihtiyaçlarınız için çekeceğiniz kredinin aylık taksitlerini ve ödeme planını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'İhtiyaç Kredisi Hesaplama Aracı | Hesapera',
    description: 'Bireysel ihtiyaç kredisi faiz oranlarını karşılaştırın, aylık taksit tutarını, toplam geri ödemeyi ve kredi ödeme planınızı detaylıca hesaplayın.',
    keywords: ["ihtiyaç kredisi","bireysel kredi","kredi hesaplama","ödeme planı"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/ihtiyac-kredisi',
    faq: [
      {
        question: "İhtiyaç kredisi taksiti nasıl hesaplanır?",
        answer: "Bireysel ihtiyaç kredisi taksiti; talep edilen anapara tutarı, aylık saf faiz oranı ve yasal vergiler (%15 KKDF ve %15 BSMV) dikkate alınarak eşit taksitli (anüite) formülüyle hesaplanır. Aylık faize %30 vergi çarpanı eklendiğinde efektif aylık faiz oranı elde edilir ve taksitler bu oran üzerinden belirlenir."
      },
      {
        question: "İhtiyaç kredisinde yasal vade sınırları nelerdir?",
        answer: "BDDK'nın 13.02.2025 tarihli ve 11152 sayılı Kararı uyarınca ihtiyaç kredilerinde azami vade sınırları şöyledir: 125.000 TL ve altındaki krediler için en fazla 36 ay; 125.000 TL üzeri ile 250.000 TL dahilindeki krediler için en fazla 24 ay; 250.000 TL üzerindeki krediler için ise azami 12 aydır."
      },
      {
        question: "KKDF ve BSMV nedir, nasıl tahakkuk eder?",
        answer: "KKDF (Kaynak Kullanımını Destekleme Fonu) %15 ve BSMV (Banka ve Sigorta Muameleleri Vergisi) %15 oranında olmak üzere toplam %30 vergi, anapara üzerinden değil, her ay tahakkuk eden saf faiz tutarı üzerinden hesaplanarak taksite eklenir. Borç azaldıkça ödenen vergi tutarı da kuruş bazında azalır."
      },
      {
        question: "Vade uzadıkça ihtiyaç kredisi maliyeti nasıl değişir?",
        answer: "Vade uzadığında aylık taksit tutarı düşer; ancak borçlu kalınan anapara süresi uzadığı için bankaya ödenen toplam faiz ve dolayısıyla yasal vergi yükü belirgin şekilde artar. Bu nedenle bütçenin izin verdiği en kısa vadeli ödeme planını seçmek toplam maliyeti düşürür."
      },
      {
        question: "Hesaplanan taksit tutarı kesin midir?",
        answer: "Hesaplama motorumuz yürürlükteki yasal vergi ve eşit taksit anüite kurallarına göre kuruş hassasiyetinde simülasyon sunar. Ancak bankalar tarafından tahsil edilen kredi tahsis ücreti (azami binde 5), ekspertiz/istihbarat masrafları ve yaşa göre değişen hayat sigortası primleri bankanın nihai teklifinde taksit veya maliyet oranını değiştirebilir."
      }
    ],
    content: {
      intro: "Bireysel ihtiyaç kredisi faiz hesaplama, yasal vergiler ve BDDK vade sınırları hakkında kapsamlı rehber",
      sections: [
        {
          title: "İhtiyaç Kredisi Hesaplama Mantığı ve Yasal Vergiler",
          paragraphs: [
            "İhtiyaç kredisi (tüketici kredisi), bireylerin eğitim, sağlık, tatil veya genel nakit ihtiyaçlarını finanse etmek amacıyla bankalardan kullandıkları tüketici finansmanıdır.",
            "Türkiye'de bireysel kredilerde faiz hesaplaması standart eşit taksitli (anüite) amortisman modeliyle yapılır. Tüketici kredilerinde anapara haricinde iki resmî vergi kesintisi bulunur: Gelir İdaresi Başkanlığı mevzuatı uyarınca %15 BSMV ve Bakanlar Kurulu / Cumhurbaşkanı Kararları uyarınca %15 KKDF. Bu vergiler doğrudan aylık saf faiz matrahı üzerinden hesaplanır."
          ],
          bullets: [
            "Aylık Saf Faiz Oranı (r): Bankanın ilan ettiği net faiz oranıdır (Örn: %3,50).",
            "Efektif Aylık Faiz Oranı (r_eff): r × (1 + 0,15 KKDF + 0,15 BSMV) = r × 1,30. Aylık %3,50 saf oran için efektif oran %4,55'tir.",
            "Dönemsel Tahakkuk: Her ay kalan anapara üzerinden saf faiz hesaplanır; bulunan faizin %15'i KKDF, %15'i BSMV olarak takside dahil edilir."
          ]
        },
        {
          title: "BDDK 13.02.2025 / 11152 Sayılı Kararı ile Güncel Vade Sınırları",
          paragraphs: [
            "Bankacılık Düzenleme ve Denetleme Kurulu (BDDK), finansal istikrar ve tüketici borçluluk oranlarını gözeterek ihtiyaç kredilerinde kullandırılabilecek azami vade sınırlarını kredi tutarına göre kademelendirmiştir. 13 Şubat 2025 tarihli ve 11152 sayılı Karar uyarınca yürürlükteki sınır değerler:",
            "Bu limitler yasal azami vadeler olup, bankalar kendi kredi politikalarına veya müşterinin kredi skoruna göre daha kısa vadeler belirleyebilir; ancak bu süreleri aşamaz."
          ],
          bullets: [
            "125.000 TL ve altındaki krediler: Azami 36 ay vade uygulanabilir.",
            "125.000,01 TL ile 250.000 TL arasındaki krediler (250.000 TL dahil): Azami 24 ay vade uygulanabilir.",
            "250.000,01 TL ve üzerindeki krediler: Azami 12 ay vade uygulanabilir."
          ]
        },
        {
          title: "İhtiyaç Kredisi Maliyet Bileşenleri ve Kredi Tahsis Ücreti",
          paragraphs: [
            "Kredi çekerken yalnızca ilan edilen faiz oranına değil, yıllık maliyet oranına (YMO) ve yan giderlere dikkat edilmelidir.",
            "6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca bankalar, kredi anapara tutarının binde 5'inden (kredi tutarı × 0,005) fazla kredi tahsis (dosya) masrafı alamazlar. Ayrıca tahsis ücreti üzerinden %15 BSMV kesilir. Hayat sigortası ise tüketicinin yaşına, kredi tutarına ve sağlık durumuna göre değişkenlik gösterir."
          ]
        }
      ],
      example: {
        title: "Adım Adım Sayısal İhtiyaç Kredisi Örneği",
        text: "Kullanım Şartları: 100.000 TL anapara, 12 ay vade, aylık %3,50 faiz oranı (%15 KKDF ve %15 BSMV dahil).\n\n1. Efektif Aylık Faiz Oranı: %3,50 × 1,30 = %4,55 (0,0455)\n2. Anüite Formülü ile Aylık Taksit: 100.000 × [0,0455 × (1,0455)^12] / [(1,0455)^12 - 1] ≈ 10.998,0086 TL. Standart yuvarlama ile ilk 11 ayın taksiti 10.998,01 TL'dir.\n3. İlk Ayın Ayrışımı: Kalan anapara 100.000 TL üzerinden saf faiz 3.500,00 TL; KKDF (%15) 525,00 TL; BSMV (%15) 525,00 TL; ödenen anapara 6.448,01 TL; toplam taksit 10.998,01 TL.\n4. Son Ay (12. Ay) Kapanış Taksiti: Kalan anapara 10.519,34 TL, saf faiz 368,18 TL, KKDF 55,23 TL, BSMV 55,23 TL olmak üzere 10.997,98 TL ile borç sıfırlanır.\n5. Toplam Geri Ödeme: 131.976,09 TL (100.000,00 TL Anapara + 24.596,99 TL Saf Faiz + 3.689,55 TL KKDF + 3.689,55 TL BSMV). Tablodaki dönemlik vergilerin toplamı ile genel toplam kuruşu kuruşuna eşittir."
      },
      sources: [
        {
          name: "Bankacılık Düzenleme ve Denetleme Kurumu (BDDK) – Karar No: 11152 (13.02.2025)",
          url: "https://www.bddk.org.tr/"
        },
        {
          name: "T.C. Ticaret Bakanlığı – Tüketicinin Korunması ve Tüketici Kredileri Mevzuatı",
          url: "https://tuketici.ticaret.gov.tr/"
        },
        {
          name: "Gelir İdaresi Başkanlığı (GİB) – 6802 Sayılı Kanun BSMV ve KKDF Hükümleri",
          url: "https://www.gib.gov.tr/"
        }
      ]
    },

    relatedCalculators: ['kredi', 'konut-kredisi', 'tasit-kredisi', 'ne-kadar-kredi-alabilirim']
  },
  fields: [
    { id: 'loanAmount', label: 'Kredi Tutarı', type: 'currency', required: true, min: 0 },
    { id: 'monthlyInterestRate', label: 'Aylık Faiz Oranı (%)', type: 'percentage', required: true, min: 0, step: 0.01 },
    { id: 'termMonths', label: 'Vade (Ay)', type: 'number', required: true, min: 1, max: 360 }
  ],
  schema,
  calculate: (input) => {
    return calculateConsumerLoan(input.loanAmount, input.monthlyInterestRate, input.termMonths);
  }
};


