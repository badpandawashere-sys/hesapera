import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLoanAnnualCostRate, LoanCostParams } from '../formulas/loanAnnualCostRate';

const schema = z.object({
  loanType: z.enum(['ihtiyac', 'tasit', 'konut']),
  principal: z.number().positive('Kredi tutarı 0 dan büyük olmalıdır'),
  monthlyInterestRate: z.number().min(0, 'Aylık faiz oranı negatif olamaz'),
  termMonths: z.number().int().positive('Vade pozitif olmalıdır'),
  allocationFee: z.number().min(0, 'Tahsis ücreti negatif olamaz').default(0),
  insuranceFee: z.number().min(0, 'Sigorta ücreti negatif olamaz').default(0),
  appraisalFee: z.number().min(0, 'Ekspertiz ücreti negatif olamaz').default(0),
  mortgageFee: z.number().min(0, 'İpotek ücreti negatif olamaz').default(0),
  otherFees: z.number().min(0, 'Diğer ücretler negatif olamaz').default(0),
  advancedMode: z.boolean().optional()
});

type Input = z.infer<typeof schema>;

export const loanAnnualCostRateCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_loanAnnualCostRate_001',
  slug: 'kredi-yillik-maliyet-orani',
  status: 'published',
  name: 'Kredi Yıllık Maliyet Oranı Hesaplama',
  shortDescription: 'Kredi tutarı, faiz ve peşin masrafları dikkate alarak efektif yıllık maliyet oranını (APR) hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Yıllık Maliyet Oranı Hesaplama Aracı | Hesapera',
    description: 'Bireysel, taşıt ve konut kredilerinizin yönetmeliğe uygun yıllık efektif maliyet oranını hesaplayın.',
    keywords: ["yıllık maliyet oranı","efektif faiz","kredi maliyeti","IRR hesaplama"],
    canonical: 'https://hesapera.com.tr/hesaplama/kredi-yillik-maliyet-orani',
    faq: [
      {
        question: "Hesaplanan maliyet oranı neden aylık faizimin 12 katından çok daha büyük çıkıyor?",
        answer: "Çünkü banka faizine ek olarak %30 vergi (BSMV+KKDF) kesilir ve kredinin başında ödediğiniz dosya masrafları elinize geçen parayı (net krediyi) düşürür. Ayrıca matematiksel olarak faiz her ay bileşiklendiği (efektif hesaplandığı) için sonuç doğrudan 12 ile çarpımdan çok daha yüksektir."
      },
      {
        question: "Banka bana daha düşük bir maliyet oranı verdi, hangisi doğru?",
        answer: "Bankanın sunduğu oran her zaman bağlayıcı olan yasal orandır. Araçtaki matematiksel hesaplamada sizin sisteme girmediğiniz veya hayat sigortası iadeleri gibi bankanın özel olarak işlettiği bir iç katsayı söz konusu olabilir."
      }
    ],
    content: {
      intro: "Kredilerdeki aylık faiz dışında kalan peşin masrafların toplam efektif finansal yüke etkisinin analizi",

      sections: [
        {
          title: "Kredi Yıllık (Efektif) Maliyet Oranı Nedir?",
          paragraphs: [
            "Bankalar kredi ürünlerini genellikle 'Aylık Faiz Oranı' ile pazarlarlar. Ancak gerçek dünyada krediyi kullanırken bankaya dosya masrafı, sigorta bedeli, tahsis veya ipotek ücreti gibi peşin (başlangıçta kesilen) harcamalar yaparsınız.",
            "Yıllık Maliyet Oranı, tüm bu peşin harcamaları ve ödeyeceğiniz vergileri matematiksel olarak kredinizin içine dahil ederek, kredinin size 'gerçekte yıllık yüzde kaç faizle' mal olduğunu (Efektif Yıllık Oran - IRR) bulur."
          ]
        },
        {
          title: "Matematiksel Nakit Akışı Mantığı (IRR)",
          paragraphs: [
            "Araç, Ticaret Bakanlığı Tüketici Kredisi Sözleşmeleri standartlarına yakın bir finansal nakit akışı formülü (IRR) kullanır. Girdiğiniz peşin kesintiler asıl kredi tutarından düşülür ve 'Net Kullanılan' yani gerçekten elinize geçen nakit bulunur.",
            "Ardından aydan aya ödediğiniz taksitler, net geçen parayla kıyaslanarak bileşik (efektif) getiri formülünden geçirilir. Sonuç, ödediğiniz peşin paranın kredi vadesine yansımasıdır."
          ]
        },
        {
          title: "Vergiler ve Hukuki Kısıtlar",
          paragraphs: [
            "Hesaplamalarımıza İhtiyaç ve Taşıt kredilerinde yasal olarak uygulanan %15 BSMV ve %15 KKDF (toplam faizin %30'u kadar vergi) yansıtılmıştır. Konut kredilerinde ise yasa gereği vergilerden muafiyet tanımlanmıştır.",
            "Hesapera bu aracı tamamen teorik bir nakit akış modeli olarak sunar. Nihai oran; bankanın sözleşme öncesi bilgi formundaki resmî rakamdır. Buradaki sonuç sadece teklifleri tarafsız karşılaştırmanız içindir."
          ]
        },
      ],
      example: {
        title: "Görünmeyen Masrafların Etkisi",
        text: "Bankadan 100.000 TL ihtiyaç kredisini %3 aylık faizle 12 ay vade ile çektiğinizi düşünelim. Eğer hiç dosya masrafı ve sigorta olmasaydı yıllık maliyet oranınız belirli bir bantta çıkardı. Ancak banka sizden 5.000 TL peşin tahsis ve sigorta kestiyse, elinize geçen net para 95.000 TL olacaktır. Siz 95.000 TL alıp, sanki 100.000 TL kullanmış gibi taksit ödeyeceğiniz için gerçek (efektif) yıllık maliyet oranınız bir anda ciddi şekilde sıçrayacaktır."
      },
      sources: [
        {
          name: "TCMB - Efektif Yıllık Faiz Oranı Hesaplamaları",
          url: "https://www.tcmb.gov.tr/"
        },
        {
          name: "Ticaret Bakanlığı - Tüketici Kredisi Mevzuatı",
          url: "https://ticaret.gov.tr/"
        }
      ]
    },

    relatedCalculators: ["kredi", "ihtiyac-kredisi", "konut-kredisi", "tasit-kredisi"]
  },
  fields: [
    {
      id: "loanType",
      label: "Kredi Türü",
      type: "select",
      required: true,
      options: [
        { label: "İhtiyaç Kredisi", value: "ihtiyac" },
        { label: "Taşıt Kredisi", value: "tasit" },
        { label: "Konut Kredisi", value: "konut" }
      ],
      defaultValue: "ihtiyac"
    },
    {
      id: "principal",
      label: "Kredi Tutarı",
      type: "currency",
      required: true,
      min: 0
    },
    {
      id: "monthlyInterestRate",
      label: "Aylık Faiz Oranı (%)",
      type: "number",
      required: true,
      min: 0
    },
    {
      id: "termMonths",
      label: "Vade (Ay)",
      type: "number",
      required: true,
      min: 1,
      max: 360
    },
    {
      id: "allocationFee",
      label: "Kredi Tahsis Ücreti",
      type: "currency",
      required: false,
      defaultValue: 0
    },
    {
      id: "advancedMode",
      label: "Ekstra Masraflar ve Gelişmiş Seçenekler",
      type: "checkbox",
      required: false,
      defaultValue: false
    },
    {
      id: "insuranceFee",
      label: "Zorunlu Sigorta Maliyeti",
      description: "Kredi şartı olan peşin sigorta maliyeti",
      type: "currency",
      required: false,
      defaultValue: 0,
      conditions: [{ fieldId: 'advancedMode', operator: 'equals', value: true }]
    },
    {
      id: "appraisalFee",
      label: "Ekspertiz Ücreti",
      type: "currency",
      required: false,
      defaultValue: 0,
      conditions: [{ fieldId: 'advancedMode', operator: 'equals', value: true }]
    },
    {
      id: "mortgageFee",
      label: "İpotek/Rehin Tesis Ücreti",
      type: "currency",
      required: false,
      defaultValue: 0,
      conditions: [{ fieldId: 'advancedMode', operator: 'equals', value: true }]
    },
    {
      id: "otherFees",
      label: "Diğer Peşin Masraflar",
      type: "currency",
      required: false,
      defaultValue: 0,
      conditions: [{ fieldId: 'advancedMode', operator: 'equals', value: true }]
    }
  ],
  schema,
  calculate: (input) => {
    return calculateLoanAnnualCostRate(minera(input));
  }
};

function minera(input: any): LoanCostParams {
  return {
    loanType: input.loanType,
    principal: (input.principal || 0),
    monthlyInterestRate: (input.monthlyInterestRate || 0),
    termMonths: (input.termMonths || 0),
    allocationFee: (input.allocationFee || 0),
    insuranceFee: (input.insuranceFee || 0),
    appraisalFee: (input.appraisalFee || 0),
    mortgageFee: (input.mortgageFee || 0),
    otherFees: (input.otherFees || 0)
  };
}
