import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoanFee } from '../formulas/loanFee';

const schema = z.object({
  loanAmount: z.number().positive('Kredi tutarı 0\'dan büyük olmalıdır'),
  loanType: z.enum(['ihtiyac', 'konut', 'tasit', 'ticari']).default('ihtiyac'),
  hasExistingHome: z.boolean().default(false),
  feeRate: z.number().min(0, 'Oran negatif olamaz').default(0.5),
  customFeeAmount: z.number().min(0).optional(),
  commercialKind: z.enum(['taksitli_tl', 'rotatif_tl', 'doviz']).default('taksitli_tl').optional(),
  commercialLimitAmount: z.number().min(0).optional(),
  commercialLimitMonths: z.number().int().min(1).default(12).optional(),
  termDays: z.number().int().min(1).default(360).optional(),
  termMonths: z.number().int().min(1).default(12).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  rotatifAverageBalance: z.number().min(0).optional(),
  commercialLimitFeeRate: z.number().min(0).default(0.20).optional(),
  commercialUsageFeeRate: z.number().min(0).default(1.10).optional(),
  customLimitFeeAmount: z.number().min(0).optional(),
  customUsageFeeAmount: z.number().min(0).optional(),
  includeBsmv: z.boolean().default(true),
  valuationFee: z.number().min(0).optional(),
  mortgageFee: z.number().min(0).optional(),
  insuranceFee: z.number().min(0).optional(),
  otherExpenses: z.number().min(0).optional(),
  deductionMode: z.enum(['deduct_all', 'deduct_bank_fee_only', 'pay_separately']).default('deduct_all'),
});

type Input = z.infer<typeof schema>;

