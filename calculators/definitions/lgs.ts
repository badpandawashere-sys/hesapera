import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateLgs } from '../formulas/lgs';

const schema = z.object({
  turkceC: z.number().int().min(0).max(20).optional().default(0),
  turkceW: z.number().int().min(0).max(20).optional().default(0),
  matematikC: z.number().int().min(0).max(20).optional().default(0),
  matematikW: z.number().int().min(0).max(20).optional().default(0),
  fenC: z.number().int().min(0).max(20).optional().default(0),
  fenW: z.number().int().min(0).max(20).optional().default(0),
  inkilapC: z.number().int().min(0).max(10).optional().default(0),
  inkilapW: z.number().int().min(0).max(10).optional().default(0),
  dinC: z.number().int().min(0).max(10).optional().default(0),
  dinW: z.number().int().min(0).max(10).optional().default(0),
  dinMuaf: z.boolean().optional().default(false),
  yabanciDilC: z.number().int().min(0).max(10).optional().default(0),
  yabanciDilW: z.number().int().min(0).max(10).optional().default(0),
  yabanciDilMuaf: z.boolean().optional().default(false)
});

type Input = z.infer<typeof schema>;

export const lgsCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_lgs_001',
  slug: 'lgs-puan',
  status: 'published',
  name: 'LGS Puan Hesaplama',
  shortDescription: '2026 LGS Sözel ve Sayısal testlerinde doğru ve yanlış sayılarınıza göre netlerinizi hesaplayın. MEB resmî değerlendirme yöntemini inceleyin.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'LGS Puan ve Net Hesaplama 2026 | Hesapera',
    description: '2026 LGS Türkçe, Matematik, Fen ve sözel testlerde doğru/yanlış sayılarınıza göre netlerinizi hesaplayın; MEB\'in resmî Merkezî Sınav Puanı değerlendirme yöntemini inceleyin.',
    keywords: ['lgs puan hesaplama', 'lgs 2026', 'liselere giriş sınavı puan', 'lgs net hesaplama', 'lgs katsayıları', 'lgs merkezi sınav puanı'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/lgs-puan',
    faq: [
      {
        question: "LGS'de 3 yanlış 1 doğruyu götürür mü?",
        answer: "Evet. Sınava giren öğrencilerin ilgili alt testlere ait ham puanı, o teste ait doğru cevap sayısından yanlış cevap sayısının üçte biri çıkarılarak (Doğru - Yanlış/3) hesaplanır. Negatif netler 0'a eşitlenmez, hesaplamaya olduğu gibi dahil edilir."
      },
      {
        question: "LGS Türkçe testi kaç sorudur?",
        answer: "Sözel bölümün en yüksek katsayılı (4) testi olan Türkçe testi toplam 20 sorudan oluşmaktadır."
      },
      {
        question: "LGS Matematik testi kaç sorudur?",
        answer: "Sayısal bölümün bir parçası olan Matematik testinde öğrencilere toplam 20 soru yöneltilmektedir."
      },
      {
        question: "LGS Fen Bilimleri testi kaç sorudur?",
        answer: "Sayısal bölümün diğer testi olan Fen Bilimleri testinde de toplam 20 soru bulunmaktadır."
      },
      {
        question: "LGS Sözel bölüm kaç sorudur ve süresi nedir?",
        answer: "LGS Sözel bölümü; Türkçe (20), T.C. İnkılap Tarihi ve Atatürkçülük (10), Din Kültürü ve Ahlak Bilgisi (10) ile Yabancı Dil (10) olmak üzere toplam 50 sorudan oluşur. Öğrencilere verilen cevaplama süresi 75 dakikadır."
      },
      {
        question: "LGS Sayısal bölüm kaç sorudur ve süresi nedir?",
        answer: "LGS Sayısal bölümü; Matematik (20) ve Fen Bilimleri (20) olmak üzere toplam 40 sorudan oluşur ve öğrencilere 80 dakika cevaplama süresi verilir."
      },
      {
        question: "Merkezî Sınav Puanı (MSP) nedir?",
        answer: "MSP, öğrencilerin sınavla öğrenci alan ortaöğretim kurumlarına (liselere) yerleştirilmesinde kullanılan, 100 ile 500 aralığında değerlendirilen standart puandır."
      },
      {
        question: "LGS Standart Puan (SP) nasıl hesaplanır?",
        answer: "MEB her alt test için öğrencilerin ham puan (net) ortalamasını ve standart sapmasını bulur. Öğrencinin o testteki ham puanından test ortalaması çıkarılır ve sonuç testin standart sapmasına bölünür. Elde edilen değer 10 ile çarpılıp 50 eklenerek öğrencinin o testteki Standart Puanı (SP) bulunur."
      },
      {
        question: "LGS'de ders katsayıları nelerdir?",
        answer: "Her bir alt testin standart puanı kendi katsayısı ile çarpılır. Türkçe, Matematik ve Fen Bilimleri katsayısı 4'tür. T.C. İnkılap Tarihi, Din Kültürü ve Yabancı Dil derslerinin katsayısı ise 1'dir."
      },
      {
        question: "Toplam Ağırlıklı Standart Puan (TASP) nedir?",
        answer: "Her bir alt testten elde edilen Ağırlıklı Standart Puanların toplanmasıyla adayın Toplam Ağırlıklı Standart Puanı (TASP) bulunur."
      },
      {
        question: "Neden yalnız doğru ve yanlış sayılarından kesin MSP hesaplanamaz?",
        answer: "Çünkü MEB formülü, tüm sınava giren öğrencilerin net ortalamalarını ve standart sapmalarını (zorluk/başarı eğrisi) hesaba katar. Sınavın o yılki zorluğuna göre 10 net yapan bir öğrencinin alacağı puan yıldan yıla değişir. Salt katsayıların (4 ve 1) doğrudan netlerle çarpılarak 100 eklenmesi resmî bir formül değildir ve yanıltıcıdır."
      },
      {
        question: "LGS Merkezî Sınav Puanı neden 100-500 aralığındadır?",
        answer: "Adayların hesaplanan Toplam Ağırlıklı Standart Puanları (TASP), sınava giren adaylar içindeki en küçük ve en büyük TASP değerleri dikkate alınarak özel bir formülle 100 (taban) ve 500 (tavan) aralığına doğrusal olarak dönüştürülür."
      },
      {
        question: "LGS Din Kültürü testinden muafiyet var mıdır?",
        answer: "Evet, Din Kültürü ve Ahlak Bilgisi dersinden muaf olan öğrenciler bu testi çözmek zorunda değildir. Bu öğrencilerin Din Kültürü ağırlıklı standart puanı, diğer testlerdeki başarı oranlarına göre MEB tarafından özel bir formülle telafi edilerek hesaplanır."
      },
      {
        question: "LGS Yabancı Dil muafiyeti nasıldır?",
        answer: "Özel eğitim ihtiyacı olan bazı öğrenciler ile belirli koşulları taşıyan öğrenciler Yabancı Dil testinden muaf tutulabilir. Din Kültürü'nde olduğu gibi eksik olan bu testin puanı, diğer alanlardaki performansa dayalı özel bir formülle telafi edilir."
      },
      {
        question: "LGS'de Yüzdelik Dilim neden puandan daha önemlidir?",
        answer: "Sınavın zor veya kolay olması puanları dalgalandırır; ancak yüzdelik dilim öğrencinin o yıl sınava giren tüm adaylar içindeki sıralamasını gösterdiği için okul yerleştirmelerinde en belirleyici temel kriterdir."
      },
      {
        question: "2026 LGS sınav ve sonuç tarihi ne zamandır?",
        answer: "MEB tarafından yayımlanan takvime göre 2026 LGS Merkezî Sınavı 13 Haziran 2026 tarihinde uygulanacak ve sınav sonuçları 10 Temmuz 2026'da açıklanacaktır."
      }
    ],
    content: {
      intro: "LGS (Liselere Geçiş Sistemi) Merkezî Sınavı puan değerlendirmesi, net hesabı, katsayılar ve resmî MEB sistemi hakkında 2026 güncel rehberi.",
      sections: [
        {
          title: "Doğru ve Yanlışlardan Ham Puan (Net) Hesabı",
          paragraphs: [
            "2026 LGS'de öğrencilere Sözel bölümde 50 (75 dakika), Sayısal bölümde ise 40 (80 dakika) olmak üzere toplam 90 soru yöneltilmektedir. MEB'in yayımladığı Merkezî Sınav başvuru ve uygulama kılavuzuna göre her alt testin ham puanı, o testteki doğru sayısından yanlış sayısının üçte biri çıkarılarak bulunur (3 yanlış 1 doğruyu götürür).",
            "Önemli bir kural olarak, ham puanlar negatif değerlere inebilmektedir (örneğin 0 doğru 20 yanlış yapan adayın ham puanı -6,67 olur) ve 0'a eşitlenmez."
          ]
        },
        {
          title: "Resmî Standart Puan (SP) ve Ağırlık Katsayıları",
          paragraphs: [
            "Puan hesaplamasında en sık düşülen hata, ham puanların doğrudan 4 ve 1 gibi katsayılarla çarpılarak 100 eklenmesidir. MEB'in resmî uygulamasında ise öğrencinin ham puanı, Türkiye genelindeki test ortalaması ve standart sapması dikkate alınarak önce Standart Puan'a (SP) dönüştürülür.",
            "Elde edilen Standart Puanlar; Türkçe (4), Matematik (4), Fen Bilimleri (4), T.C. İnkılap Tarihi (1), Din Kültürü (1) ve Yabancı Dil (1) katsayılarıyla çarpılarak Toplam Ağırlıklı Standart Puan (TASP) bulunur."
          ]
        },
        {
          title: "Merkezî Sınav Puanı (100-500 Ölçeği)",
          paragraphs: [
            "Tüm öğrencilerin TASP değerleri elde edildikten sonra, en yüksek TASP değerine sahip öğrenci 500 puana, geçerli en düşük TASP'a sahip öğrenci ise 100 puana sabitlenir. Adayların puanları bu aralığa göre yeniden dönüştürülerek kesin Merkezî Sınav Puanı (MSP) açıklanır.",
            "Önceki yıllarda yayımlanan raporlara göre 500 tam puan alan öğrenci sayısı (örneğin geçmiş bir sınavda 452 aday gibi) yıldan yıla farklılık göstermektedir. Kesin yerleştirmelerde ise puandan ziyade elde edilen Yüzdelik Dilim dikkate alınmalıdır."
          ]
        }
      ],
      example: {
        title: "2026 Sınav ve Sonuç Takvimi",
        text: "2026 Merkezî Sınavı 13 Haziran 2026'da gerçekleştirilecek olup, sonuçlar 10 Temmuz 2026'da meb.gov.tr adresi üzerinden adaylara duyurulacaktır. Din veya Yabancı Dil muafiyeti bulunan öğrencilerin puanları, çözmedikleri testin ağırlığı doğrultusunda diğer testlere dağıtılarak hesaplanacaktır."
      }
    },
    relatedCalculators: ['obp-hesaplama', 'takdir-tesekkur-hesaplama']
  },
  fields: [
    // We do not use the explicit fields array for UI rendering in LGS since lgs-form.tsx ignores it.
    // However, keeping it valid for validation checks.
  ],
  schema,
  calculate: (input) => calculateLgs(input)
};
