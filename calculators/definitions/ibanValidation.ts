import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateIbanValidation } from '../formulas/ibanValidation';

const schema = z.object({
  iban: z.string().min(1, 'IBAN boş olamaz')
});

type Input = z.infer<typeof schema>;

export const ibanValidationCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_ibanValidation_001',
  slug: 'iban-dogrulama',
  status: 'published',
  name: 'IBAN Doğrulama',
  shortDescription: 'IBAN numaranızın formatını, uzunluğunu ve MOD-97 kontrolünü hızlıca doğrulayın.',
  category: 'finance',
  type: 'simple',
  metadata: {
    title: 'IBAN Doğrulama ve IBAN Kontrolü | Hesapera',
    description: 'IBAN numaranızın formatını, uzunluğunu ve MOD-97 kontrolünü hızlıca doğrulayın. Türkiye ve desteklenen ülkeler için IBAN kontrolü.',
    keywords: ["iban doğrulama","iban kontrol","iban sorgulama","mod-97","iban numarası kontrolü"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/iban-dogrulama',
    faq: [
      {
        question: "IBAN doğru çıktı, hesaba para gönderirsem kesin ulaşır mı?",
        answer: "Hayır. Doğrulama sadece numaranın doğru bir kural silsilesiyle yazıldığını garanti eder. Ancak hesap dondurulmuş, kapatılmış veya blokeli olabilir. Kesin teyidi sadece alıcı ödemeyi gördüğünde yapabilir."
      },
      {
        question: "Doğrulama aracı, hesabın sahibinin adını gösterebilir mi?",
        answer: "Hayır. Banka hesap numaralarına ait kişisel veriler (ad-soyad) KVKK ve Bankacılık Kanunu gereği gizlidir. Sadece bankanızın kendi mobil uygulamasından para gönderirken, alıcı adının ilk harflerini (maskelenmiş olarak) görebilirsiniz."
      }
    ],
    content: {
      intro: "Banka hesap numaralarının uluslararası standartlara (IBAN) uygunluğunun kontrol ve doğrulama mantığı",

      sections: [
        {
          title: "IBAN Nedir ve Yapısı Nasıldır?",
          paragraphs: [
            "IBAN (International Bank Account Number), bankalardaki mevcut müşteri hesap numaralarının uluslararası standartta yazım biçimidir. Amacı, para transferlerindeki hatalı hesap numarası girişlerini engellemektir.",
            "Türkiye'deki bir IBAN 26 haneden oluşur. Başında 'TR' ülke kodu, ardından 2 haneli kontrol basamağı, 5 haneli banka kodu, 1 haneli rezerv alanı ve son olarak 16 haneli temel hesap numarası bulunur."
          ]
        },
        {
          title: "Doğrulama (Checksum) Nasıl Çalışır?",
          paragraphs: [
            "Hesapera IBAN doğrulama aracı, uluslararası 'MOD-97' algoritmasını kullanır. Girdiğiniz IBAN'daki harfler önce belirli sayısal değerlere dönüştürülür, ardından elde edilen devasa sayı dizisi 97'ye bölünerek kalan (modulo) bulunur.",
            "Bu kalan, IBAN'ın içindeki 2 haneli kontrol basamağıyla eşleşiyorsa, numara 'matematiksel olarak' geçerli kabul edilir. Kopyalayıp yapıştırdığınızda aradaki boşlukları sistem otomatik temizler ve formatı ayarlar."
          ]
        },
        {
          title: "Sınırlar ve Hukuki Uyarı",
          paragraphs: [
            "ÇOK ÖNEMLİ: Araç sadece biçimsel ve algoritmik bir doğrulama yapar. IBAN'ın matematiksel olarak geçerli olması, 'Bu banka hesabı şu an açıktır ve kullanılabilir durumdadır' anlamına KESİNLİKLE gelmez.",
            "Sistem size o IBAN'ın hangi kişiye veya şirkete ait olduğunu söyleyemez ve hesabın kapatılmış olup olmadığını bilemez."
          ]
        },
      ],
      example: {
        title: "IBAN Kontrol İşlemi",
        text: "Elinize bir TR... ile başlayan 26 haneli dizi geçtiğinde araca girerseniz; eğer kişi size IBAN'ı atarken yanlışlıkla bir rakamı eksik kopyaladıysa veya değiştirdiyse, MOD-97 doğrulamasından geçemez ve sistem 'Hatalı (Checksum eşleşmiyor)' uyarısı verir. Böylece paranız askıda kalmadan veya iade süreciyle uğraşmadan durumu fark edersiniz."
      }
    },

    relatedCalculators: ["kredi", "ihtiyac-kredisi"]
  },
  fields: [
    {
      id: "iban",
      label: "IBAN Numarası",
      type: "text",
      required: true,
      placeholder: "TR00 0000 0000 0000 0000 0000 00"
    }
  ],
  schema,
  calculate: (input) => {
    return calculateIbanValidation(input.iban);
  }
};
