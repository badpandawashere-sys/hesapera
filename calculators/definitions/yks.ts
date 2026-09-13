import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import { calculateYks } from '../formulas/yks';

const schema = z.object({
  puanTuru: z.enum(['TYT', 'SAY', 'EA', 'SOZ', 'DIL']),
  
  // TYT (All score types use this for base calculations implicitly in YKS)
  tytTurkceC: z.number().int().min(0).max(40), tytTurkceW: z.number().int().min(0).max(40),
  tytSosyalC: z.number().int().min(0).max(20), tytSosyalW: z.number().int().min(0).max(20),
  tytMatC: z.number().int().min(0).max(40), tytMatW: z.number().int().min(0).max(40),
  tytFenC: z.number().int().min(0).max(20), tytFenW: z.number().int().min(0).max(20),

  // AYT SAY
  aytMatC: z.number().int().min(0).max(40).optional(), aytMatW: z.number().int().min(0).max(40).optional(),
  aytFizikC: z.number().int().min(0).max(14).optional(), aytFizikW: z.number().int().min(0).max(14).optional(),
  aytKimyaC: z.number().int().min(0).max(13).optional(), aytKimyaW: z.number().int().min(0).max(13).optional(),
  aytBiyoC: z.number().int().min(0).max(13).optional(), aytBiyoW: z.number().int().min(0).max(13).optional(),
  
  // AYT EA / SOZ common
  aytEdebiyatC: z.number().int().min(0).max(24).optional(), aytEdebiyatW: z.number().int().min(0).max(24).optional(),
  aytTarih1C: z.number().int().min(0).max(10).optional(), aytTarih1W: z.number().int().min(0).max(10).optional(),
  aytCografya1C: z.number().int().min(0).max(6).optional(), aytCografya1W: z.number().int().min(0).max(6).optional(),

  // AYT SOZ
  aytTarih2C: z.number().int().min(0).max(11).optional(), aytTarih2W: z.number().int().min(0).max(11).optional(),
  aytCografya2C: z.number().int().min(0).max(11).optional(), aytCografya2W: z.number().int().min(0).max(11).optional(),
  aytFelsefeC: z.number().int().min(0).max(12).optional(), aytFelsefeW: z.number().int().min(0).max(12).optional(),
  aytDinC: z.number().int().min(0).max(6).optional(), aytDinW: z.number().int().min(0).max(6).optional(),

  // YDT DIL
  ydtDilC: z.number().int().min(0).max(80).optional(), ydtDilW: z.number().int().min(0).max(80).optional(),

  // OBP
  diplomaNotu: z.number().min(50).max(100).optional(),
  isKirikObp: z.boolean().optional()
});

type Input = z.infer<typeof schema>;

