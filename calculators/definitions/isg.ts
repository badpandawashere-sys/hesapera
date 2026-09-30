import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateIsg } from '../formulas/isg';

const schema = z.object({
  certificate: z.enum(['workplacePhysician', 'cClass', 'bClass', 'aClass', 'otherHealthPersonnel']),
  correct: z.number().int().min(0).max(50),
  cancelled: z.number().int().min(0).max(49).optional().default(0),
});

type Input = z.infer<typeof schema>;

export const isgCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_isg_001',
  slug: 'isg-puan',
  status: 'published',
  name: 'İSG Puan Hesaplama',
  shortDescription: 'İş yeri hekimliği, iş güvenliği uzmanlığı (A, B, C sınıfı) ve diğer sağlık personeli (İSG) sınavı puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'İSG Puan Hesaplama | Hesapera',
    description: 'İSG sınavı doğru sayınıza ve iptal edilen soru sayısına göre puanınızı hesaplayın. İş yeri hekimliği, A, B, C sınıfı iş güvenliği uzmanlığı ve diğer sağlık personeli başarı durumunuzu öğrenin.',
    keywords: ['isg puan hesaplama', 'iş güvenliği uzmanlığı', 'iş yeri hekimliği', 'diğer sağlık personeli puanı', 'a sınıfı isg', 'b sınıfı isg', 'c sınıfı isg'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/isg-puan',
    faq: [
      { question: 'İSG sınavında kaç soru var?', answer: 'İSG (İş Sağlığı ve Güvenliği) sınavında adaylara toplam 50 soru sorulmaktadır.' },
      { question: 'İSG sınavı kaç dakika?', answer: 'Adaylara 50 soru için verilen toplam sınav süresi 75 dakikadır.' },
      { question: 'Yanlışlar doğruları götürür mü?', answer: 'ÖSYM kılavuzunda belirtildiği üzere, İSG sınavlarında yanlış cevaplar doğru cevapları götürmemektedir. Yanlışlarınızın puanınıza olumsuz bir etkisi yoktur.' },
      { question: 'İSG puanı nasıl hesaplanır?', answer: 'Adayın doğru cevap sayısı (ham puanı), iptal edilen sorular çıkarıldıktan sonra kalan geçerli soru sayısı üzerinden oranlanarak 100 tam puan üzerinden değerlendirilir.' },
      { question: 'İptal edilen soru puanı nasıl etkiler?', answer: 'İptal edilen bir soru olduğunda, değerlendirme geri kalan geçerli soru sayısı üzerinden (örneğin 1 soru iptalinde 49 soru) yapılır. İptal edilen sorular puanlamaya katılmaz.' },
      { question: 'İş güvenliği uzmanlığı geçme notu kaç?', answer: 'A, B ve C Sınıfı İş Güvenliği Uzmanlığı sınavlarında başarılı olabilmek için 100 üzerinden en az 70 puan almak gerekmektedir.' },
      { question: 'İş yeri hekimliği geçme notu kaç?', answer: 'İş Yeri Hekimliği sınavında adayların başarılı sayılabilmesi için 100 tam puan üzerinden en az 70 puan alması şarttır.' },
      { question: 'Diğer Sağlık Personeli geçme notu kaç?', answer: 'Diğer Sağlık Personeli sınavında başarı eşiği diğer sertifika alanlarından farklı olarak 100 üzerinden en az 60 puandır.' },
      { question: '35 doğru kaç puan eder?', answer: 'Sınavda iptal edilen hiçbir soru yoksa (50 soru üzerinden) 35 doğru tam olarak 70 puana denk gelmektedir.' },
      { question: '30 doğru kaç puan eder?', answer: 'İptal soru olmaması durumunda 30 doğrunun karşılığı 60 puandır.' },
      { question: '1 soru iptal edilirse hesap nasıl değişir?', answer: '50 soru içinden 1 tanesi iptal edildiğinde geçerli soru sayısı 49\'a düşer. Bu durumda her bir doğrunun değeri 100/49 = ~2.0408 puan olarak yeniden hesaplanır.' },
      { question: 'İptal sorular dahil doğru sayısı girilmeli mi?', answer: 'Hesaplama yaparken yalnızca ÖSYM tarafından geçerli kabul edilen sorulara verdiğiniz doğru sayısını formdaki alana girmelisiniz.' },
      { question: 'A/B/C sınıflarında başarı sınırı farklı mı?', answer: 'Hayır, A, B ve C sınıfı iş güvenliği uzmanlığı sınavlarının tamamında başarılı olmak için en az 70 puan alınması zorunludur.' }
    ],
    relatedCalculators: ['hmgs-puan', 'h-kim-ve-savci-yardimciligi-sinavi-puan', 'kpss-puan'],
    content: {
      intro: 'İSG (İş Sağlığı ve Güvenliği) sınavı puanınızı ÖSYM kurallarına göre iptal edilen soru sayısını da dikkate alarak hesaplayın.',
      sections: [
        {
          title: 'İSG Sınavı Nedir?',
          paragraphs: [
            'İş Sağlığı ve Güvenliği (İSG) Genel Müdürlüğü İş Yeri Hekimliği ve İş Güvenliği Uzmanlığı Sınavı, Çalışma ve Sosyal Güvenlik Bakanlığı yetkisinde ve ÖSYM tarafından düzenlenen resmî bir sertifikasyon sınavıdır.',
            'Sınavda adaylara kendi alanlarından 50 soru sorulmakta ve toplam 75 dakika süre verilmektedir.'
          ]
        },
        {
          title: 'Sertifika Alanları ve Başarı Sınırları',
          paragraphs: [
            'Sınavda 5 farklı sertifika alanı bulunur: İş Yeri Hekimliği, A Sınıfı İş Güvenliği Uzmanlığı, B Sınıfı İş Güvenliği Uzmanlığı, C Sınıfı İş Güvenliği Uzmanlığı ve Diğer Sağlık Personeli.',
            'İş Yeri Hekimliği ile A, B ve C sınıfı iş güvenliği uzmanlığı adaylarının başarılı sayılması için 100 üzerinden en az 70 puan (70 puan başarı sınırı kimler için geçerli sorusunun cevabı) alması gerekmektedir.',
            'Diğer Sağlık Personeli adaylarının başarılı olabilmesi için ise en az 60 puan (60 puan başarı sınırı kimler için geçerli sorusunun cevabı) alması yeterlidir.'
          ]
        },
        {
          title: 'Puanlama ve İptal Edilen Sorular',
          paragraphs: [
            'ÖSYM kılavuzunda da açıkça belirtildiği üzere, İSG sınavında yanlışlar doğruyu götürür mü sorusunun cevabı hayırdır. Adayın doğru sayısı doğrudan ham puanını belirler.',
            'İSG puanı nasıl hesaplanır? Adayların doğru cevap sayıları, geçerli soru sayısı üzerinden 100\'e ölçeklenerek hesaplanır.',
            'Geçerli soru sayısı nedir? İptal edilen soruların toplam 50 sorudan çıkarılmasıyla kalan soru sayısıdır. İptal edilen soru nasıl etkiler sorusuna gelince: İptal sorusu varsa puan hesabı örneğin 49 soru üzerinden (kalan her doğru yaklaşık 2.04 puan değerinde olacak şekilde) yapılır. İptal edilen soru varsa gerekli doğru sayısı bu yüzden değişebilir.',
            '50 soruda iptal yoksa 35 doğru neden 70 puandır? Çünkü (35/50) * 100 tam olarak 70 puana denk gelmektedir. Benzer şekilde, Diğer Sağlık Personeli için iptal yoksa 30 doğru neden 60 puandır sorusunun cevabı da aynı orantıdır: (30/50) * 100 = 60 puan.'
          ]
        }
      ]
    }
  },
  fields: [
    {
      id: 'certificate',
      label: 'Sertifika Alanı',
      type: 'select',
      required: true,
      options: [
        { value: 'workplacePhysician', label: 'İş Yeri Hekimliği' },
        { value: 'cClass', label: 'C Sınıfı İş Güvenliği Uzmanlığı' },
        { value: 'bClass', label: 'B Sınıfı İş Güvenliği Uzmanlığı' },
        { value: 'aClass', label: 'A Sınıfı İş Güvenliği Uzmanlığı' },
        { value: 'otherHealthPersonnel', label: 'Diğer Sağlık Personeli' }
      ]
    },
    {
      id: 'correct',
      label: 'Doğru Sayısı',
      type: 'number',
      required: true,
      min: 0,
      max: 50,
    },
    {
      id: 'cancelled',
      label: 'İptal Edilen Soru Sayısı',
      type: 'number',
      required: false,
      min: 0,
      max: 49,
      defaultValue: 0,
      description: 'İptal edilen soru yoksa boş bırakabilirsiniz.'
    }
  ],
  schema,
  calculate: (input) => {
    return calculateIsg(
      input.certificate,
      input.correct,
      input.cancelled ?? 0
    );
  }
};
