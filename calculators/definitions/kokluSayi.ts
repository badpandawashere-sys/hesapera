import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateKokluSayi } from '../formulas/kokluSayi';

const schema = z.object({
  derece: z.number({ message: "Kök derecesi geçerli bir sayı olmalıdır" })
    .int("Kök derecesi tam sayı olmalıdır")
    .min(2, "Kök derecesi en az 2 olmalıdır")
    .default(2),
  sayi: z.number({ message: "Kökü alınacak sayıyı giriniz" })
}).superRefine((data, ctx) => {
  if (data.derece % 2 === 0 && data.sayi < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Çift dereceli kökler (karekök vb.) için sayı negatif olamaz.",
      path: ['sayi']
    });
  }
});

type Input = z.infer<typeof schema>;

export const kokluSayiCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_koklu_sayi_001',
  slug: 'koklu-sayi',
  status: 'published',
  name: 'Köklü Sayı Hesaplama',
  shortDescription: 'Bir sayının karekök, küpkök veya n. dereceden kökünü gerçek sayılar kurallarına uygun olarak hesaplayın.',
  category: 'math',
  type: 'simple',
  metadata: {
    title: 'Köklü Sayı Hesaplama | Hesapera',
    description: 'Bir sayının n. dereceden kökünü (karekök, küpkök) anında hesaplayın. Tam kök tespiti ve negatif sayılarda tek kök desteği ile.',
    keywords: ["köklü sayı hesaplama", "karekök hesaplama", "küpkök", "karekök dışına çıkarma", "n. dereceden kök"],
    canonical: 'https://www.hesapera.com.tr/hesaplama/koklu-sayi',
    faq: [
      {
        question: "Hesaplama 'Tam Kök mü: Hayır' diyor, ne anlama geliyor?",
        answer: "Bu, girdiğiniz sayının mükemmel (tam kare veya tam küp vb.) bir sayı olmadığını, kök dışına çıkarken ondalıklı (virgüllü ve genellikle sonsuza uzanan irrasyonel) bir değere dönüştüğünü ifade eder."
      },
      {
        question: "Sonuç neden 'Hesaplama aralık dışı' çıkabilir?",
        answer: "Sisteme girilen kök derecesi (örneğin 0 veya 1 gibi) 2'nin altındaysa ya da çift dereceli bir kökte eksi (-) değerli bir sayı girilmeye çalışıldıysa matematiksel kural ihlali yapılmış demektir."
      }
    ],
    content: {
      intro: "Karekök, Küpkök ve diğer n'inci dereceden köklerin (tam kök sorgusu dahil) matematiksel olarak dışarıya çıkarılması",

      sections: [
        {
          title: "Köklü Sayı (Karekök) Nedir?",
          paragraphs: [
            "Köklü sayılar, bir sayının kendisiyle kaç kez çarpılarak belirli bir değere ulaştığını bulmamızı sağlayan ters üs alma işlemleridir.",
            "Eğer kök derecesi 2 ise (buna Karekök denir), aracımız kendisine girilen sayının 'Hangi sayının kendisiyle iki kez çarpımı olduğunu' bulur. Örneğin √144 sayısının sonucu 12'dir."
          ]
        },
        {
          title: "N'inci Dereceden Kök ve Küpkök",
          paragraphs: [
            "Aracımız sadece karekök değil, kök derecesini 3 (Küpkök) veya istediğiniz n'inci sayıya çıkartarak esnek işlem (n'inci kök hesaplama) yapmanıza olanak tanır.",
            "Böylece ∛27 (Hangi sayıyı kendisiyle üç kez çarparsam 27 eder?) gibi soruları anında cevaplayarak (Sonuç: 3) karmaşık ödevlerinizi ve geometri denklemlerini çözmenizi sağlar."
          ]
        },
        {
          title: "Ondalık ve Negatif Sayı Sınırları",
          paragraphs: [
            "Sonuç tam çıkmıyorsa araç size ondalıklı küsuratı verecektir (örneğin √2 = 1.4142...). Ekranın altında 'Tam Kök mü?' sorusu 'Hayır' olarak yanıtlanacaktır.",
            "Eğer kök derecesi ÇİFT bir sayı (2, 4, 6) ise, kök içine girdiğiniz sayı negatif olamaz; çünkü gerçek sayılar kümesinde negatif bir sayının çift dereceli kökü tanımsızdır. Ancak TEK bir kök derecesine (örneğin 3) negatif sayı (Örn: -27) girerseniz, sonuç rahatlıkla negatif (-3) çıkacaktır."
          ]
        },
      ],
      example: {
        title: "Küp Hacminden Kenar Bulma (Küpkök)",
        text: "Elinizde hacmi tam 125 m³ olan kusursuz bir küp (Örn: zar) var ve bir kenarının (uzunluğunun) kaç metre olduğunu bilmek istiyorsunuz. Kök Derecesini 3 (Küpkök), sayıyı ise 125 olarak girersiniz. Formül (125^(1/3)) hesaplamasını yaparak size 5 m sonucunu verir."
      }
    },

    relatedCalculators: ["uslu-sayi", "ebob-ekok"]
  },
  fields: [
    {
      id: 'derece',
      label: 'Kök Derecesi (n)',
      type: 'number',
      required: true,
      min: 2,
      defaultValue: 2,
      description: 'Örn: Karekök için 2, Küpkök için 3'
    },
    {
      id: 'sayi',
      label: 'Sayı (x)',
      type: 'number',
      required: true
    }
  ],
  schema,
  calculate: (input) => calculateKokluSayi(input)
};
