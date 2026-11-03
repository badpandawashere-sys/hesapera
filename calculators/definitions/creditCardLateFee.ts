import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateCreditCardLateFee } from '../formulas/creditCardLateFee';

const schema = z.object({
  overdueAmount: z.number().positive('Geciken tutar 0 dan büyük olmalıdır'),
  monthlyDelayRate: z.number().min(0, 'Aylık faiz oranı negatif olamaz'),
  delayDays: z.number().min(0, 'Gün sayısı negatif olamaz')
});

type Input = z.infer<typeof schema>;

export const creditCardLateFeeCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_creditCardLateFee_001',
  slug: 'kredi-karti-gecikme-faizi',
  status: 'published',
  name: 'Kredi Kartı Gecikme Faizi Hesaplama',
  shortDescription: 'Bankanızın uyguladığı aylık gecikme faiz oranını girerek kredi kartı gecikme faizinizi ve tahmini toplam borcunuzu hesaplayın.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Kartı Gecikme Faizi Hesaplama Aracı | Hesapera',
    description: 'Bankanızın uyguladığı aylık faiz oranı üzerinden kredi kartı gecikme faizini ve toplam borcunuzu hesaplayın.',
    keywords: ["kredi kartı gecikme faizi","gecikme zammı","temerrüt","kredi kartı borcu","TCMB azami oran"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/kredi-karti-gecikme-faizi',
    faq: [
      {
        question: "Hesaplayıcının bulduğu miktar ekstredekiyle neden ufak fark gösterebilir?",
        answer: "Hesaplayıcımız saf gecikme faizini ve üzerine eklenen %15 KKDF ile %15 BSMV tutarlarını standart kuruş hassasiyetinde hesaplar. Banka ekstreniz ile hesaplayıcı arasında oluşabilecek farklar şu temel nedenlerden ileri gelebilir: 1) Banka Faiz Oranı: Bankanızın uyguladığı fiili gecikme faizi oranı, TCMB'nin ilan ettiği azami tavanı aşmamak kaydıyla farklı olabilir. 2) Faiz Matrahı: 5464 sayılı Kanun m. 26 gereğince gecikme faizi yalnızca asgari tutarın ödenmeyen kısmına işletilir; asgariyi aşan borca akdi faiz uygulanır; ayrıca nakit avans veya taksitli işlemlerin ekstrenizdeki ayrımı matrahı değiştirebilir. 3) Ödeme Tarihi ve Valör: Son ödeme gününün resmî tatil veya hafta sonuna denk gelmesi durumunda bankaların valör ve faiz gününü sonraki iş gününe kaydırması ya da ara kısmi ödemelerin gün hesabı. 4) Yuvarlama Yöntemi: Bankaların muhasebe sistemlerinde vergileri (KKDF/BSMV) her vergi kalemi için bağımsız olarak mı, yoksa toplam %30 üzerinden kümülatif olarak mı kuruşa yuvarladığına bağlı olarak yarım kuruş sınırlarında 1 kuruşluk teknik yuvarlama farkları oluşabilmektedir."
      },
      {
        question: "Sabit bir TCMB gecikme faizi oranı var mıdır?",
        answer: "Hayır. TCMB, kredi kartı azami akdi ve gecikme faiz oranlarını referans faiz oranına bağlı olarak dönemsel olarak belirler. TCMB'nin yürürlükteki resmî düzenlemelerinde Türk Lirası kredi kartları için dönem borcu büyüklüğüne göre üç kademeli barem ve net sınır durumları uygulanmaktadır: 1. Kademe: 30.000 TL altında kalan dönem borçları (örneğin 29.999,99 TL dahil), 2. Kademe: 30.000 TL ile 180.000 TL arasındaki dönem borçları (30.000,00 TL ve 180.000,00 TL sınırları dahil), 3. Kademe: 180.000 TL üzerindeki dönem borçları (180.000,01 TL ve üzeri). Yabancı para kart borçları için ise tek bir tavan belirlenmiştir. Bankalar bu tavanları aşamaz. Doğru sonuç için kendi ekstrenizde belirtilen aylık gecikme faiz oranını araca girmeniz gerekir."
      },
      {
        question: "Asgari tutarın üzerindeki borç için gecikme faizi işler mi?",
        answer: "Hayır. 5464 sayılı Kanun m. 26 gereğince gecikme faizi yalnızca asgari ödeme tutarının ödenmeyen (gecikmeye giren) kısmına uygulanır. Asgari tutarın üzerinde kalan dönem borcu bakiyesine ise gecikme faizi değil, daha düşük olan 'akdi faiz (alışveriş faizi)' işletilir."
      }
    ],
    content: {
      intro: "Kredi kartı dönem borcunun ödenmeyen asgari kısmına 5464 sayılı Kanun ve TCMB düzenlemeleri çerçevesinde işletilen günlük faizin ve yasal vergilerin (KKDF ve BSMV) çalışma mantığı.",

      sections: [
        {
          title: "Kredi Kartı Gecikme Faizi Nedir?",
          paragraphs: [
            "Kredi kartı dönem ekstrenizde belirtilen son ödeme tarihine kadar 'asgari ödeme tutarının' altında bir ödeme yaparsanız veya hiç ödeme yapmazsanız, eksik kalan asgari tutara uygulanan faize 'Gecikme Faizi' denir.",
            "5464 sayılı Banka Kartları ve Kredi Kartları Kanunu'nun 26. maddesi gereğince gecikme faizi yalnızca asgari tutarın ödenmeyen kısmına işletilebilir. Asgari tutarı tam ödeyip dönem borcunun kalanını bırakırsanız, kalan bakiyeye gecikme faizi değil akdi faiz uygulanır."
          ]
        },
        {
          title: "Hesaplama Yöntemi (TCMB Basit Günlük Model)",
          paragraphs: [
            "Kredi kartı faiz oranları aylık yüzde olarak ilan edilir; ancak bankacılık sisteminde faiz günlük olarak tahakkuk ettirilir. TCMB 2020/16 sayılı Tebliği uyarınca günlük faiz oranı, aylık faiz oranının 30'a bölünmesiyle (Aylık Oran / 30) bulunur.",
            "Gecikmeye giren tutar, günlük oran ve gecikilen gün sayısı çarpılarak saf gecikme faizi hesaplanır. Ardından bireysel kredi kartları için mevzuat gereği bu net faiz tutarı üzerinden %15 KKDF ve %15 BSMV hesaplanarak nihai toplam borca eklenir."
          ]
        },
        {
          title: "TCMB Kademeli Tavan Oranları ve Masraflar",
          paragraphs: [
            "Türkiye Cumhuriyet Merkez Bankası (TCMB), kredi kartı azami akdi ve gecikme faiz oranlarını piyasa koşullarına ve referans faize göre dönemsel olarak yayımlar. TCMB'nin resmî tablosunda TL cinsi kredi kartı dönem borçları üç bareme ayrılmıştır: 30.000 TL altında kalan borçlar (1. Kademe, örneğin 29.999,99 TL dahil), 30.000 TL ile 180.000 TL arasında kalan borçlar (2. Kademe, 30.000,00 TL ve 180.000,00 TL dahil) ve 180.000 TL üzerinde kalan borçlar (3. Kademe, örneğin 180.000,01 TL ve üzeri). Yabancı para borçları için ise tek bir azami oran belirlenir. Bu baremler bankaların tüketiciden talep edebileceği en yüksek yasal tavanları gösterir.",
            "Önemli Ayrım: Aracımızda varsayılan olarak yer alan aylık %4,25 oranı, yürürlükteki bir zorunlu sabit oran veya banka oranı olmayıp, yalnızca hesaplama adımlarını ve vergi tahakkukunu somutlaştırmak için kullanılan bir 'örnek orandır'. Gerçek borç maliyetinizi hesaplamak için kredi kartı hesap özetinizdeki (ekstrenizdeki) güncel gecikme faiz oranını ilgili alana girmelisiniz."
          ]
        },
      ],
      example: {
        title: "10.000 TL Kredi Kartı Gecikme Faizi ve Vergi Hesaplama Örneği",
        text: "Kredi kartı ekstrenizde asgari ödeme tutarının 10.000 TL'lik kısmının ödenmediğini ve 15 gün boyunca gecikmede kaldığını varsayalım. Bankanın aylık gecikme faizi oranının örnek olarak %4,25 olduğunu kabul edelim (Günlük faiz oranı: %4,25 / 30 = %0,141667):\n\n1. Saf Gecikme Faizi: 10.000 TL × (0,0425 / 30) × 15 = 212,50 TL\n2. KKDF Kesintisi (%15): 212,50 TL × 0,15 = 31,88 TL (Yarım kuruş kuralına göre 31,875 TL yukarı yuvarlanır)\n3. BSMV Kesintisi (%15): 212,50 TL × 0,15 = 31,88 TL (Yarım kuruş kuralına göre 31,875 TL yukarı yuvarlanır)\n4. Toplam Gecikme Maliyeti: 212,50 TL + 31,88 TL + 31,88 TL = 276,26 TL\n5. Bankaya Ödenecek Toplam Tutar: 10.000 TL + 276,26 TL = 10.276,26 TL\n\nTeknik Yuvarlama ve Oran Notu: Hesapera, her bir yasal vergi kalemini (KKDF %15 ve BSMV %15) bağımsız olarak kuruşa yuvarlayan standart muhasebe yöntemini uygulamaktadır. Bazı bankaların sistemlerinde vergilerin kümülatif çarpanla (%30) tek kalemde yuvarlanması nedeniyle yarım kuruş sınırlarında ekstre ile araç arasında 1 kuruşluk teknik yuvarlama farkı oluşabilmektedir. Aylık %4,25 oranı yalnızca örnek bir oran olup, güncel oranlar için TCMB azami faiz tabloları referans alınmalıdır."
      },
      sources: [
        {
          name: "TCMB – Kredi Kartı İşlemlerinde Uygulanacak Azami Faiz Oranları Resmî Tablosu",
          url: "https://www.tcmb.gov.tr/wps/wcm/connect/tr/tcmb+tr/main+menu/istatistikler/bankacilik+verileri/kredi+karti+islemlerinde+uygulanacak+azami+faiz+oranlari"
        },
        {
          name: "5464 sayılı Banka Kartları ve Kredi Kartları Kanunu Madde 26 (Mevzuat Bilgi Sistemi)",
          url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5464&MevzuatTur=1&MevzuatTertip=5"
        },
        {
          name: "TCMB 2020/16 Sayılı Kredi Kartı İşlemlerinde Uygulanacak Azami Faiz Oranları Hakkında Tebliğ (Resmî Gazete)",
          url: "https://www.resmigazete.gov.tr/eskiler/2020/10/20201031-4.htm"
        }
      ]
    },

    relatedCalculators: ['kredi-karti-asgari-odeme-tutari', 'ihtiyac-kredisi']
  },
  fields: [
    {
      id: "overdueAmount",
      label: "Gecikmeye Giren Tutar",
      type: "currency",
      required: true,
      min: 0
    },
    {
      id: "monthlyDelayRate",
      label: "Aylık Gecikme Faiz Oranı (%)",
      type: "number",
      required: true,
      min: 0,
      step: 0.01,
      description: "Bankanızın uyguladığı gerçek gecikme faiz oranını giriniz."
    },
    {
      id: "delayDays",
      label: "Gecikme Gün Sayısı",
      type: "number",
      required: true,
      min: 0
    }
  ],
  schema,
  calculate: (input) => {
    return calculateCreditCardLateFee(
      input.overdueAmount,
      input.monthlyDelayRate,
      input.delayDays
    );
  }
};
