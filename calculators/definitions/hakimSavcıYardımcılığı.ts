import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateHakimSavci } from '../formulas/hakimSavcıYardımcılığı';

const schema = z.object({
  gygk_correct: z.number().int().min(0).max(30).optional(),
  gygk_wrong: z.number().int().min(0).max(30).optional(),
  ortak_correct: z.number().int().min(0).max(35).optional(),
  ortak_wrong: z.number().int().min(0).max(35).optional(),
  adli_correct: z.number().int().min(0).max(35).optional(),
  adli_wrong: z.number().int().min(0).max(35).optional(),
  idari_correct: z.number().int().min(0).max(35).optional(),
  idari_wrong: z.number().int().min(0).max(35).optional(),
  avukat_correct: z.number().int().min(0).max(35).optional(),
  avukat_wrong: z.number().int().min(0).max(35).optional(),
}).superRefine((val, ctx) => {
  if ((val.gygk_correct || 0) + (val.gygk_wrong || 0) > 30) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "GYGK doğru/yanlış toplamı 30'u geçemez.", path: ["gygk_correct"] });
  }
  if ((val.ortak_correct || 0) + (val.ortak_wrong || 0) > 35) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ortak alan doğru/yanlış toplamı 35'i geçemez.", path: ["ortak_correct"] });
  }
  if ((val.adli_correct || 0) + (val.adli_wrong || 0) > 35) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Adli Yargı doğru/yanlış toplamı 35'i geçemez.", path: ["adli_correct"] });
  }
  if ((val.idari_correct || 0) + (val.idari_wrong || 0) > 35) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "İdari Yargı doğru/yanlış toplamı 35'i geçemez.", path: ["idari_correct"] });
  }
  if ((val.avukat_correct || 0) + (val.avukat_wrong || 0) > 35) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Adli Yargı-Avukat doğru/yanlış toplamı 35'i geçemez.", path: ["avukat_correct"] });
  }
  if (val.gygk_correct === undefined && val.gygk_wrong === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Genel Yetenek ve Genel Kültür zorunludur.", path: ["gygk_correct"] });
  }
  if (val.ortak_correct === undefined && val.ortak_wrong === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ortak Alan zorunludur.", path: ["ortak_correct"] });
  }
});

type Input = z.infer<typeof schema>;

export const hakimSavcıYardımcılığıCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_hakim_savci_001',
  slug: 'h-kim-ve-savci-yardimciligi-sinavi-puan',
  status: 'published',
  name: 'Hâkim ve Savcı Yardımcılığı Sınavı Puan Hesaplama',
  shortDescription: 'Hâkim ve Savcı Yardımcılığı sınavında netlerinizi ve tahmini genel başarı puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'Hâkim ve Savcı Yardımcılığı Sınavı Puan Hesaplama | Hesapera',
    description: 'Hâkim ve savcı yardımcılığı sınavında GYGK, Ortak Alan, Adli Yargı, İdari Yargı ve Adli Yargı-Avukat doğru ve yanlış sayılarına göre netlerinizi hesaplayın ve resmî puanlama yöntemini inceleyin.',
    keywords: ["hâkim ve savcı yardımcılığı puan hesaplama","adli yargı puan hesaplama","idari yargı puan hesaplama","avukat adli yargı puan","hmgs puan hesaplama"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/h-kim-ve-savci-yardimciligi-sinavi-puan',
    relatedCalculators: ["kpss-puan"]
,
    content: {
    intro: 'Bu araç, Hâkim ve Savcı Yardımcılığı Sınavı netlerinizi hesaplar ve puanlama yöntemini inceler.',
    sections: [
      {
        title: 'Hâkim ve Savcı Yardımcılığı Sınavı Nedir?',
        paragraphs: [
          'Hâkim ve Savcı Yardımcılığı Sınavı, Adalet Bakanlığı bünyesinde hâkim ve savcı yardımcısı olarak görev almak isteyen adayların girdiği, ÖSYM tarafından düzenlenen resmî bir sınavdır.'
        ]
      },
      {
        title: 'Sınav Yapısı ve Oturumlar',
        paragraphs: [
          'Sınav 4 ana test bölümünden oluşmaktadır:',
          '- Genel Yetenek ve Genel Kültür (GYGK): Tüm adaylar için zorunlu olan 30 soruluk testtir.',
          '- Ortak Alan Bilgisi: Yine tüm adayların cevaplaması gereken 35 soruluk testtir.',
          '- Adli Yargı Testi: Adli yargı hâkim ve savcı yardımcılığı için 35 soruluk özel alan testidir.',
          '- İdari Yargı Testi: İdari yargı hâkim yardımcılığı için 35 soruluk özel alan testidir.',
          '- Adli Yargı-Avukat Testi: Avukatlık mesleğinden adli yargı hâkim ve savcı yardımcılığına geçmek isteyenler için 35 soruluk testtir.',
          'Bir adayın ilgili sınav türündeki genel başarı puanı hesaplanırken, GYGK (30 soru) + Ortak Alan (35 soru) + Seçilen Özel Alan (35 soru) olmak üzere toplam 100 soru üzerinden değerlendirme yapılır.'
        ]
      },
      {
        title: 'Net Hesabı ve 4 Yanlış 1 Doğru Kuralı',
        paragraphs: [
          'Sınavda 4 yanlış cevap 1 doğru cevabı götürmektedir. Her test grubu kendi içinde değerlendirilir ve adayın ilgili testten elde ettiği ham puan (net) bulunur. Net sayısı hesaplanırken eksi değerlere düşülebilir.'
        ]
      },
      {
        title: 'Puan Ağırlıkları ve Resmî Standartlaştırma',
        paragraphs: [
          'ÖSYM\'nin resmî değerlendirme sisteminde, adayların netleri doğrudan toplandıktan sonra sınava giren tüm adayların istatistiksel sonuçları (ortalama ve standart sapma) kullanılarak standart puanlara dönüştürülür.',
          'Resmî Genel Başarı Puanı 17 alt testin standartlaştırılması ile belirlenir.',
          'Alt-test dağılımları ve aday istatistikleri bilinmeden exact resmî puan hesaplanamaz.'
        ]
      },
      {
        title: '70 Puan Temel Başarı Şartı ve Sıralama',
        paragraphs: [
          'Adayların mülakata çağrılabilmesi için öncelikle Genel Başarı Puanlarının 70 ve üzeri olması gerekmektedir (temel başarı şartı). 70 puan resmî Genel Başarı Puanı için temel şarttır; NET için 70 barajı şeklinde yorumlanmaz.',
          'Adayların aynı zamanda Adalet Bakanlığı tarafından ilan edilen kadro sayısına bağlı olarak mülakata çağrılacak aday sıralamasına girmeleri de zorunludur.'
        ]
      }
    ],
    example: {
      title: 'Örnek Hesaplama',
      text: 'Genel Yetenek ve Genel Kültür testinden 30 doğru 0 yanlış, Ortak Alan testinden 35 doğru 0 yanlış ve Adli Yargı testinden 35 doğru 0 yanlış yapan bir adayın toplam neti 100 net olarak hesaplanır.'
    },
    sources: [
      {
        name: 'Adalet Bakanlığı & ÖSYM',
        url: 'https://www.osym.gov.tr/'
      }
    ]
  }
  },
  fields: [
    {
      id: "gygk_correct",
      label: "GYGK Doğru Sayısı",
      type: "number",
      required: true,
      min: 0,
      max: 30
    },
    {
      id: "gygk_wrong",
      label: "GYGK Yanlış Sayısı",
      type: "number",
      required: false,
      min: 0,
      max: 30
    },
    {
      id: "ortak_correct",
      label: "Ortak Alan Doğru",
      type: "number",
      required: true,
      min: 0,
      max: 35
    },
    {
      id: "ortak_wrong",
      label: "Ortak Alan Yanlış",
      type: "number",
      required: false,
      min: 0,
      max: 35
    },
    {
      id: "adli_correct",
      label: "Adli Yargı Doğru",
      type: "number",
      required: false,
      min: 0,
      max: 35
    },
    {
      id: "adli_wrong",
      label: "Adli Yargı Yanlış",
      type: "number",
      required: false,
      min: 0,
      max: 35
    },
    {
      id: "idari_correct",
      label: "İdari Yargı Doğru",
      type: "number",
      required: false,
      min: 0,
      max: 35
    },
    {
      id: "idari_wrong",
      label: "İdari Yargı Yanlış",
      type: "number",
      required: false,
      min: 0,
      max: 35
    },
    {
      id: "avukat_correct",
      label: "Adli Yargı-Avukat Doğru",
      type: "number",
      required: false,
      min: 0,
      max: 35
    },
    {
      id: "avukat_wrong",
      label: "Adli Yargı-Avukat Yanlış",
      type: "number",
      required: false,
      min: 0,
      max: 35
    }
  ],
  schema,
  calculate: (input) => {
    return calculateHakimSavci({
      gygk: { correct: input.gygk_correct, wrong: input.gygk_wrong },
      ortak: { correct: input.ortak_correct, wrong: input.ortak_wrong },
      adli: { correct: input.adli_correct, wrong: input.adli_wrong },
      idari: { correct: input.idari_correct, wrong: input.idari_wrong },
      avukat: { correct: input.avukat_correct, wrong: input.avukat_wrong }
    });
  }
};
