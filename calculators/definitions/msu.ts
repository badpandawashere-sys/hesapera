import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateMsu } from '../formulas/msu';


const schema = z.object({
  turkceCorrect: z.number().int().min(0).max(40).default(0),
  turkceWrong: z.number().int().min(0).max(40).default(0),
  sosyalCorrect: z.number().int().min(0).max(20).default(0),
  sosyalWrong: z.number().int().min(0).max(20).default(0),
  matematikCorrect: z.number().int().min(0).max(40).default(0),
  matematikWrong: z.number().int().min(0).max(40).default(0),
  fenCorrect: z.number().int().min(0).max(20).default(0),
  fenWrong: z.number().int().min(0).max(20).default(0),
  felsefeExempt: z.boolean().optional().default(false)
});

type Input = z.infer<typeof schema>;

export const msuCalculatorDef: CalculatorDefinition<Input, ReturnType<typeof calculateMsu>> = {
  id: 'calc_msu_001',
  slug: 'msu-puan',
  status: 'published',
  name: 'MSÜ Puan Hesaplama',
  shortDescription: '2026-MSÜ Türkçe (40), Sosyal (20), Matematik (40) ve Fen (20) doğru/yanlış sayılarınıza göre netlerinizi hesaplayın.',
  category: 'education',
  type: 'complex',
  
  metadata: {
    title: 'MSÜ Puan ve Net Hesaplama 2026 | Hesapera',
    description: '2026 MSÜ Türkçe, Sosyal Bilimler, Temel Matematik ve Fen doğru/yanlış sayılarınıza göre netlerinizi hesaplayın; MSÜ-SA, EA, SÖ ve GN puanlarının ÖSYM değerlendirme yöntemini inceleyin.',
    keywords: ['msü puan hesaplama', 'msu puan 2026', 'milli savunma universitesi sinavi', 'msü say söz ea genel', 'msü net hesaplama'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/msu-puan',
    faq: [
      {
        question: "MSÜ'de 4 yanlış 1 doğruyu götürür mü?",
        answer: "Evet, 2026 MSÜ sınavında 4 yanlış cevap 1 doğru cevabı götürerek ham puanınızı (netinizi) belirler."
      },
      {
        question: "Türkçe testinde kaç soru var?",
        answer: "MSÜ Türkçe testinde toplam 40 soru bulunmaktadır."
      },
      {
        question: "Sosyal Bilimler testinde kaç soru var?",
        answer: "Sosyal Bilimler testinde toplam 20 değerlendirilmiş soru bulunmaktadır (Zorunlu Din alanlar için 15 ortak + 5 Din; muaf olanlar için 15 ortak + 5 ilave Felsefe)."
      },
      {
        question: "Temel Matematik testinde kaç soru var?",
        answer: "Temel Matematik testinde toplam 40 soru bulunmaktadır."
      },
      {
        question: "Fen Bilimleri testinde kaç soru var?",
        answer: "Fen Bilimleri testinde toplam 20 soru bulunmaktadır."
      },
      {
        question: "MSÜ sınavı kaç dakika sürmektedir?",
        answer: "2026 MSÜ sınavı 165 dakika sürmektedir."
      },
      {
        question: "MSÜ-SA nedir?",
        answer: "MSÜ Sayısal Puan Türüdür. Ağırlıkları: Türkçe %25, Temel Matematik %35, Fen Bilimleri %30, Sosyal Bilimler %10'dur."
      },
      {
        question: "MSÜ-EA nedir?",
        answer: "MSÜ Eşit Ağırlık Puan Türüdür. Ağırlıkları: Türkçe %35, Temel Matematik %35, Fen Bilimleri %10, Sosyal Bilimler %20'dir."
      },
      {
        question: "MSÜ-SÖ nedir?",
        answer: "MSÜ Sözel Puan Türüdür. Ağırlıkları: Türkçe %35, Temel Matematik %20, Fen Bilimleri %10, Sosyal Bilimler %35'tir."
      },
      {
        question: "MSÜ-GN nedir?",
        answer: "MSÜ Genel Puan Türüdür. Ağırlıkları: Türkçe %33, Temel Matematik %33, Fen Bilimleri %17, Sosyal Bilimler %17'dir."
      },
      {
        question: "0,5 ham puan şartı nedir?",
        answer: "ÖSYM kuralına göre, MSÜ puanlarınızın (SA, EA, SÖ, GN) hesaplanabilmesi için adayın Türkçe VEYA Temel Matematik testlerinin en az birinden 0,5 veya daha fazla ham puan (net) almış olması zorunludur."
      },
      {
        question: "MSÜ puanı neden yalnız netten hesaplanamaz?",
        answer: "Gerçek MSÜ puanları, sınava giren tüm adayların test ortalamaları ve standart sapmaları kullanılarak elde edilen Standart Puanlara ağırlıklar uygulanarak oluşturulur. Yalnızca netler kullanılarak kesin MSÜ puanı hesaplanamaz."
      },
      {
        question: "Din Kültürü ve İlave Felsefe kuralı nasıl işler?",
        answer: "Din Kültürü dersinden muaf olan adaylar, Sosyal Bilimler testindeki Din soruları yerine 21-25 arasındaki ilave Felsefe sorularını cevaplarlar. Her iki durumda da toplam 20 Sosyal sorusu üzerinden değerlendirme yapılır."
      },
      {
        question: "Çağrı taban puanını kim belirler?",
        answer: "2. seçim aşamalarına çağrılacak adaylar için uygulanan çağrı taban puanı, Millî Savunma Bakanlığı (MSB) tarafından ihtiyaçlar doğrultusunda sınav sonrasında ayrıca belirlenir."
      },
      {
        question: "MSÜ puanı 100-500'e nasıl dönüştürülür?",
        answer: "Adayların standart puanlarına ilgili puan türünün katsayıları uygulanır ve sonuçlar en küçüğü 100, en büyüğü 500 olacak şekilde istatistiksel bir dönüşüm (normalize) işlemine tabi tutulur."
      }
    ],
    relatedCalculators: ['yks-puan', 'tyt-puan', 'kpss-puan']
  },
  fields: [
    { id: 'turkceCorrect', label: 'Türkçe Doğru (Maks 40)', type: 'number', required: true, min: 0, max: 40, defaultValue: 0 },
    { id: 'turkceWrong', label: 'Türkçe Yanlış (Maks 40)', type: 'number', required: true, min: 0, max: 40, defaultValue: 0 },
    { id: 'sosyalCorrect', label: 'Sosyal Bilimler Doğru (Maks 20)', type: 'number', required: true, min: 0, max: 20, defaultValue: 0 },
    { id: 'sosyalWrong', label: 'Sosyal Bilimler Yanlış (Maks 20)', type: 'number', required: true, min: 0, max: 20, defaultValue: 0 },
    { id: 'matematikCorrect', label: 'Temel Matematik Doğru (Maks 40)', type: 'number', required: true, min: 0, max: 40, defaultValue: 0 },
    { id: 'matematikWrong', label: 'Temel Matematik Yanlış (Maks 40)', type: 'number', required: true, min: 0, max: 40, defaultValue: 0 },
    { id: 'fenCorrect', label: 'Fen Bilimleri Doğru (Maks 20)', type: 'number', required: true, min: 0, max: 20, defaultValue: 0 },
    { id: 'fenWrong', label: 'Fen Bilimleri Yanlış (Maks 20)', type: 'number', required: true, min: 0, max: 20, defaultValue: 0 }
  ],
  schema,
  calculate: (input) => calculateMsu(
    input.turkceCorrect, input.turkceWrong,
    input.sosyalCorrect, input.sosyalWrong,
    input.matematikCorrect, input.matematikWrong,
    input.fenCorrect, input.fenWrong
  )
};