export const yksCalculatorDef: CalculatorDefinition<Input, any> = {
  id: 'calc_yks_001',
  slug: 'yks-puan',
  status: 'published',
  name: 'YKS Puan Hesaplama',
  shortDescription: 'ÖSYM 2026-YKS puan hesaplama aracı. TYT, SAY, EA, SÖZ ve DİL puan türlerinde güncel katsayılarla yaklaşık sınav ve yerleştirme puanınızı hesaplayın.',
  category: 'education',
  type: 'complex',
  metadata: {
    title: 'YKS Puan Hesaplama 2026 (TYT, AYT, YDT) | Hesapera',
    description: '2026 YKS sistemi için güncel katsayılar ve OBP ile TYT, SAY (Sayısal), EA (Eşit Ağırlık), SÖZ (Sözel) ve DİL puanlarınızı hesaplayın.',
    keywords: ['yks puan hesaplama', 'ayt puan hesaplama', 'yks net hesaplama', 'sayısal eşit ağırlık sözel', 'ydt dil puan hesaplama', '2026 yks hesaplama'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/yks-puan',
    faq: [
      {
        question: "YKS yerleştirme puanına (Y-YKS) OBP dahil ediliyor mu?",
        answer: "Evet, lise mezuniyet başarınızdan elde edilen Ortaöğretim Başarı Puanı (OBP), YKS ham puanınıza (TYT ve AYT netlerinizle oluşan puana) eklenerek Y-YKS (Yerleştirme Puanı) elde edilir."
      },
      {
        question: "AYT netleri TYT puanımı etkiler mi?",
        answer: "Hayır. AYT (Alan Yeterlilik Testleri) veya YDT (Yabancı Dil Testi) netleriniz TYT (Temel Yeterlilik Testi) puanınızı etkilemez; ancak lisans yerleştirme puanınız (SAY, EA, SÖZ, DİL) hesaplanırken her ikisi birleştirilir."
      },
      {
        question: "Farklı alanın testini çözmek ana puanımı düşürür mü?",
        answer: "Sınavda kendi alanınız dışındaki soruları (örneğin Sayısal öğrencisinin Sosyal-2 çözmesi) cevaplamanız veya orada yapacağınız yanlışlar, kendi alan puanınızı (SAY) düşürmez. Sadece o testin ait olduğu puan türünü etkiler."
      }
    ],
    content: {
      intro: "YKS (AYT ve YDT) puan türleri, katsayı hesaplamaları ve standart sapma mantığı hakkında bilinmesi gerekenler",

      sections: [
        {
          title: "YKS Puanı Nedir?",
          paragraphs: [
            "Yükseköğretim Kurumları Sınavı (YKS); Sayısal (SAY), Eşit Ağırlık (EA), Sözel (SÖZ) ve Yabancı Dil (DİL) alanlarındaki lisans bölümlerine yerleşmek için gereken temel puandır.",
            "Yerleştirme (Y-YKS) puanı hesaplanırken kural olarak ilk oturum olan TYT'nin etkisi %40, alan testlerinin (AYT veya YDT) etkisi ise %60 oranında hesaba katılır."
          ]
        },
        {
          title: "Puan Türlerine Göre Test Ağırlıkları",
          paragraphs: [
            "YKS'de her puan türü için değerlendirilen testler farklılık gösterir. Örneğin Sayısal puanı için AYT Matematik ve Fen Bilimleri testleri belirleyiciyken; Eşit Ağırlık için Matematik, Türk Dili ve Edebiyatı ile Sosyal Bilimler-1 testleri ağırlıklıdır.",
            "Her bir testin içindeki standart sapma ve adayların o testteki ortalaması katsayıları doğrudan etkiler."
          ]
        },
        {
          title: "Gerçek ÖSYM Puanı ile Tahmini Puan Ayrımı",
          paragraphs: [
            "ÖSYM, sınav sonuçlarını değerlendirirken ilgili yıla giren tüm adayların madde (soru) bazındaki başarılarını hesaplayarak ham puanları dönüştürür.",
            "Bu nedenle hesaplama aracı geçmiş yılın katsayılarını kullanarak 'tahmini' bir değer sunar. İki farklı yılda aynı netleri yapan adayın puanları o yılın zorluk derecesine göre farklı çıkabilir."
          ]
        },
      ],
      example: {
        title: "Net ve YKS Puanı İlişkisi",
        text: "Hem TYT'de hem de AYT'de standart olarak 4 yanlış 1 doğruyu siler. AYT'de sadece kendi alanınızla (Örn: Sayısal) ilgili soruları çözerek netlerinizi yükseltmeniz ilgili puan türündeki yerleştirme başarınızı doğrudan artırır. Yanlış cevaplardan kaçınmak standart sapmadan olumlu yararlanmanızı sağlayabilir."
      },
      sources: [
        {
          name: "ÖSYM - YKS Kılavuzu ve Yerleştirme Kuralları",
          url: "https://www.osym.gov.tr/"
        }
      ]
    },

    relatedCalculators: ['tyt-puan', 'obp-okul-puani', 'universite-yks-taban-puanlari']
  },
  fields: [
    {
      id: 'puanTuru',
      label: 'Hesaplanacak Puan Türü',
      type: 'select',
      required: true,
      options: [
        { label: 'SAY (Sayısal)', value: 'SAY' },
        { label: 'EA (Eşit Ağırlık)', value: 'EA' },
        { label: 'SÖZ (Sözel)', value: 'SOZ' },
        { label: 'DİL (Yabancı Dil)', value: 'DIL' },
        { label: 'Sadece TYT', value: 'TYT' }
      ]
    },
    // TYT Fields
    { id: 'tytTurkceC', label: 'TYT Türkçe Doğru', type: 'number', required: true, min: 0, max: 40 },
    { id: 'tytTurkceW', label: 'TYT Türkçe Yanlış', type: 'number', required: true, min: 0, max: 40 },
    { id: 'tytSosyalC', label: 'TYT Sosyal Doğru', type: 'number', required: true, min: 0, max: 20 },
    { id: 'tytSosyalW', label: 'TYT Sosyal Yanlış', type: 'number', required: true, min: 0, max: 20 },
    { id: 'tytMatC', label: 'TYT Matematik Doğru', type: 'number', required: true, min: 0, max: 40 },
    { id: 'tytMatW', label: 'TYT Matematik Yanlış', type: 'number', required: true, min: 0, max: 40 },
    { id: 'tytFenC', label: 'TYT Fen Doğru', type: 'number', required: true, min: 0, max: 20 },
    { id: 'tytFenW', label: 'TYT Fen Yanlış', type: 'number', required: true, min: 0, max: 20 },

    // AYT SAY & EA (Matematik is shared for SAY and EA)
    { id: 'aytMatC', label: 'AYT Matematik Doğru', type: 'number', required: false, min: 0, max: 40, conditions: [{ fieldId: 'puanTuru', operator: 'in', value: ['SAY', 'EA'] }] },
    { id: 'aytMatW', label: 'AYT Matematik Yanlış', type: 'number', required: false, min: 0, max: 40, conditions: [{ fieldId: 'puanTuru', operator: 'in', value: ['SAY', 'EA'] }] },
    
    // AYT SAY (Fen)
    { id: 'aytFizikC', label: 'AYT Fizik Doğru (Maks 14)', type: 'number', required: false, min: 0, max: 14, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SAY' }] },
    { id: 'aytFizikW', label: 'AYT Fizik Yanlış', type: 'number', required: false, min: 0, max: 14, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SAY' }] },
    { id: 'aytKimyaC', label: 'AYT Kimya Doğru (Maks 13)', type: 'number', required: false, min: 0, max: 13, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SAY' }] },
    { id: 'aytKimyaW', label: 'AYT Kimya Yanlış', type: 'number', required: false, min: 0, max: 13, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SAY' }] },
    { id: 'aytBiyoC', label: 'AYT Biyoloji Doğru (Maks 13)', type: 'number', required: false, min: 0, max: 13, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SAY' }] },
    { id: 'aytBiyoW', label: 'AYT Biyoloji Yanlış', type: 'number', required: false, min: 0, max: 13, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SAY' }] },

    // AYT EA & SOZ (TDE - Sosyal 1)
    { id: 'aytEdebiyatC', label: 'AYT Edebiyat Doğru (Maks 24)', type: 'number', required: false, min: 0, max: 24, conditions: [{ fieldId: 'puanTuru', operator: 'in', value: ['EA', 'SOZ'] }] },
    { id: 'aytEdebiyatW', label: 'AYT Edebiyat Yanlış', type: 'number', required: false, min: 0, max: 24, conditions: [{ fieldId: 'puanTuru', operator: 'in', value: ['EA', 'SOZ'] }] },
    { id: 'aytTarih1C', label: 'AYT Tarih-1 Doğru (Maks 10)', type: 'number', required: false, min: 0, max: 10, conditions: [{ fieldId: 'puanTuru', operator: 'in', value: ['EA', 'SOZ'] }] },
    { id: 'aytTarih1W', label: 'AYT Tarih-1 Yanlış', type: 'number', required: false, min: 0, max: 10, conditions: [{ fieldId: 'puanTuru', operator: 'in', value: ['EA', 'SOZ'] }] },
    { id: 'aytCografya1C', label: 'AYT Coğrafya-1 Doğru (Maks 6)', type: 'number', required: false, min: 0, max: 6, conditions: [{ fieldId: 'puanTuru', operator: 'in', value: ['EA', 'SOZ'] }] },
    { id: 'aytCografya1W', label: 'AYT Coğrafya-1 Yanlış', type: 'number', required: false, min: 0, max: 6, conditions: [{ fieldId: 'puanTuru', operator: 'in', value: ['EA', 'SOZ'] }] },

    // AYT SOZ (Sosyal 2)
    { id: 'aytTarih2C', label: 'AYT Tarih-2 Doğru (Maks 11)', type: 'number', required: false, min: 0, max: 11, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SOZ' }] },
    { id: 'aytTarih2W', label: 'AYT Tarih-2 Yanlış', type: 'number', required: false, min: 0, max: 11, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SOZ' }] },
    { id: 'aytCografya2C', label: 'AYT Coğrafya-2 Doğru (Maks 11)', type: 'number', required: false, min: 0, max: 11, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SOZ' }] },
    { id: 'aytCografya2W', label: 'AYT Coğrafya-2 Yanlış', type: 'number', required: false, min: 0, max: 11, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SOZ' }] },
    { id: 'aytFelsefeC', label: 'AYT Felsefe Grb. Doğru (Maks 12)', type: 'number', required: false, min: 0, max: 12, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SOZ' }] },
    { id: 'aytFelsefeW', label: 'AYT Felsefe Grb. Yanlış', type: 'number', required: false, min: 0, max: 12, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SOZ' }] },
    { id: 'aytDinC', label: 'AYT Din Kül. Doğru (Maks 6)', type: 'number', required: false, min: 0, max: 6, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SOZ' }] },
    { id: 'aytDinW', label: 'AYT Din Kül. Yanlış', type: 'number', required: false, min: 0, max: 6, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'SOZ' }] },

    // YDT DIL
    { id: 'ydtDilC', label: 'YDT Yabancı Dil Doğru (Maks 80)', type: 'number', required: false, min: 0, max: 80, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'DIL' }] },
    { id: 'ydtDilW', label: 'YDT Yabancı Dil Yanlış', type: 'number', required: false, min: 0, max: 80, conditions: [{ fieldId: 'puanTuru', operator: 'equals', value: 'DIL' }] },

    // OBP
    { id: 'diplomaNotu', label: 'Diploma Notu (50-100) (İsteğe Bağlı)', type: 'number', required: false, min: 50, max: 100 },
    { id: 'isKirikObp', label: 'Geçen Yıl Bir Programa Yerleştim (Kırık OBP)', type: 'checkbox', required: false }
  ],
  schema,
  calculate: (input) => calculateYks({
    puanTuru: input.puanTuru,
    tytTurkceC: input.tytTurkceC, tytTurkceW: input.tytTurkceW,
    tytSosyalC: input.tytSosyalC, tytSosyalW: input.tytSosyalW,
    tytMatC: input.tytMatC, tytMatW: input.tytMatW,
    tytFenC: input.tytFenC, tytFenW: input.tytFenW,
    aytMatC: input.aytMatC || 0, aytMatW: input.aytMatW || 0,
    aytFizikC: input.aytFizikC || 0, aytFizikW: input.aytFizikW || 0,
    aytKimyaC: input.aytKimyaC || 0, aytKimyaW: input.aytKimyaW || 0,
    aytBiyoC: input.aytBiyoC || 0, aytBiyoW: input.aytBiyoW || 0,
    aytEdebiyatC: input.aytEdebiyatC || 0, aytEdebiyatW: input.aytEdebiyatW || 0,
    aytTarih1C: input.aytTarih1C || 0, aytTarih1W: input.aytTarih1W || 0,
    aytCografya1C: input.aytCografya1C || 0, aytCografya1W: input.aytCografya1W || 0,
    aytTarih2C: input.aytTarih2C || 0, aytTarih2W: input.aytTarih2W || 0,
    aytCografya2C: input.aytCografya2C || 0, aytCografya2W: input.aytCografya2W || 0,
    aytFelsefeC: input.aytFelsefeC || 0, aytFelsefeW: input.aytFelsefeW || 0,
    aytDinC: input.aytDinC || 0, aytDinW: input.aytDinW || 0,
    ydtDilC: input.ydtDilC || 0, ydtDilW: input.ydtDilW || 0,
    diplomaNotu: input.diplomaNotu,
    isKirikObp: input.isKirikObp
  })
};


