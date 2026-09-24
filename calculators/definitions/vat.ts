import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKdv } from '../formulas/kdvHesaplama';

const schema = z.object({
  tutar: z.number().min(0, 'Tutar negatif olamaz'),
  oran: z.number().min(0, 'Oran negatif olamaz').max(100, 'Oran 100\'den büyük olamaz'),
  mod: z.enum(['ekle', 'cikar'])
});

type Input = z.infer<typeof schema>;

export const vatCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_kdv_001',
  slug: 'kdv-hesaplama',
  status: 'published',
  name: 'KDV Hesaplama',
  shortDescription: 'KDV dahil veya hariç tutardan KDV tutarını hızlıca hesaplama.',
  category: 'finance',
  type: 'simple',
  metadata: {
    title: 'KDV Hesaplama – KDV Dahil ve Hariç Tutar Hesapla',
    description: 'KDV dahil veya hariç tutardan %1, %10, %20 ya da özel oranla KDV tutarını hesaplayın.',
    keywords: ["kdv hesaplama","kdv dahil","kdv hariç","vergi hesaplama","kdv matrahı"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/kdv-hesaplama',
    infoBox: {
      title: 'KDV Hakkında',
      text: 'KDV oranları işlemin türüne göre %1, %10 veya %20 olarak değişmektedir. Doğru hesaplama için geçerli resmî oranı seçiniz.',
      icon: 'Info'
    },
    features: [
      { label: '%1, %10, %20 Hızlı Seçim', icon: 'Percent' },
      { label: 'KDV Ekleme / Çıkarma', icon: 'Calculator' },
      { label: 'Özel Oran Desteği', icon: 'SlidersHorizontal' }
    ],
    faq: [
      {
        question: 'KDV nasıl hesaplanır?',
        answer: 'KDV, net tutar ile seçilen KDV oranının çarpılıp 100\'e bölünmesiyle hesaplanır. Örneğin, 1000 TL için %20 KDV: (1000 x 20) / 100 = 200 TL\'dir.'
      },
      {
        question: 'KDV dahil fiyattan KDV nasıl çıkarılır?',
        answer: 'KDV dahil fiyattan net tutarı bulmak için tutarı (1 + (Oran/100)) değerine bölmelisiniz. %20 KDV dahil 1200 TL\'nin içindeki KDV\'yi bulmak için 1200 / 1.20 = 1000 TL (Net tutar) işlemi yapılır, aradaki 200 TL fark KDV\'dir.'
      },
      {
        question: '%20 KDV nasıl hesaplanır?',
        answer: '%20 KDV hesaplamak için net tutarı 0.20 ile çarpabilirsiniz. KDV dahil tutarı bulmak için ise net tutarı 1.20 ile çarpmanız yeterlidir.'
      },
      {
        question: '%10 KDV nasıl hesaplanır?',
        answer: '%10 KDV tutarını bulmak için tutarı 0.10 ile çarpın. KDV dahil tutar için net tutarı 1.10 ile çarpmanız gerekir.'
      },
      {
        question: '%1 KDV nasıl hesaplanır?',
        answer: '%1 KDV hesaplamasında net tutar 0.01 ile çarpılır. KDV dahil hesaplama için net tutar 1.01 ile çarpılmalıdır.'
      },
      {
        question: 'KDV matrahı nedir?',
        answer: 'KDV matrahı, üzerinden vergi hesaplanacak olan, yani KDV hariç olan net tutardır. Vergi bu tutar üzerinden ilgili KDV oranı kullanılarak hesaplanır.'
      },
      {
        question: 'KDV oranını nasıl seçmeliyim?',
        answer: 'Türkiye\'de satılan mal veya hizmetin türüne göre KDV oranları %1, %10 veya %20 olarak değişebilmektedir. Doğru oran için işlemin tabi olduğu GİB (Gelir İdaresi Başkanlığı) düzenlemelerini dikkate almalısınız.'
      },
      {
        question: 'Özel oran kullanabilir miyim?',
        answer: 'Evet, KDV Hesaplama aracımızda hazır butonların (%1, %10, %20) yanı sıra "Özel Oran" seçeneğini kullanarak istediğiniz yüzdelik değeri manuel olarak girebilirsiniz.'
      }
    ],
    relatedCalculators: ["yuzde", "oran"],
    content: {
      intro: "Katma Değer Vergisi (KDV), aldığımız mal ve hizmetler üzerinden devlete ödenen bir tüketim vergisidir. KDV Hesaplama Aracı, bir mal veya hizmetin KDV hariç fiyatına vergi eklemeyi veya KDV dahil fiyatı içinden vergiyi ayrıştırmayı hızlıca yapmanızı sağlar.",
      sections: [
        {
          title: "1. KDV Nedir?",
          paragraphs: ["KDV, üretimden tüketime kadar her aşamada eklenen değerin vergilendirildiği bir sistemdir. Günlük hayatta yapılan alışverişlerin büyük çoğunluğunda fiyata dahildir. Vergiyi fiyata dahil ederken veya hariç tutarken temel [Yüzde Hesaplama](/hesaplama/yuzde) mantığı kullanılır."]
        },
        {
          title: "2. KDV Dahil Tutar Nedir?",
          paragraphs: ["Ürünün veya hizmetin kendi değeri (matrahı) üzerine kanunla belirlenmiş KDV oranının eklenmiş, tüketicinin nihai olarak ödediği toplam fiyattır."]
        },
        {
          title: "3. KDV Hariç Tutar Nedir?",
          paragraphs: ["Ürünün gerçek satış değeridir. Vergi dahil edilmeden önceki hali olan bu tutara KDV Matrahı da denir."]
        },
        {
          title: "4. KDV Nasıl Eklenir?",
          paragraphs: ["KDV hariç bir tutara KDV eklerken kullanılan formül: Net Tutar + (Net Tutar x KDV Oranı / 100). Örneğin 100 TL'lik bir ürüne %20 KDV eklendiğinde KDV tutarı 20 TL olur, müşterinin ödeyeceği KDV dahil tutar 120 TL olarak hesaplanır."]
        },
        {
          title: "5. KDV Nasıl Çıkarılır?",
          paragraphs: ["KDV dahil fiyattan KDV'yi çıkarmak, yani matrahı bulmak için tutarı 1 + (KDV Oranı / 100) değerine bölmeniz gerekir. 120 TL'lik (%20 KDV dahil) bir faturanın matrahını bulmak için 120 / 1.20 = 100 TL işlemi yapılır."]
        },
        {
          title: "6. KDV Matrahı Nedir?",
          paragraphs: ["KDV matrahı, verginin üzerinden hesaplanacağı ana tutardır. KDV indirimleri veya tevkifat gibi özel durumlar hariç, temel ürün/hizmet fiyatını ifade eder. Bazen KDV tutarını belirlerken fiyata göre farklı bir [Oran Hesaplama](/hesaplama/oran) yapılması gerekebilir."]
        },
        {
          title: "7. %1, %10 ve %20 Oranları",
          paragraphs: ["Türkiye'de uygulanan temel KDV oranları değişiklik gösterebilir. Gıda ve eğitim gibi temel ihtiyaçlarda düşük oranlar (%1 veya %10) uygulanırken, genel mal ve hizmetlerde standart oran genellikle %20'dir. Hazır oranlar genel hesaplama kolaylığı içindir."]
        },
        {
          title: "8. Doğru KDV Oranı Nasıl Seçilir?",
          paragraphs: ["KDV oranı yapılan işlem türüne göre değiştiğinden, 'Her işlemde mutlaka %20 uygulanır' gibi bir genelleme yanlıştır. Hangi orana tabi olduğunuzu belirlemek için Gelir İdaresi Başkanlığı (GİB) tarafından yayınlanan güncel KDV listelerini ve mevzuatı dikkate almanız önemlidir."]
        },
        {
          title: "9. Özel KDV Oranıyla Hesaplama",
          paragraphs: ["Aracımız, standart oranlar dışında nadir kullanılan veya özel tevkifat gerektiren oranlar için manuel yüzde girişine (Özel Oran) imkan tanır. Böylece her türlü yüzde için KDV hesaplaması gerçekleştirebilirsiniz."]
        },
        {
          title: "10. Faturada KDV Hesaplama Mantığı",
          paragraphs: ["Bir fatura keserken 'Mal/Hizmet Bedeli' (Matrah) ayrı, 'Hesaplanan KDV' ayrı yazılır ve alt kısımda 'Genel Toplam' (KDV Dahil) belirtilir. Bütün muhasebe ve e-fatura süreçleri bu basit matematiksel ayrıştırma mantığına dayanır."]
        }
      ]
    }
  },
  fields: [],
  schema,
  calculate: (input) => {
    return calculateKdv(input.tutar, input.oran, input.mod);
  }
};
