import { z } from 'zod';
import type { CalculatorDefinition } from '../core/calculator-types';
import { calculateMtv, MTV_TAX_YEAR, type MtvInput, type MtvResult } from '../formulas/mtv';

const optionalPositiveNumber = z.preprocess(
  (value) => value === '' || value === null ? undefined : value,
  z.number().positive().optional(),
);

const schema = z.object({
  modelYear: z.coerce.number().int().min(1900).max(MTV_TAX_YEAR),
  firstRegistrationYear: z.coerce.number().int().min(1900).max(MTV_TAX_YEAR),
  vehicleType: z.enum(['combustion', 'electric']),
  engineCc: z.number().int().min(1).max(10000).optional(),
  motorPowerKw: z.number().positive().max(2000).optional(),
  vehicleValue: z.number().positive().max(100000000).optional(),
  cascoValue: optionalPositiveNumber,
}).superRefine((input, context) => {
  if (input.vehicleType === 'combustion' && input.engineCc === undefined) {
    context.addIssue({ code: 'custom', path: ['engineCc'], message: 'Motor hacmini girin.' });
  }
  if (input.vehicleType === 'electric' && input.motorPowerKw === undefined) {
    context.addIssue({ code: 'custom', path: ['motorPowerKw'], message: 'Elektrik motor gücünü girin.' });
  }
  if (input.firstRegistrationYear < input.modelYear) {
    context.addIssue({ code: 'custom', path: ['firstRegistrationYear'], message: 'İlk tescil yılı model yılından önce olamaz.' });
  }
  if (input.firstRegistrationYear >= 2018 && input.vehicleValue === undefined) {
    context.addIssue({ code: 'custom', path: ['vehicleValue'], message: '2018 ve sonrası tesciller için vergilemeye esas taşıt değerini girin.' });
  }
  if (input.vehicleType === 'electric' && input.firstRegistrationYear < 2018) {
    context.addIssue({ code: 'custom', path: ['firstRegistrationYear'], message: 'Elektrikli araç hesabı bu sürümde 2018 ve sonrası ilk tesciller içindir.' });
  }
});

