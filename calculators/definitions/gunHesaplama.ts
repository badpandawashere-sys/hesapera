import { z } from "zod";
import { CalculatorDefinition } from "../core/calculator-types";
import { calculateGunHesaplama, isValidGregorianDateString } from "../formulas/gunHesaplama";

const schema = z.object({
  mode: z.enum(["kaldi", "gecti", "arasi"]),
  referenceDate: z.string().optional(),
  targetDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.mode === "kaldi") {
    if (!data.referenceDate || !isValidGregorianDateString(data.referenceDate)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Geçerli bir referans tarih gerekli", path: ["referenceDate"] });
    if (!data.targetDate || !isValidGregorianDateString(data.targetDate)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lütfen geçerli bir hedef tarih seçiniz", path: ["targetDate"] });
  } else if (data.mode === "gecti") {
    if (!data.referenceDate || !isValidGregorianDateString(data.referenceDate)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Geçerli bir referans tarih gerekli", path: ["referenceDate"] });
    if (!data.startDate || !isValidGregorianDateString(data.startDate)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lütfen geçerli bir başlangıç tarihi seçiniz", path: ["startDate"] });
  } else if (data.mode === "arasi") {
    if (!data.startDate || !isValidGregorianDateString(data.startDate)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lütfen geçerli bir başlangıç tarihi seçiniz", path: ["startDate"] });
    if (!data.endDate || !isValidGregorianDateString(data.endDate)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lütfen geçerli bir bitiş tarihi seçiniz", path: ["endDate"] });
  }
});

type Input = z.infer<typeof schema>;

export const gunHesaplamaDef: CalculatorDefinition<Input, any> = {
  id: "calc_gunhesaplama_001",
  slug: "gun-hesaplama",
  status: "published",
  name: "Gün Hesaplama",
  shortDescription: "Bir tarihe kaç gün kaldığını, üzerinden kaç gün geçtiğini veya iki tarih arasındaki gün sayısını hesaplayın.",
  category: "math",
  type: "simple",
  metadata: {
    title: "Gün Hesaplama – Kaç Gün Kaldı, Geçti ve İki Tarih Arası | Hesapera",
    description: "Bir tarihe kaç gün kaldığını, üzerinden kaç gün geçtiğini veya iki tarih arasındaki toplam gün sayısını kolayca hesaplayın.",
    keywords: ["gün hesaplama", "kaç gün kaldı", "kaç gün geçti", "iki tarih arası gün hesaplama", "gün farkı"],
    canonical: "https://www.hesapera.com.tr/hesaplama/gun-hesaplama",
    icon: "Calendar",
    faq: [
      {
        question: "İki tarih arasındaki gün sayısı nasıl hesaplanır?",
        answer: "Standart hesaplamada iki tarih arasındaki tam gün farkı alınır. İlk gün (başlangıç) hesaba katılmaz, bitiş günü sayılır. Örneğin ayın 1'i ile 2'si arasında tam 1 gün fark vardır."
      },
      {
        question: "Bugün gün hesabına dahil edilir mi?",
        answer: "Standart fark hesabında başlangıç günü sayılmaz. Ancak 'Her iki tarih dahil edilirse' bölümündeki sonuçta, hem başladığınız gün hem de bitirdiğiniz gün hesaba katılır."
      },
      {
        question: "İki tarih de dahil edilirse gün sayısı neden 1 artar?",
        answer: "Çünkü sadece aradaki geçen süreyi değil, fiilen yaşanılan/kullanılan gün adetini sayıyorsunuzdur. 1 Ekim ile 2 Ekim arasında 1 takvim günü geçer, ama etkinlik/konaklama/izin gibi konularda her iki günü de kullanıyorsanız 2 adet gün etmiş olur."
      },
      {
        question: "Artık yıllar gün hesabını etkiler mi?",
        answer: "Evet! Hesapera'nın gün hesaplama aracı artık yıl hesaplamasını tam olarak yapar: 4'e tam bölünen yıllar artık yıldır, ancak 100'e tam bölünenler artık yıl değildir. 400'e tam bölünenler ise tekrar artık yıl kabul edilir."
      },
      {
        question: "Başlangıç tarihi bitiş tarihinden sonraysa ne olur?",
        answer: "Araç otomatik olarak girdiğiniz tarihlerin yönünü (geçmiş veya gelecek) anlar. Geçmiş bir hedef tarih girdiyseniz size 'Kaç gün geçtiğini' söyler, böylece hata almak yerine doğru sonucu elde edersiniz."
      },
      {
        question: "Kaç gün kaldı hesabında bugün sayılır mı?",
        answer: "Bugünün (içinde bulunduğunuz anın) üzerinden geçen saatler gün bitene kadar tükenmeye devam eder. Bu yüzden 'bugün' tam 1 gün olarak eklenmez. Hesaplama yarına kadar olan zamanı kesir olarak değil, takvim atlaması olarak değerlendirir."
      }
    ],
    content: {
      intro: "Gün Hesaplama Nasıl Yapılır?",
      sections: [
        {
          title: "İki Tarih Arasındaki Gün Farkı",
          paragraphs: [
            "İki tarih arasındaki fark, matematiksel olarak bitiş tarihinden başlangıç tarihinin çıkarılmasıyla bulunur. Standart hesaplamalarda ilk gün dahil edilmez.",
            "Bu yöntem genel süre hesaplamalarında sıklıkla tercih edilir."
          ]
        },
        {
          title: "Kaç Gün Kaldı Hesabı",
          paragraphs: [
            "Sınav, düğün, tatil veya önemli bir toplantı... Gelecekteki bir hedefe ne kadar süreniz kaldığını referans tarih olan bugünü baz alarak hesaplarız.",
            "Eğer hedef tarihe girdiğiniz gün henüz bugünün içindeyse 0 (Bugün) sonucunu alırsınız."
          ]
        },
        {
          title: "Kaç Gün Geçti Hesabı",
          paragraphs: [
            "Geçmişte yaşanmış bir olayın (doğum, mezuniyet, kuruluş yıl dönümü vb.) üzerinden tam olarak kaç takvim günü geçtiğini bulmanızı sağlar."
          ]
        },
        {
          title: "Başlangıç ve Bitiş Gününü Dahil Etmek",
          paragraphs: [
            "Standart gün hesabı (Örn: 1 Ocak - 5 Ocak = 4 Gün) çoğu zaman yeterlidir. Ancak izin, rapor veya otel konaklaması değil de doğrudan mesai günü gibi hesaplamalar yapıyorsanız ilk günü de saymak isteyebilirsiniz.",
            "Bunun için sonucun altındaki (Her iki tarih dahil edilirse = 5 Gün) ibaresini kullanabilirsiniz."
          ]
        },
        {
          title: "Artık Yılların Etkisi ve Timezone",
          paragraphs: [
            "Gün hesabında timezone (saat dilimi) farkı önemlidir. Sunucu saati farklı bir ülkede olsa bile, bu araç sizin tarayıcınızdaki yerel saat dilimini baz alarak 'Bugün' kavramını doğru anlar.",
            "Artık yıl hesaplaması tam olarak yapılır: 4'e tam bölünen yıllar artık yıldır, ancak 100'e tam bölünenler artık yıl değildir. 400'e tam bölünenler ise tekrar artık yıl kabul edilir."
          ]
        }
      ]
    },
    features: [
      { label: "Kaç Gün Kaldı", icon: "Clock" },
      { label: "İki Tarih Arası", icon: "CalendarRange" }
    ],
    relatedCalculators: ["yas"]
  },
  fields: [],
  schema,
  calculate: (input) => {
    return calculateGunHesaplama(input as any);
  }
};



