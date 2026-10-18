import { z } from 'zod';
import { CalculatorDefinition } from '../core/calculator-types';
import {
  calculateKidemTazminati,
  getKidemTavani,
  isValidCalendarDate,
  KidemTazminatiInput,
  KidemTazminatiResult,
  CSGB_SOURCE_URL
} from '../formulas/kidemTazminati';

const schema = z.object({
  startDate: z.string().min(1, 'İşe başlama tarihi zorunludur.'),
  endDate: z.string().min(1, 'İşten ayrılış tarihi zorunludur.'),
  grossSalary: z.number({ message: 'Lütfen geçerli bir brüt ücret girin.' })
    .min(1, 'Aylık giydirilmiş brüt ücret 0\'dan büyük olmalıdır.')
}).superRefine((data, ctx) => {
  const isStartValid = isValidCalendarDate(data.startDate);
  const isEndValid = isValidCalendarDate(data.endDate);

  if (!isStartValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'İşe başlama tarihi için geçerli bir takvim günü girin (örn. 2026-02-30 geçersizdir).',
      path: ['startDate']
    });
  }

  if (!isEndValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'İşten ayrılış tarihi için geçerli bir takvim günü girin (örn. 2026-02-30 geçersizdir).',
      path: ['endDate']
    });
  }

  if (isStartValid && isEndValid) {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'İşten ayrılış tarihi işe giriş tarihinden önce olamaz.',
        path: ['endDate']
      });
    }

    const tavan = getKidemTavani(data.endDate);
    if (!tavan) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Kıdem tazminatı tavanı yalnızca resmî ÇSGB tarihçesi bulunan 2016–2026 yılları arasındaki dönemler için hesaplanabilir.',
        path: ['endDate']
      });
    }
  }
});

type Input = z.infer<typeof schema>;

