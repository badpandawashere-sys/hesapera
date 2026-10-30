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
        question: 'Konut kredilerinde BSMV istisnası kimler için geçerlidir (7491 Sayılı Kanun)?',
        answer: '28 Aralık 2023 tarihli Resmî Gazete’de yayımlanan 7491 sayılı Kanun’un 6. maddesi ile 6802 sayılı Gider Vergileri Kanunu m. 29/i bendi değiştirilmiştir. Kredi kullanım tarihi itibarıyla tapuda üzerine kayıtlı başka bir konutu veya konut hissesi bulunmayan kişilerin (ilk evini alanların) kullandığı konut kredilerinde %0 BSMV istisnası devam eder. Ancak üzerine kayıtlı konut veya hissesi bulunan kişilerin kullandığı konut kredileri istisna kapsamı dışına çıkarılmış olup %15 oranında BSMV’ye tabidir.',
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
        answer: 'Banka tahsis ücreti ve BSMV genellikle kredi hesabınıza aktarılırken doğrudan anaparadan mahsup edilir. Ancak ekspertiz, ipotek ve sigorta gibi üçüncü taraf giderleri bankaya ve tüketici tercihine göre krediden kesilebileceği gibi hesaptan nakit veya kredi kartıyla peşin olarak da ödenebilir. Masrafların ayrıca ödenmesi durumunda onaylanan kredi tutarının tamamı kullanıcının eline geçer.',
      },
      {
        question: 'Yasal sınırın üzerinde tahsil edilen masraflar nasıl geri alınır?',
        answer: 'Tüketici kredilerinde anaparanın %0,50’sini aşan tahsis ücretleri veya belgelendirilemeyen istihbarat/dosya masrafları yasalara aykırıdır. Tüketiciler, e-Devlet üzerinden Tüketici Hakem Heyetine (THH) başvurarak veya bankaya ihtarname çekerek kesilen fazla tutarların yasal faiziyle iadesini talep edebilir.',
      }
    ],
    relatedCalculators: [
      'ihtiyac-kredisi',
      'konut-kredisi',
      'tasit-kredisi',
      'is-yeri-kredisi',
      'kredi-yillik-maliyet-orani'
    ]
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
