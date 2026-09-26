import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMaas } from '../formulas/maas';

const schema = z.object({
  grossSalary: z.number().min(33030),
  employerDiscountType: z.enum(['none', 'other', 'manufacturing'])
});

type Input = z.infer<typeof schema>;

export const maasCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_maas_001',
  slug: 'maas',
  status: 'published',
  name: 'Maaş Hesaplama',
  shortDescription: '2026 brüt maaşınızı girerek aylık net maaşınızı, SGK ve vergi kesintilerini, vergi dilimlerini ve yıllık maaş tablonuzu hesaplayın.',
  category: 'other',
  type: 'simple',
  fields: [],
  schema,
  calculate: (input) => calculateMaas(input),
  metadata: {
    title: 'Maaş Hesaplama 2026 – Brüt Maaştan Aylık Net Maaş',
    description: '2026 brüt maaşınızı girerek aylık net maaşınızı, SGK ve vergi kesintilerini, vergi dilimlerini ve yıllık maaş tablonuzu hesaplayın.',
    keywords: ['maaş hesaplama', 'brütten nete maaş hesaplama', '2026 maaş hesaplama', 'net maaş hesaplama', 'maaş bordrosu hesaplama', 'sgk kesintisi', 'gelir vergisi'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/maas',
    icon: 'Wallet',
    content: {
      intro: 'Maaş Hesaplama aracı ile 2026 yılı Türkiye yasal mevzuatına göre standart 4/a ücretli çalışan için brüt maaşınızdan kesilecek olan SGK, işsizlik sigortası, gelir vergisi ve damga vergisi kesintilerini hesaplayabilir, 12 aylık net maaş tablonuzu görebilirsiniz.',
      sections: [
        {
          title: '1. Maaş hesaplama nasıl yapılır?',
          paragraphs: ['Aylık brüt maaşınız üzerinden yasal oranlara göre SGK ve İşsizlik Sigortası işçi payları kesilir. Kalan tutar üzerinden kümülatif gelir vergisi matrahı bulunur. Yıl içindeki toplam vergi matrahınıza göre ilgili vergi diliminden gelir vergisi hesaplanır ve asgari ücret gelir vergisi istisnası düşülür. Son olarak damga vergisi kesilerek net maaş bulunur.']
        },
        {
          title: '2. Brüt maaş ile net maaş arasındaki fark nedir?',
          paragraphs: ['Brüt maaş, işverenin size ödemeyi taahhüt ettiği, üzerinde tüm vergi ve yasal kesintilerin (SGK, işsizlik, gelir vergisi, damga vergisi) bulunduğu ham tutardır. Net maaş ise bu yasal kesintiler yapıldıktan sonra banka hesabınıza yatırılan ve harcamaya hazır olan gerçek tutardır.']
        },
        {
          title: '3. 2026 asgari ücret ne kadar?',
          paragraphs: ['Çalışma ve Sosyal Güvenlik Bakanlığı tarafından açıklanan 2026 yılı asgari ücret tutarı brüt 33.030,00 TL, yasal kesintiler sonrası net ise 28.075,50 TL olarak belirlenmiştir. Bu tutarın altındaki rakamlarla tam zamanlı çalışma yapılamaz.']
        },
        {
          title: '4. SGK işçi payı nasıl hesaplanır?',
          paragraphs: ['Çalışanın brüt maaşı (prime esas kazanç) üzerinden SGK için %14 oranında kesinti yapılır. Ancak, SGK prim kesintisi üst sınırı (SGK Tavanı) bulunur. 2026 yılı için aylık prime esas kazanç (PEK) tavanı 297.270,00 TL\'dir. Brüt maaşınız bu tavanın üzerindeyse, %14\'lük kesinti tavan ücret üzerinden yapılır.']
        },
        {
          title: '5. İşsizlik sigortası işçi payı nedir?',
          paragraphs: ['SGK işçi payına ek olarak, çalışanların brüt maaşı üzerinden %1 oranında İşsizlik Sigortası Primi kesilir. Tıpkı SGK priminde olduğu gibi, bu kesinti de aylık PEK tavanı üzerinden hesaplanır.']
        },
        {
          title: '6. Gelir vergisi matrahı nasıl hesaplanır?',
          paragraphs: ['Brüt maaştan SGK işçi payı (%14) ve İşsizlik Sigortası işçi payı (%1) çıkarıldıktan sonra kalan tutar, o ayın Gelir Vergisi Matrahı\'nı oluşturur. Gelir Vergisi, brüt maaş üzerinden değil, bu vergi matrahı üzerinden hesaplanır. Vergi oranınız için [Yüzde Hesaplama](/hesaplama/yuzde) mantığını inceleyebilirsiniz.']
        },
        {
          title: '7. Kümülatif vergi matrahı nedir?',
          paragraphs: ['Kümülatif vergi matrahı, yılın başından itibaren elde ettiğiniz aylık gelir vergisi matrahlarının toplanarak birikmesiyle oluşur. Türkiye\'de uygulanan artan oranlı vergi sistemi nedeniyle, birikimli matrahınız arttıkça yıl içinde daha yüksek vergi dilimlerine geçersiniz.']
        },
        {
          title: '8. Vergi dilimi değişince net maaş neden düşer?',
          paragraphs: ['Gelir İdaresi Başkanlığı tarifesine göre 2026 yılı ücret gelirleri için vergi dilimleri %15 ile başlar ve %40\'a kadar çıkar. Kümülatif vergi matrahınız üst dilim sınırını aştığında, aşan kısım için daha yüksek oranda vergi hesaplanır. Bu artan vergi yükü, brüt maaşınız sabit kalsa bile ilerleyen aylarda net maaşınızın düşmesine sebep olur.']
        },
        {
          title: '9. Asgari ücret gelir vergisi istisnası nasıl uygulanır?',
          paragraphs: ['2022 yılından beri uygulanan kanuna göre tüm çalışanların maaşlarının asgari ücrete kadar olan kısmı gelir ve damga vergisinden istisnadır. Bu istisna sabit bir tutar değildir; asgari ücretin vergi matrahının da her ay kümülatif olarak kümülatif vergi dilimine girmesiyle artan oranda hesaplanarak toplam vergiden düşülür.']
        },
        {
          title: '10. Damga vergisi maaşta nasıl hesaplanır?',
          paragraphs: ['Maaşlardan binde 7,59 (0.00759) oranında damga vergisi kesilir. Ancak asgari ücretin brüt tutarı damga vergisinden muaf olduğu için, damga vergisi yalnızca brüt maaşınızın asgari ücreti aşan kısmı üzerinden hesaplanır. Brüt maaşı asgari ücret olan bir çalışandan damga vergisi kesilmez.']
        },
        {
          title: '11. SGK prim tavanı nedir?',
          paragraphs: ['Yüksek ücretli çalışanların SGK ve işsizlik sigortası primlerinin hesaplanmasında üst sınır uygulanır. 2026 yılı için aylık SGK PEK tavanı 297.270,00 TL\'dir. Brüt ücretiniz 400.000 TL olsa dahi, SGK prim kesintileriniz yalnızca tavan olan 297.270 TL üzerinden yapılır.']
        },
        {
          title: '12. İşveren maliyeti nasıl hesaplanır?',
          paragraphs: ['İşverenler çalışana ödedikleri brüt maaşa ek olarak SGK ve işsizlik primi öderler. 2026 yılı için indirimsiz SGK işveren payı %21,75 (işsizlik hariç) seviyesindedir. Ancak düzenli prim ödeyen diğer sektörlerde 2 puanlık indirim ile %19,75\'e, imalat sektöründe ise 5 puanlık indirim ile %16,75\'e düşebilmektedir. Asgari ücret desteği veya özel teşvikler bu standart bordro hesabına dahil edilmemiştir. Planlanan [Zam Hesaplama](/hesaplama/zam-hesaplama) stratejilerinde işveren maliyeti göz önünde bulundurulmalıdır.']
        }
      ]
    },
    faq: [
      { question: '2026 net asgari ücret ne kadar?', answer: '2026 yılı için yasal net asgari ücret 28.075,50 TL olarak belirlenmiştir.' },
      { question: 'Brüt maaştan net maaş nasıl hesaplanır?', answer: 'Brüt maaşınızdan önce %14 SGK ve %1 İşsizlik primi kesilir. Kalan matrah üzerinden kümülatif vergi dilimine göre gelir vergisi hesaplanır, asgari ücret istisnası düşülür. Son olarak damga vergisi de kesilerek net maaş elde edilir.' },
      { question: 'Maaştan yüzde kaç SGK kesilir?', answer: 'Standart ücretli çalışanların brüt maaşlarından %14 oranında SGK işçi payı kesilir.' },
      { question: 'İşsizlik sigortası kesintisi yüzde kaçtır?', answer: 'Çalışanların brüt maaşlarından (PEK tavanını aşmamak şartıyla) %1 oranında işsizlik sigortası kesilir.' },
      { question: 'Gelir vergisi dilimi nasıl değişir?', answer: '2026 tarifesine göre vergi dilimleri 190.000 TL\'ye kadar %15, sonrasında %20, 400.000 TL sonrasında %27, 1.500.000 TL sonrasında %35 ve 5.300.000 TL sonrasında %40 olarak kümülatif uygulanan oranlardır.' },
      { question: 'Asgari ücret vergi istisnası nedir?', answer: 'Tüm ücretli çalışanların maaşlarının asgari ücrete denk gelen kısmı üzerinden gelir ve damga vergisi ödememesini sağlayan yasal düzenlemedir.' },
      { question: 'Maaş neden yılın ilerleyen aylarında düşer?', answer: 'Kümülatif gelir vergisi matrahınız yıl boyunca biriktiği için yılın ortalarında veya sonlarında üst vergi dilimlerine geçiş yaparsınız. Artan vergi oranı net maaşınızı düşürür.' },
      { question: 'SGK prim tavanı nedir?', answer: '2026 yılı için aylık prime esas kazanç üst sınırı 297.270,00 TL\'dir. Brüt maaşınız ne kadar yüksek olursa olsun, prim kesintileri bu tutarı aşamaz.' },
      { question: 'İşveren maliyeti nasıl hesaplanır?', answer: 'Çalışanın brüt maaşına SGK ve işsizlik sigortası işveren payı eklenir. 2026 standart oran indirimsiz %21,75 iken; diğer sektörlerde 2 puanlık indirimle %19,75\'e, imalat sektöründe ise 5 puanlık indirimle %16,75\'e inmektedir. Asgari ücret desteği veya diğer özel teşvikler hesaplamaya dahil edilmemiştir.' },
      { question: 'Brüt maaş her ay aynıysa net maaş neden değişir?', answer: 'Brüt maaşınız her ay aynı kalsa da artan oranlı gelir vergisi sisteminden ötürü ilerleyen aylarda ödediğiniz gelir vergisi tutarı artacağından net maaşınız aydan aya farklılık gösterir.' }
    ]
  }
};