export const kidemTazminatiCalculatorDef: CalculatorDefinition<Input, KidemTazminatiResult> = {
  id: 'calc_kidem_tazminati_001',
  slug: 'kidem-tazminati',
  status: 'published',
  name: 'Kıdem Tazminatı Hesaplama',
  shortDescription: '2026 resmî tavan tutarlarına göre işe giriş ve ayrılış tarihlerinizle hak ettiğiniz brüt ve net kıdem tazminatını hesaplayın.',
  category: 'other',
  type: 'simple',
  fields: [
    {
      id: 'startDate',
      label: 'İşe Giriş Tarihi',
      type: 'date',
      required: true,
      defaultValue: '2022-01-01',
      description: 'İşyerinde fiilen çalışmaya başladığınız ilk gün.'
    },
    {
      id: 'endDate',
      label: 'İşten Ayrılış Tarihi',
      type: 'date',
      required: true,
      defaultValue: '2026-02-01',
      description: 'İş sözleşmenizin sona erdiği tarih (Tavan bu tarihe göre belirlenir).'
    },
    {
      id: 'grossSalary',
      label: 'Son Giydirilmiş Aylık Brüt Ücret (TL)',
      type: 'currency',
      required: true,
      defaultValue: 50000,
      description: 'Çıplak brüt maaşınıza ek olarak nakdi veya ayni düzenli yan haklar (yol, yemek, düzenli ikramiye vb.) dahildir.'
    }
  ],
  schema,
  calculate: (input) => calculateKidemTazminati(input),
  metadata: {
    title: 'Kıdem Tazminatı Hesaplama 2026 – Güncel Tavan ve Net Tazminat',
    description: '2026 resmî kıdem tazminatı tavanı (64.948,77 TL / 73.729,87 TL) ve yasal mevzuata göre brüt ve net kıdem tazminatınızı hesaplayın.',
    keywords: [
      'kıdem tazminatı hesaplama',
      '2026 kıdem tazminatı tavanı',
      'kıdem tazminatı tavanı 2026',
      'kıdem tazminatı hesapla',
      'iş kanunu kıdem tazminatı',
      'net kıdem tazminatı',
      'damga vergisi kıdem tazminatı'
    ],
    canonical: 'https://www.hesapera.com.tr/hesaplama/kidem-tazminati',
    icon: 'Briefcase',
    content: {
      intro: 'Kıdem Tazminatı Hesaplama aracı; 1475 sayılı İş Kanunu’nun 14. maddesi, T.C. Çalışma ve Sosyal Güvenlik Bakanlığı (ÇSGB) resmî istatistikleri ve Hazine ve Maliye Bakanlığı tarafından yayımlanan Mali ve Sosyal Haklar Genelgeleri uyarınca çalışanın hak edeceği yasal kıdem tazminatı tutarını hesaplar.',
      sections: [
        {
          title: '1. Kıdem tazminatı nedir ve kimler hak kazanır?',
          paragraphs: [
            'Kıdem tazminatı, aynı işverene bağlı işyerinde en az bir tam yıl çalışan işçinin, iş sözleşmesinin belirli yasal şartlar dahilinde sona ermesi halinde işveren tarafından ödenen toplu paradır.',
            'İş sözleşmesinin işveren tarafından haklı bir neden olmaksızın feshedilmesi, işçi tarafından haklı nedenle feshedilmesi (4857 s.K. m. 24), emeklilik, askerlik veya kadın işçinin evlilik tarihinden itibaren 1 yıl içinde kendi isteğiyle ayrılması hallerinde kıdem tazminatına hak kazanılır.'
          ]
        },
        {
          title: '2. Giydirilmiş brüt ücret nedir?',
          paragraphs: [
            'Kıdem tazminatı hesabında yalnızca bordrodaki temel brüt ücret değil, işçiye sağlanan para ve para ile ölçülmesi mümkün sözleşmeden veya kanundan doğan tüm düzenli menfaatler (giydirilmiş brüt ücret) esas alınır.',
            'Yol yardımı, yemek ücreti, düzenli olarak ödenen ikramiye, prim ve yakacak yardımı gibi ödemelerin bir yıllık toplamının bir aya düşen payı brüt ücrete ilave edilir.'
          ]
        },
        {
          title: '3. 2026 Kıdem tazminatı tavanı ne kadardır?',
          paragraphs: [
            '1475 sayılı Kanun gereğince kıdem tazminatının yıllık tavanı, en yüksek devlet memuruna bir hizmet yılı için ödenecek azami emeklilik ikramiyesi tutarını aşamaz.',
            'T.C. Çalışma ve Sosyal Güvenlik Bakanlığı (ÇSGB) ve Hazine ve Maliye Bakanlığı tarafından yayımlanan resmî verilere göre:',
            '• 01.01.2025 – 30.06.2025 Dönemi Tavanı: 46.655,43 TL (Resmî ÇSGB Kıdem Tavanı Tarihçesi)',
            '• 01.07.2025 – 31.12.2025 Dönemi Tavanı: 53.919,68 TL',
            '• 01.01.2026 – 30.06.2026 Dönemi Tavanı: 64.948,77 TL (HMB 06.01.2026 tarih ve 1 Sıra Nolu Genelge)',
            '• 01.07.2026 – 31.12.2026 Dönemi Tavanı: 73.729,87 TL (HMB 03.07.2026 tarih ve 5 Sıra Nolu Genelge)',
            'İşçinin giydirilmiş brüt ücreti tavanı aşsa dahi, her bir hizmet yılı için ödenecek azami tutar fesih tarihindeki tavan rakamıyla sınırlıdır.'
          ]
        },
        {
          title: '4. Kıdem tazminatından hangi kesintiler yapılır?',
          paragraphs: [
            'Kıdem tazminatından Gelir Vergisi (193 s.K. m. 25/7) ve SGK primi (5510 s.K. m. 80/1-c) kesilmez.',
            'Yasal olarak sadece 488 sayılı Damga Vergisi Kanunu uyarınca binde 7,59 (oran: 0,00759) damga vergisi kesintisi yapılarak net tutar çalışana ödenir.'
          ]
        }
      ],
      sources: [
        {
          name: '1475 sayılı İş Kanunu Madde 14 (Mevzuat Bilgi Sistemi)',
          url: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=1475&MevzuatTur=1&MevzuatTertip=5'
        },
        {
          name: 'T.C. Çalışma ve Sosyal Güvenlik Bakanlığı - Ücret ve Sendikal İstatistikler Resmî Tablosu (2016–2026 Tavan Tarihçesi)',
          url: CSGB_SOURCE_URL
        },
        {
          name: '488 sayılı Damga Vergisi Kanunu (I) Sayılı Tablo',
          url: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=488&MevzuatTur=1&MevzuatTertip=5'
        }
      ]
    }
  }
};