export const mtvCalculatorDef: CalculatorDefinition<MtvInput, MtvResult> = {
  id: 'calc_mtv_2026_001',
  slug: 'mtv-hesaplama',
  status: 'published',
  name: 'MTV Hesaplama',
  shortDescription: '2026 binek otomobil MTV tutarını; model yılı, ilk tescil yılı ve motor bilgilerine göre hesaplayın.',
  category: 'other',
  type: 'simple',
  metadata: {
    title: '2026 MTV Hesaplama | Binek Otomobil Vergisi | Hesapera',
    description: '2026 yılı binek otomobil MTV tutarını resmi GİB tarifesine göre hesaplayın. Elektrikli otomobil, yaş grubu ve isteğe bağlı kasko değeri uygulaması dahildir.',
    keywords: ['2026 MTV hesaplama', 'MTV hesaplama', 'motorlu taşıtlar vergisi', 'otomobil vergisi', 'elektrikli araç MTV'],
    canonical: 'https://www.hesapera.com.tr/hesaplama/mtv-hesaplama',
    icon: 'Car',
    features: [
      { label: '2026 GİB tarifesi', icon: 'Receipt' },
      { label: 'Elektrikli otomobil hesabı', icon: 'Zap' },
      { label: 'Kasko değer kontrolü', icon: 'ShieldCheck' },
    ],
    infoBox: {
      title: '2026 yılı binek otomobilleri',
      text: 'Binek otomobil, kaptıkaçtı ve arazi taşıtı tarifesi için hazırlanmıştır. Motosiklet, ticari araç, minibüs, otobüs ve deniz taşıtları bu hesaplamaya dahil değildir.',
      icon: 'Info',
    },
    faq: [
      {
        question: 'MTV hesaplamasında araç yaşı nasıl belirlenir?',
        answer: 'Araç yaşı model yılı ile hesaplama yılı esas alınarak belirlenir. 2026 hesabında model yılı ve 2026 arasındaki farkın bir fazlası alınır; tarife bu yaşı yaş gruplarına yerleştirir.',
      },
      {
        question: '2018 öncesi ve sonrası araçların MTV tarifesi farklı mıdır?',
        answer: 'Evet. İlk kayıt ve tescil tarihi 1 Ocak 2018 öncesinde olan otomobiller I/A tarifesine; 1 Ocak 2018 ve sonrasında olanlar I sayılı tarifeye göre değerlendirilir. Yeni tarifede taşıt değeri de kullanılır.',
      },
      {
        question: 'Elektrikli otomobillerin MTV tutarı nasıl hesaplanır?',
        answer: 'Sadece elektrik motoru olan otomobillerde motor gücü satır numarasını belirler. Taşıt değeri ve yaş için bulunan tarife tutarının yüzde 25’i uygulanır.',
      },
      {
        question: 'Kasko değeri girilmezse hesaplama yapılır mı?',
        answer: 'Evet. Kasko değeri isteğe bağlıdır. Girilmediğinde temel tarife tutarı gösterilir; kasko değerine bağlı indirim olasılığı sonuçta yer almaz.',
      },
    ],
    content: {
      intro: 'Motorlu Taşıtlar Vergisi (MTV) otomobiller için motor hacmi veya yalnızca elektrik motoru bulunan araçlarda motor gücü, araç yaşı, tescil dönemi ve bazı araçlarda taşıt değeri esas alınarak belirlenir.',
      sections: [
        {
          title: 'Hesaplama kapsamı',
          paragraphs: [
            'Bu araç 2026 yılında binek otomobil, kaptıkaçtı ve arazi taşıtları için geçerli I ve I/A tarifelerini kullanır. İlk tescil yılı 2018 ve sonrasındaysa motor hacmi veya elektrik motor gücü yanında tarifedeki taşıt değeri basamağı da dikkate alınır.',
            'Vergi yaşı model yılı ve takvim yılı esasına göre bulunur. Örneğin 2023 model bir otomobil 2026 hesabında 4 yaş kabul edilir ve 4–6 yaş grubuna girer.',
          ],
          bullets: [
            '2017 ve öncesi ilk tescil: I/A sayılı tarife.',
            '2018 ve sonrası ilk tescil: I sayılı tarife ve taşıt değeri basamağı.',
            'Sadece elektrik motorlu otomobil: güç satırı için bulunan verginin %25’i.',
            'İsteğe bağlı kasko değeri, kanuni sınır aşılırsa bir önceki tarife satırını uygulayabilir.',
          ],
        },
        {
          title: 'Taksitler ve resmî kontrol',
          paragraphs: [
            'MTV yıllık tutar olarak belirlenir ve genel olarak Ocak ve Temmuz aylarında iki taksitte ödenir. Bu ekrandaki taksit tutarları yıllık tutarın yarısıdır.',
            'Sonuç, GİB tarafından yayımlanan 2026 tarifesine dayalı tahmini araç hesabıdır. Ruhsat ve resmî kayıt bilgileriyle Dijital Vergi Dairesi MTV Hesaplama ekranındaki sonucu karşılaştırın.',
          ],
        },
      ],
      example: {
        title: 'Örnek hesap',
        text: '2023 model, 2023 yılında ilk kez tescil edilmiş, 1.600 cm³ ve taşıt değeri 500.000 TL olan bir otomobil 2026 yılında 4–6 yaş grubundadır. 2026 tarifesinde yıllık MTV 8.264 TL, iki eşit taksit varsayımıyla taksit başına 4.132 TL’dir.',
      },
      sources: [
        { name: 'GİB – 58 Seri No’lu MTV Genel Tebliği ve 2026 tarifeleri', url: 'https://www.gib.gov.tr/mevzuat/kanun/441/teblig/11860' },
        { name: 'GİB – Motorlu Taşıtlar Vergisi Kanunu, Madde 5', url: 'https://gib.gov.tr/mevzuat/kanun/441/madde/8240' },
        { name: 'GİB Dijital Vergi Dairesi – MTV Hesaplama', url: 'https://dijital.gib.gov.tr/hesaplamalar/MTVHesaplama' },
      ],
    },
    relatedCalculators: ['yakit-maliyeti', 'tasit-kredisi'],
  },
  fields: [
    {
      id: 'modelYear',
      label: 'Model Yılı',
      type: 'text',
      required: true,
      min: 1900,
      max: MTV_TAX_YEAR,
      step: 1,
      defaultValue: 2023,
      description: 'Vergi yaşı model yılına göre hesaplanır.',
      placeholder: 'Örn: 2023',
    },
    {
      id: 'firstRegistrationYear',
      label: 'İlk Tescil Yılı',
      type: 'text',
      required: true,
      min: 1900,
      max: MTV_TAX_YEAR,
      step: 1,
      defaultValue: 2023,
      description: '2018 öncesi tesciller I/A, 2018 ve sonrası tesciller I tarifesine girer.',
      placeholder: 'Örn: 2023',
    },
    {
      id: 'vehicleType',
      label: 'Motor Türü',
      type: 'select',
      required: true,
      defaultValue: 'combustion',
      options: [
        { label: 'Benzin, dizel veya hibrit', value: 'combustion' },
        { label: 'Sadece elektrik motoru', value: 'electric' },
      ],
    },
    {
      id: 'engineCc',
      label: 'Motor Hacmi (cm³)',
      type: 'number',
      required: true,
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 1600,
      placeholder: 'Örn: 1598',
      conditions: [{ fieldId: 'vehicleType', operator: 'equals', value: 'combustion' }],
    },
    {
      id: 'motorPowerKw',
      label: 'Elektrik Motor Gücü (kW)',
      type: 'number',
      required: true,
      min: 0.1,
      max: 2000,
      step: 0.1,
      defaultValue: 85,
      description: 'Motor gücü ruhsatta belirtilen kW değeridir.',
      placeholder: 'Örn: 150',
      conditions: [{ fieldId: 'vehicleType', operator: 'equals', value: 'electric' }],
    },
    {
      id: 'vehicleValue',
      label: 'Vergiye Esas Taşıt Değeri (TL)',
      type: 'currency',
      required: false,
      min: 1,
      max: 100000000,
      step: 100,
      description: '2018 ve sonrası ilk tescillerde zorunludur. İkinci el ilan fiyatı yerine tescildeki vergiye esas taşıt değerini kullanın. Daha eski tescillerde boş bırakabilirsiniz.',
      placeholder: '2018 öncesi araçlarda boş bırakın',
    },
    {
      id: 'cascoValue',
      label: 'Kasko Değeri (TL, isteğe bağlı)',
      type: 'currency',
      min: 1,
      max: 100000000,
      step: 100,
      description: 'Araç yaş ve tipiyle uyumlu TSB kasko değerini girin. Girilmezse kasko indirimi uygulanmaz.',
      placeholder: 'Boş bırakabilirsiniz',
    },
  ],
  schema,
  calculate: (input) => calculateMtv(input),
};

