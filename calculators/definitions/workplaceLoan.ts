import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateWorkplaceLoan } from '../formulas/workplaceLoan';

const schema = z.object({
  loanAmount: z.number({ message: 'Kredi tutarı zorunludur' })
    .positive('Kredi tutarı 0 dan büyük olmalıdır')
    .max(100000000, 'Güvenli maksimum kredi limitini aştınız'),
  monthlyInterestRate: z.number({ message: 'Faiz oranı zorunludur' })
    .min(0, 'Faiz oranı negatif olamaz')
    .max(100, 'Faiz oranı çok yüksek'),
  termMonths: z.number({ message: 'Vade zorunludur' })
    .int('Vade tam sayı olmalıdır')
    .positive('Vade 0 dan büyük olmalıdır')
    .max(120, 'İş yeri kredilerinde banka ürün sınırı genellikle azami 120 aydır'),
  customerType: z.enum(['commercial', 'individual', 'exempt']).default('commercial').optional()
});

type Input = z.infer<typeof schema>;

export const workplaceLoanCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_workplaceLoan_001',
  slug: 'is-yeri-kredisi',
  status: 'published',
  name: 'İş Yeri Kredisi Hesaplama',
  shortDescription: 'İş yeri veya dükkan alımı için kredi taksitlerinizi, BSMV/KKDF vergi tutarlarını ve detaylı ödeme planını hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'İş Yeri Kredisi Hesaplama 2026 - Taksit ve Masraf Tablosu | Hesapera',
    description: 'İş yeri ve dükkan alımı için kredi taksit tutarını, aylık faiz, BSMV, KKDF vergi oranlarını ve geri ödeme planını anında hesaplayın.',
    keywords: [
      "iş yeri kredisi hesaplama",
      "dükkan kredisi",
      "ticari gayrimenkul kredisi",
      "iş yeri kredi taksiti",
      "kredi amortisman tablosu",
      "iş yeri kredisi bsmv"
    ],
    canonical: 'https://www.hesapera.com.tr/hesaplama/is-yeri-kredisi',
    icon: 'Building2',
    features: [
      { label: '60-120 Ay Vade', icon: 'CalendarDays' },
      { label: 'Ticari Gayrimenkul', icon: 'Building2' },
      { label: 'BSMV & KKDF Analizi', icon: 'Percent' },
      { label: 'Ödeme Planı Tablosu', icon: 'Table' }
    ],
    infoBox: {
      title: 'Ticari Gayrimenkul Finansmanı',
      text: 'Ofis, büro veya dükkan alımlarında nakit akışınıza uygun taksit ve vergi projeksiyonunu planlayın.',
      icon: 'Building2'
    },
    faq: [
      {
        question: "İş yeri kredisi nedir ve kimler başvurabilir?",
        answer: "İş yeri kredisi; ofis, büro, dükkan, muayenehane, mağaza veya fabrika gibi ticari nitelikli gayrimenkullerin satın alımını finanse etmek amacıyla bankalar tarafından kullandırılan bir gayrimenkul kredisidir. Vergi levhası bulunan şahıs ve sermaye şirketleri (KOBİ'ler ve ticari işletmeler) ticari kredi statüsünde; kişisel birikimiyle gayrimenkul yatırımı yapmak isteyen gerçek kişiler ise bireysel yatırımcı statüsünde iş yeri kredisine başvurabilir."
      },
      {
        question: "İş yeri kredisinin konut kredisinden vergi farkı nedir?",
        answer: "6802 sayılı Gider Vergileri Kanunu'nun 29/x maddesi uyarınca yalnızca konut (mesken) finansmanı BSMV'den muaftır. İş yeri kredileri bu konut istisnası kapsamında değildir. Ticari nitelikteki iş yeri kredilerinde faiz üzerinden %5 BSMV alınırken KKDF oranı %0'dır. Gerçek kişilerin ticari amaç taşımayan bireysel yatırım amacıyla kullandığı iş yeri kredilerinde ise güncel mevzuat uyarınca faiz üzerinden %15 BSMV ve %15 KKDF tahakkuk eder."
      },
      {
        question: "İş yeri kredilerinde azami vade kaç aydır?",
        answer: "Türkiye bankacılık uygulamasında iş yeri kredileri genellikle 60 ila 120 ay (5 ila 10 yıl) vade ile kullandırılmaktadır. Konut kredilerindeki gibi 240 veya 360 aya varan uzun vadeler iş yeri finansmanında bankaların genel risk ve teminat politikaları gereğince tercih edilmez. Vade sınırı kanuni bir zorunluluktan ziyade banka ürün ve kredi tahsis politikalarına bağlıdır."
      },
      {
        question: "İş yeri kredisi ekspertiz değerinin yüzde kaçına kadar kullandırılır?",
        answer: "İş yeri kredilerinde azami kredi tutarı, satın alınacak gayrimenkulün satış bedeli üzerinden değil; SPK lisanslı bağımsız gayrimenkul değerleme uzmanının hazırladığı resmi ekspertiz raporundaki değer üzerinden belirlenir. Bankalar genellikle ekspertiz değerinin %50'si ile %75'i arasında finansman sağlar; kalan tutarın peşinat olarak karşılanması beklenir."
      },
      {
        question: "Kredi taksitleri dışında hangi ek masraflar oluşur?",
        answer: "Aylık taksit tutarlarının yanı sıra kredinin niteliğine göre ek masraflar doğar: Bireysel tüketici kredilerinde TCMB 2020/7 Tebliği gereği kredi tahsis ücreti anaparanın azami binde 5'i (‰5) ile sınırlıdır. Ticari iş yeri kredilerinde ise TCMB'nin 2020/4 sayılı Tebliği hükümleri uygulanır; bankalar kredi tahsis ücreti (tahsis edilen limit üzerinden) ve kredi kullandırım ücretini (kullandırılan anapara üzerinden) Tebliğ esaslarına göre ayrı ayrı tahsil edebilir. Ayrıca SPK lisanslı ekspertiz raporu ücreti, tapuda ipotek tesis harç/tescil giderleri ile iş yeri yangın ve DASK sigortaları peşin tahsil edilir; bu masraflar aylık taksitlere dahil değildir."
      },
      {
        question: "Aylık faiz oranı ile toplam geri ödeme tutarı nasıl değerlendirilmelidir?",
        answer: "Kredi hesaplamasında aylık akdi faiz oranının yanı sıra faiz üzerine binen yasal vergiler (BSMV ve varsa KKDF) efektif aylık maliyeti artırır. Vade uzadıkça aylık taksit tutarı düşse de borcun anapara bakiyesi daha yavaş kapandığı için bankaya ödenecek toplam faiz ve vergi miktarı yükselir. İşletmenin nakit akışını zorlamayacak en kısa vadeyi seçmek toplam finansman maliyetini önemli ölçüde azaltır."
      }
    ],
    content: {
      intro: "İş yeri kredisi hesaplama aracı; işletmelerin ve yatırımcıların dükkan, ofis veya ticari gayrimenkul alımlarında aylık taksit tutarını, yasal BSMV/KKDF vergilerini ve detaylı amortisman planını şeffaf biçimde görmelerini sağlar.",
      sections: [
        {
          title: "İş Yeri Kredisi Nedir ve Nasıl Çalışır?",
          paragraphs: [
            "İş yeri kredisi, ticari faaliyetlerini kendi mülkünde sürdürmek isteyen esnaf, serbest meslek erbabı, şirketler veya kira getirisi hedefleyen gayrimenkul yatırımcıları için tasarlanmış uzun vadeli bir finansman çözümüdür.",
            "Bu kredi türünde satın alınacak gayrimenkulün tapu kaydı üzerine banka lehine birinci dereceden ipotek tesis edilir. Kredi geri ödemeleri eşit taksitli anüite (Fransız itfa planı) yöntemiyle yapılır; her ay anapara, faiz ve yasal vergi payları tahsil edilir."
          ],
          bullets: [
            "Ofis, büro, muayenehane, eczane ve dükkan alımları",
            "Depo, atölye, imalathane ve fabrika binaları",
            "Ticari plaza katları ve müstakil iş merkezleri",
            "Yatırım amaçlı kiralanabilir ticari gayrimenkuller"
          ]
        },
        {
          title: "Konut Kredisi ile İş Yeri Kredisi Arasındaki Temel Farklar",
          paragraphs: [
            "Birçok kullanıcı iş yeri kredisini konut kredisiyle benzer koşullarda değerlendirir; ancak hukuki, vergisel ve bankacılık uygulaması açısından iki ürün arasında belirgin farklar bulunur.",
            "En önemli ayrım vergi muafiyetidir. Konut kredilerinde kanun gereği uygulanan BSMV ve KKDF muafiyeti ticari gayrimenkul alımlarında geçerli değildir."
          ],
          bullets: [
            "Vergi Rejimi: Konut kredileri BSMV ve KKDF'den tamamen muaftır (%0); iş yeri kredilerinde BSMV ve kullanıma göre KKDF tahakkuk eder.",
            "Vade Seçenekleri: Konut kredilerinde 120 - 240 ay vadeler yaygınken, iş yeri kredilerinde bankalar genellikle en fazla 60 - 120 ay vade sunar.",
            "Ekspertiz ve Finansman Oranı: Konutlarda enerji sınıfına göre %90'a varan kredi oranları bulunabilirken, iş yeri kredilerinde genellikle ekspertiz değerinin en fazla %50 - %75'i finanse edilir."
          ]
        },
        {
          title: "Vergi Mevzuatı: BSMV ve KKDF Uygulaması",
          paragraphs: [
            "İş yeri kredilerinde faiz üzerinden hesaplanan yasal kesintiler, kredinin kullanım amacına ve müşteri niteliğine göre 6802 sayılı Gider Vergileri Kanunu ve ilgili Bakanlar Kurulu / Cumhurbaşkanı Kararları doğrultusunda uygulanır.",
            "Kredi hesaplayıcımızda sunulan üç farklı vergi rejiminin detayları aşağıda özetlenmiştir:"
          ],
          bullets: [
            "Ticari Müşteri Rejimi: Şirketler, şahıs işletmeleri ve mesleki faaliyet yürüten tüzel/gerçek kişiler için faiz üzerinden %5 BSMV alınır, TL ticari kredilerde KKDF oranı %0'dır.",
            "Bireysel Tüketici Rejimi: Ticari vergi levhası bulunmayan gerçek kişilerin şahsi gayrimenkul yatırımı kapsamında kullandığı kredilerde faiz üzerinden %15 BSMV ve %15 KKDF tahakkuk eder.",
            "Vergisiz Karşılaştırma Modu: Kanuni bir muafiyet olmayıp, yalnızca brüt akdi faiz amortismanını incelemek ve vergisiz çıplak maliyetle kıyaslama yapmak amacıyla sunulan matematiksel simülasyon seçeneğidir."
          ]
        },
        {
          title: "Banka Masrafları, Ekspertiz ve İpotek Süreçleri",
          paragraphs: [
            "Kredi çekerken yalnızca aylık taksitlere değil, tahsis sürecinde peşin veya kredilendirilerek tahsil edilen tek seferlik masraflara da dikkat edilmelidir.",
            "Kredi masrafları müşteri türüne göre farklı mevzuatlara tabidir. Bireysel yatırımcı kredilerinde TCMB 2020/7 Tebliği uyarınca tahsis ücreti kredi tutarının binde 5'ini (‰5) aşamaz. Ticari nitelikli iş yeri kredilerinde ise TCMB'nin Ticari Müşterilerden Alınabilecek Ücretlere İlişkin 2020/4 sayılı Tebliği hükümleri uygulanır; bankalar tahsis edilen limit üzerinden 'Kredi Tahsis Ücreti' ve kullandırılan tutar üzerinden 'Kredi Kullandırım Ücreti'ni ayrı kalemler olarak tahsil edebilir. Ayrıca SPK lisanslı gayrimenkul değerleme şirketine ödenen ekspertiz raporu bedeli, tapu ipotek tesis/tescil harçları ve zorunlu sigortalar müşteriye aittir."
          ]
        },
        {
          title: "Kredi Koşulları, Peşinat Oranı ve Vade Sınırları",
          paragraphs: [
            "İş yeri kredisi onayında işletmenin veya başvuru sahibinin mali verileri, gelir tablosu, vergi levhası ve KKB kredi notu belirleyicidir.",
            "Kredilendirilmeyen %25 ila %50 arasındaki peşinat tutarının hazır bulundurulması ve tapu devri sırasında banka avukatı eşliğinde ipotek işlemlerinin tamamlanması gerekir."
          ]
        }
      ],
      example: {
        title: "Örnek Hesaplama: 1.000.000 TL 60 Ay Ticari İş Yeri Kredisi",
        text: "1.000.000 TL tutarında bir iş yeri kredisi, aylık %3,50 akdi faiz oranı ve 60 ay vade ile ticari müşteri statüsünde (%5 BSMV, %0 KKDF) hesaplandığında; efektif aylık oran %3,675 olur. Aylık eşit taksit tutarı 41.511,28 TL olarak belirlenir. 5 yıllık vade sonunda toplam 1.419.691,77 TL faiz ve 70.984,62 TL BSMV ödenerek toplam geri ödeme tutarı 2.490.676,39 TL'ye ulaşır."
      },
      sources: [
        { name: "TCMB - Ticari Müşterilerden Alınabilecek Ücretler Tebliği (Sayı: 2020/4)", url: "https://www.tcmb.gov.tr" },
        { name: "Gelir İdaresi Başkanlığı - 6802 Sayılı Gider Vergileri Kanunu (BSMV)", url: "https://www.gib.gov.tr" },
        { name: "Bankacılık Düzenleme ve Denetleme Kurumu (BDDK) - Kredi Yönetmelikleri", url: "https://www.bddk.org.tr" }
      ]
    },
    relatedCalculators: ["ticari-kredi", "konut-kredisi", "ihtiyac-kredisi", "kredi-yillik-maliyet-orani"]
  },
  fields: [
    {
      id: 'loanAmount',
      label: 'Kredi Tutarı',
      type: 'currency',
      required: true,
      min: 1,
      max: 100000000,
      defaultValue: 1000000,
      placeholder: 'Örn: 1.000.000',
      description: 'Satın alınacak dükkan, ofis veya iş yeri için talep edilen finansman tutarı.'
    },
    {
      id: 'monthlyInterestRate',
      label: 'Aylık Faiz Oranı (%)',
      type: 'percentage',
      required: true,
      min: 0,
      max: 100,
      step: 0.01,
      defaultValue: 3.50,
      placeholder: 'Örn: 3,50',
      description: 'Bankanın uyguladığı aylık akdi faiz oranı (brüt oran).'
    },
    {
      id: 'termMonths',
      label: 'Vade (Ay)',
      type: 'number',
      required: true,
      min: 1,
      max: 120,
      step: 1,
      defaultValue: 60,
      placeholder: 'Örn: 60',
      description: 'Geri ödeme süresi (Bankaların iş yeri kredisi ürünlerinde azami vade piyasa teamülü olarak genellikle 60 ila 120 aydır; bu süre kanuni bir yasak değil, bankaların kredi tahsis ve risk politikası sınırıdır).'
    },
    {
      id: 'customerType',
      label: 'Kredi / Vergi Rejimi',
      type: 'select',
      required: false,
      defaultValue: 'commercial',
      options: [
        { label: 'Ticari Müşteri / Şirket (%5 BSMV, %0 KKDF)', value: 'commercial' },
        { label: 'Bireysel Yatırımcı / Tüketici (%15 BSMV, %15 KKDF)', value: 'individual' },
        { label: 'Vergisiz Karşılaştırma Modu (Yalın Faiz, %0 Vergi)', value: 'exempt' }
      ],
      description: 'Kredinin ticari faaliyet veya bireysel yatırım kapsamında kullanılmasına göre yasal BSMV ve KKDF oranları değişir. Vergisiz seçenek kanuni muafiyet değil, brüt faiz simülasyon modudur.'
    }
  ],
  schema,
  calculate: (input) => {
    return calculateWorkplaceLoan(
      input.loanAmount,
      input.monthlyInterestRate,
      input.termMonths,
      input.customerType
    );
  }
};