export const loanFeeCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loanFee_001',
  slug: 'kredi-dosya-masrafi',
  status: 'published',
  name: 'Kredi Dosya Masrafı Hesaplama',
  shortDescription: 'İhtiyaç, konut, taşıt ve ticari kredilerde yasal tahsis ücreti, TCMB 2020/4 Madde 9 limit ve kullandırım ücretleri, 7491 SK konut BSMV kuralları ve net ele geçen tutarı hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Dosya Masrafı Hesaplama 2026 | Hesapera',
    description: 'İhtiyaç, konut, taşıt ve ticari kredilerde kredi tahsis ücreti, 7491 SK konut BSMV istisnası, TCMB 2020/4 Madde 9 ticari limit ve gün bazlı kullandırım tavanları ile elinize geçecek net tutarı hesaplayın.',
    keywords: [
      'kredi dosya masrafı hesaplama',
      'kredi tahsis ücreti 2026',
      'konut kredisi bsmv 7491',
      'ticari kredi kullandırım ücreti tcmb',
      'tcmb 2020/4 madde 9',
      'ticari kredi limit tahsis ücreti',
      'krediden kesilen masraf hesaplama',
      'kredi net ele geçen tutar'
    ],
    canonical: 'https://www.hesapera.com.tr/hesaplama/kredi-dosya-masrafi',
    faq: [
      {
        question: 'Kredi dosya masrafı (kredi tahsis ücreti) yasal olarak ne kadardır?',
        answer: 'TCMB’nin 2020/7 sayılı Finansal Tüketicilerden Alınacak Ücretlere İlişkin Tebliği Madde 10 gereğince, tüketici kredilerinde (ihtiyaç, konut, taşıt) kredi tahsis ücreti kullandırılan kredi anaparasının binde beşini (%0,50) geçemez. Örneğin 100.000 TL kredi için bankanın alabileceği azami tahsis ücreti 500 TL’dir.',
      },
      {
        question: 'Konut kredilerinde BSMV istisnası kimler için geçerlidir (7491 Sayılı Kanun ve 6802 Sayılı Kanun m. 29/y)?',
        answer: '28 Aralık 2023 tarihli Resmî Gazete’de yayımlanan 7491 sayılı Kanun’un 35. maddesi ile 6802 sayılı Gider Vergileri Kanunu m. 29/y bendi değiştirilmiştir. Kredi kullanım tarihi itibarıyla kendisinin, eşinin veya 18 yaşını doldurmamış çocuklarının maliki olduğu tapuda kayıtlı hiçbir konutu bulunmayan kişilerin (ilk evini alanların) kullandığı konut kredilerinde %0 BSMV istisnası devam eder.\n\nHisseli Konut Durumu (GİB 11.11.2024 tarih ve 1600427 sayılı Özelgesi): Gelir İdaresi Başkanlığı\'nın (GİB) 11.11.2024 tarihli ve 1600427 sayılı özelgesi, doğrudan kredi kullanan kişinin kendi adına kayıtlı konut hissesini (paylı mülkiyetini) konu almaktadır. Özelgede, kanun lafzında herhangi bir asgari hisse oranı veya pay büyüklüğü sınırı yer almadığından, kredi kullananın kendi üzerinde hisseli de olsa tapu kaydı bulunması halinde konut maliki sayılacağı ve %0 istisnadan yararlanılamayacağı belirtilmiştir. Eş veya 18 yaş altı çocukların malikliği şartı ise 6802 SK m. 29/y kanun metninde yer alan genel kapsam çerçevesinde bankalarca tapu sorgulamasıyla ayrıca değerlendirilir.\n\nTahsis Ücreti BSMV\'si ile Kredi Faiz BSMV\'sinin Ayrımı: Bu hesaplayıcı, bankanın tek seferlik tahsil ettiği kredi tahsis ücreti (dosya masrafı) üzerindeki BSMV\'yi hesaplar. Kredinin aylık taksitlerindeki faiz üzerinden alınan BSMV ise geri ödeme takvimi boyunca dönemsel olarak ödenen ayrı bir vergi kalemidir.',
      },
      {
        question: 'Ticari kredilerde kredi tahsis ve kullandırım ücreti üst sınırları nelerdir (TCMB 2020/4 Madde 9)?',
        answer: 'TCMB’nin 2020/4 sayılı Tebliği Madde 9 ve güncel Uygulama Talimatı uyarınca: (1) Kredi Limit Tahsis Ücreti, tahsis edilen limit üzerinden limit süresinin ay sayısı dikkate alınarak yıllık azami %0,20 oranında uygulanır. (2) Kredi Kullandırım Ücreti, rotatif hariç nakdi kredilerde 360 gün ve üzeri vadede azami %1,10’dur; 1 yıldan kısa vadeli TL kredilerde ise TCMB 360 gün ticari yıl esasına göre vade gün sayısı ile orantılı olarak (Gün / 360) düşürülerek uygulanır. Döviz kredilerinde kullandırım ücreti serbest piyasada belirlenir. Ticari komisyonlar üzerine %5 BSMV uygulanır.',
      },
      {
        question: 'Ticari kredilerde limit tahsis süresi ile kredi vadesi neden ayrı değerlendirilir?',
        answer: 'TCMB 2020/4 Madde 9 uyarınca limit tahsis ücreti, bankanın müşteriye açtığı kredi limitinin büyüklüğü ve bu limitin geçerlilik süresi (ay sayısı) üzerinden hesaplanır. Kredi kullandırım ücreti ise tahsis edilen limit içinden fiilen çekilip hesaba aktarılan nakit tutar ve bu nakdin geri ödeme vadesi (gün sayısı) üzerinden hesaplanır. Matrahları ve süreleri tamamen farklı olduğu için ayrı ayrı hesaplanmalı ve tek bir tavanla birleştirilmemelidir.',
      },
      {
        question: 'Banka dosya masrafı dışında hangi ek giderleri tahsil edebilir?',
        answer: 'TCMB mevzuatına göre bankalar yalnızca üçüncü kişilere ödenen ve faturayla belgelendirilebilen gerçek harcamaları tüketiciden talep edebilir. Konut kredisinde SPK lisanslı ekspertiz ve tapu ipotek tesis harcı, taşıt kredisinde noter/rehin sicil harcı, talep edilmesi halinde zorunlu sigorta primleri (DASK, kasko, hayat) bu kapsamdadır. Banka bu giderlerden komisyon veya kâr elde edemez.',
      },
      {
        question: 'Masraflar kredi tutarından peşin mi kesilir yoksa ayrıca mı ödenir?',
        answer: 'Banka tahsis ücreti ve BSMV genellikle kredi hesabınıza aktarılırken doğrudan anaparadan mahsup edilir ve hesaplayıcıda \'seçili kesintiler sonrası teorik net tutar\' olarak gösterilir. Ekspertiz, ipotek tesis ve sigorta gibi üçüncü taraf giderleri bankaya ve tüketici tercihine göre krediden kesilebileceği gibi hesaptan nakit veya kredi kartıyla peşin olarak da ödenebilir. Diğer masrafların hariç tutulduğu durumlarda ekranda görünen net tutar teorik nakit değerdir.',
      },
      {
        question: 'Yasal sınırın üzerinde tahsil edilen masraflar nasıl geri alınır?',
        answer: 'Tüketici kredilerinde anaparanın %0,50’sini aşan tahsis ücretleri veya belgelendirilemeyen istihbarat/dosya masrafları yasalara aykırıdır. Tüketiciler, e-Devlet üzerinden Tüketici Hakem Heyetine (THH) başvurarak veya bankaya ihtarname çekerek kesilen fazla tutarların yasal faiziyle iadesini talep edebilir.',
      }
    ],
    content: {
      intro: "Kredi tahsis ücreti (dosya masrafı); bankaların kredi kullandırma sürecinde operasyonel maliyetler için tahsil ettiği, TCMB tebliğleri ve vergi mevzuatıyla tavan sınırları ve muafiyetleri kesin kurallara bağlanmış yasal bir ücrettir.",

      sections: [
        {
          title: "1. Tüketici Kredilerinde Tahsis Ücreti Sınırı (TCMB 2020/7 Madde 10)",
          paragraphs: [
            "TCMB’nin 'Finansal Tüketicilerden Alınacak Ücretlere İlişkin Usûl ve Esaslar Hakkında Tebliğ' (Sayı: 2020/7) Madde 10 uyarınca, bireysel tüketicilere kullandırılan ihtiyaç, konut ve taşıt kredilerinde kredi tahsis ücreti, kullandırılan anaparanın binde beşini (%0,50) kesinlikle geçemez.",
            "Bankalar tahsis ücreti dışında 'dosya masrafı', 'istihbarat ücreti', 'kredi açılış komisyonu' gibi adlar altında tüketiciden mükerrer veya ek masraf talep edemez."
          ],
          bullets: [
            "Yasal Üst Sınır: Kredi anaparasının azami %0,50'si (Örn: 100.000 TL için maks. 500 TL).",
            "Mükerrer Ücret Yasağı: Aynı işlem için ikinci bir operasyonel komisyon tahsil edilemez.",
            "İade Hakkı: Kredinin aynı gün veya cayma hakkı süresinde (14 gün) iptali halinde tahsis ücreti kesintisiz iade edilir."
          ]
        },
        {
          title: "2. Konut Finansmanında BSMV İstisnası, Hisseli Konut ve 7491 Sayılı Kanun",
          paragraphs: [
            "6802 sayılı Gider Vergileri Kanunu'nun 29/y maddesi uyarınca konut finansmanı kapsamında kullandırılan krediler prensip olarak BSMV'den istisnadır. Ancak 28 Aralık 2023 tarihli Resmî Gazete'de yayımlanan 7491 sayılı Kanun'un 35. maddesi ile bu istisnaya önemli bir mülkiyet sınırlaması getirilmiştir.",
            "Kanun hükmü gereğince, kredi kullanım tarihinde kendisi, eşi veya 18 yaşını doldurmamış çocukları adına tapuda kayıtlı en az bir konutu bulunan kişilerin kullandığı konut kredilerinde BSMV istisnası uygulanmaz; tahsis ücreti üzerinden %15 oranında BSMV tahsil edilir. Kredi kullanım tarihinde üzerinde hiçbir konut bulunmayan tüketiciler ise %0 BSMV avantajından yararlanır.",
            "Hisseli Konut Mülkiyeti (GİB 11.11.2024 / 1600427 Özelgesi): GİB'in 11.11.2024 tarihli ve 1600427 sayılı özelgesi, bizzat kredi kullanan tüketicinin kendi adına tapuda kayıtlı hisseli konut mülkiyetini konu almaktadır. Özelgede, kanunda herhangi bir asgari hisse oranı öngörülmediği gerekçesiyle, tüketicinin kendi üzerinde paylı/hisseli konut tapusu bulunması durumunda dahi konut maliki sayılacağı ve yeni konut kredisinde %0 BSMV istisnasından faydalanamayacağı açıklanmıştır.",
            "Tahsis Ücreti BSMV'si ile Kredi Taksit Faiz BSMV'sinin Ayrımı: Bu hesaplayıcıda hesaplanan BSMV kesintisi, yalnızca bankanın tek seferlik tahsil ettiği 'kredi tahsis ücreti (dosya masrafı)' üzerine uygulanan vergiyi konu almaktadır. Kredinin aylık geri ödeme taksitlerindeki faiz tutarı üzerinden tahakkuk eden BSMV ise taksit planı süresince dönemsel olarak tahsil edilen bağımsız bir vergi kalemidir. Bu araç kredinin faiz takvimini değil, tahsis ücreti ve krediden kesilen başlangıç masraflarını hesaplar."
          ]
        },
        {
          title: "3. Ticari Kredilerde Limit ve Kullandırım Ücretleri (TCMB 2020/4 Madde 9)",
          paragraphs: [
            "Ticari müşterilerden alınabilecek ücretler, TCMB'nin 2020/4 sayılı Tebliği ile tüketicilerden tamamen ayrı kurallara bağlanmıştır. Ticari kredilerde tek bir dosya masrafı yerine iki bağımsız tavan uygulanır:",
            "1. Kredi Limit Tahsis Ücreti: Müşteriye tahsis edilen kredi limiti üzerinden yıllık azami %0,20 oranında uygulanır. Limit süresi 12 aydan farklıysa süreyle orantılanır (Yıllık %0,20 × Ay / 12).",
            "2. Kredi Kullandırım Ücreti: Nakdi TL kredilerde 360 gün ve üzeri vadede kullandırım tutarının azami %1,10'udur. Vadesi 1 yıldan kısa TL kredilerde TCMB 360 gün ticari yıl esasına göre (Gün / 360) oranında gün bazlı düşürülerek tahsil edilir. Ticari bankacılık komisyonlarına yasal %5 BSMV uygulanır."
          ]
        },
        {
          title: "4. Üçüncü Kişilere Yapılan Belgelendirilmiş Ödemeler",
          paragraphs: [
            "Bankalar kredi tahsis ücreti haricinde yalnızca üçüncü kişilere yapılan ve faturayla tevsik edilen gerçek giderleri tüketiciden talep edebilir.",
            "Konut kredisinde SPK lisanslı değerleme uzmanına ödenen ekspertiz ücreti, tapu müdürlüğüne ödenen ipotek tesis harcı ve tüketicinin onay verdiği zorunlu sigortalar (DASK) bu kapsamdadır. Banka bu kalemlerden kâr veya komisyon elde edemez."
          ]
        }
      ],
      example: {
        title: "200.000 TL İhtiyaç ve 2.000.000 TL Konut Kredisi Dosya Masrafı Örnekleri",
        text: "Kredi dosya masraflarının yasal mevzuat uyarınca farklı finansman türlerinde nasıl hesaplandığını iki ayrı senaryoda inceleyelim:\n\nÖrnek 1: 200.000 TL Bireysel İhtiyaç Kredisi\n• Kullandırılan Kredi: 200.000 TL\n• Yasal Tahsis Ücreti Oranı (TCMB 2020/7): %0,50\n• Kredi Tahsis Ücreti: 200.000 TL × 0,005 = 1.000,00 TL\n• BSMV Kesintisi (%15): 1.000 TL × 0,15 = 150,00 TL\n• Toplam Masraf Kesintisi: 1.000 TL + 150 TL = 1.150,00 TL\n• Hesaba Net Geçen Tutar (Yalnızca Tahsis & BSMV Kesintili): 200.000 TL - 1.150 TL = 198.850,00 TL\n\nÖrnek 2: 2.000.000 TL Konut Kredisi (İlk Ev vs. Kayıtlı/Hisseli Konut)\n• Kullandırılan Kredi: 2.000.000 TL\n• Kredi Tahsis Ücreti (%0,50): 2.000.000 TL × 0,005 = 10.000,00 TL\n\n• Durum A (İlk Evim - Üzerine Kayıtlı Konut Yok):\n  - BSMV Oranı: %0 (6802 SK m. 29/y İstisnası)\n  - BSMV Tutarı: 0,00 TL\n  - Toplam Banka Kesintisi: 10.000,00 TL\n  - Hesaba Net Geçen Tutar: 2.000.000 TL - 10.000 TL = 1.990.000,00 TL\n\n• Durum B (Üzerine Tam veya Hisseli Kayıtlı Konut Olan - 7491 SK m. 35 & GİB 1600427):\n  - BSMV Oranı: %15 (İstisna Dışı)\n  - BSMV Tutarı: 10.000 TL × 0,15 = 1.500,00 TL\n  - Toplam Banka Kesintisi: 10.000 TL + 1.500 TL = 11.500,00 TL\n  - Hesaba Net Geçen Tutar: 2.000.000 TL - 11.500 TL = 1.988.500,00 TL\n\nÖnemli Açıklama (Hesaba Net Geçen Tutar): Tabloda ve hesaplamada sunulan 'Hesaba Net Geçen Tutar'; SPK lisanslı ekspertiz, tapu ipotek tesis harcı ve zorunlu sigorta primleri gibi üçüncü taraf giderleri hariç tutulduğunda, yalnızca seçili banka tahsis ücreti ve yasal BSMV kesintisi sonrası ele geçecek olan teorik net nakit değerdir. Tüketicinin onayladığı diğer masrafların da krediden mahsup edilmesi veya haricen peşin ödenmesi durumunda fiilen ele geçen tutar değişecektir."
      },
      sources: [
        {
          name: "TCMB – 2020/7 Sayılı Finansal Tüketicilerden Alınacak Ücretlere İlişkin Tebliğ (Madde 10)",
          url: "https://www.resmigazete.gov.tr/eskiler/2020/03/20200307-5.htm"
        },
        {
          name: "7491 Sayılı Kanun Madde 35 (6802 Sayılı Kanun m. 29/y Konut Finansmanı BSMV Düzenlemesi)",
          url: "https://www.resmigazete.gov.tr/eskiler/2023/12/20231228-1.htm"
        },
        {
          name: "GİB – Gelir İdaresi Başkanlığı 11.11.2024 Tarih ve 1600427 Sayılı Konut Finansmanı BSMV İstisnası ve Hisseli Konut Özelgesi",
          url: "https://www.gib.gov.tr/ozelgeler"
        },
        {
          name: "6802 Sayılı Gider Vergileri Kanunu (Madde 28 ve Madde 29/y - Mevzuat Bilgi Sistemi)",
          url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6802&MevzuatTur=1&MevzuatTertip=3"
        },
        {
          name: "TCMB – 2020/4 Sayılı Ticari Müşterilerden Alınabilecek Ücretlere İlişkin Tebliğ (Madde 9)",
          url: "https://www.resmigazete.gov.tr/eskiler/2020/02/20200210-1.htm"
        },
        {
          name: "6502 Sayılı Tüketicinin Korunması Hakkında Kanun (Mevzuat Bilgi Sistemi)",
          url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6502&MevzuatTur=1&MevzuatTertip=5"
        }
      ]
    },
    relatedCalculators: ['kredi', 'ihtiyac-kredisi', 'konut-kredisi', 'kredi-yillik-maliyet-orani']
  },
  fields: [
    {
      id: 'loanAmount',
      label: 'Kredi Tutarı',
      type: 'currency',
      required: true,
      min: 0,
      defaultValue: 100000,
    },
    {
      id: 'loanType',
      label: 'Kredi Türü',
      type: 'select',
      required: true,
      defaultValue: 'ihtiyac',
      options: [
        { label: 'İhtiyaç Kredisi (%15 BSMV, Maks %0,5)', value: 'ihtiyac' },
        { label: 'Konut Kredisi (İlk Evim %0 BSMV / Üzerine Konut Olan %15)', value: 'konut' },
        { label: 'Taşıt Kredisi (%15 BSMV, Maks %0,5)', value: 'tasit' },
        { label: 'Ticari Kredi (TCMB 2020/4 Madde 9: Maks %0,20 Limit + %1,10 Kullandırım, %5 BSMV)', value: 'ticari' },
      ],
    },
    {
      id: 'feeRate',
      label: 'Dosya Masrafı Oranı (%)',
      type: 'percentage',
      required: true,
      min: 0,
      step: 0.01,
      defaultValue: 0.5,
      description: 'TCMB 2020/7 Tebliği Madde 10 gereği tüketici kredilerinde yasal üst sınır anaparanın %0,5’idir.',
    },
  ],
  schema,
  calculate: (input) => {
    return calculateLoanFee(input.loanAmount, input);
  }
};
