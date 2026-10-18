/**
 * Kıdem Tazminatı Hesaplama Motoru (1475 sayılı İş Kanunu Madde 14)
 * Resmî Kaynaklar:
 * - 1475 sayılı İş Kanunu Md. 14 (4857 s.K. Geçici Md. 6)
 * - T.C. Çalışma ve Sosyal Güvenlik Bakanlığı (ÇSGB) Ücret ve Sendikal İstatistikler / Resmî Kıdem Tavanı Bülteni:
 *   https://www.csgb.gov.tr/yayinlar/calisma-hayati-istatistikleri-e-bulteni/temmuz-2026/ucret-ve-sendikal-istatistikler.html
 * - Hazine ve Maliye Bakanlığı Kamu Mali Yönetim ve Dönüşüm Genel Müdürlüğü Mali ve Sosyal Haklar Genelgeleri (2016–2026)
 * - 488 sayılı Damga Vergisi Kanunu (I) sayılı tablo (Binde 7,59)
 */

export const CSGB_SOURCE_URL =
  "https://www.csgb.gov.tr/yayinlar/calisma-hayati-istatistikleri-e-bulteni/temmuz-2026/ucret-ve-sendikal-istatistikler.html";

export interface KidemTazminatiInput {
  startDate: string; // YYYY-MM-DD (İşe giriş tarihi)
  endDate: string;   // YYYY-MM-DD (İşten ayrılış tarihi)
  grossSalary: number; // Aylık giydirilmiş brüt ücret (çıplak brüt + nakdi/ayni düzenli yan haklar)
}

export interface KidemTavanEntry {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  ceiling: number;
  periodLabel: string;
  circularRef: string;
  sourceUrl: string;
}

export interface KidemTavanInfo {
  ceiling: number;
  periodLabel: string;
  circularRef: string;
  sourceUrl: string;
}

export interface ServicePeriod {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  formattedString: string;
}

export interface KidemTazminatiResult {
  isEligible: boolean; // En az 1 tam yıl çalışma şartı
  ineligibilityReason?: string;
  servicePeriod: ServicePeriod;
  grossSalary: number;
  appliedCeiling: number;
  isCapped: boolean;
  effectiveBaseSalary: number;
  tavanInfo: KidemTavanInfo;
  breakdown: {
    yearAmount: number;
    monthAmount: number;
    dayAmount: number;
  };
  grossSeverance: number; // Brüt Kıdem Tazminatı
  stampTaxRate: number;   // 0.00759 (Binde 7,59)
  stampTax: number;       // Kesilen Damga Vergisi
  incomeTax: number;      // 0 TL (Gelir vergisinden istisna)
  sgkDeduction: number;   // 0 TL (SGK kesintisinden muaf)
  netSeverance: number;   // Net Kıdem Tazminatı
  disclaimer: string;
}

const round2 = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Takvim günü doğrulaması:
 * JavaScript Date.parse'ın 2026-02-30 gibi günleri sonraki aya sessizce
 * yuvarlamasını engellemek için gün/ay/yıl sınırlarını takvim matematiğiyle doğrular.
 */
export function isValidCalendarDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // 30 çeken aylar (Nisan, Haziran, Eylül, Kasım)
  if ([4, 6, 9, 11].includes(month) && day > 30) {
    return false;
  }

  // Şubat ayı ve artık yıl kontrolü
  if (month === 2) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const maxDays = isLeap ? 29 : 28;
    if (day > maxDays) return false;
  }

  // UTC Date üzerinden gidiş-dönüş doğrulaması
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * T.C. Çalışma ve Sosyal Güvenlik Bakanlığı (ÇSGB) resmî istatistikleri ve
 * Hazine ve Maliye Bakanlığı genelgeleri uyarınca 2016–2026 yılları arasındaki
 * tüm resmî kıdem tazminatı tavan tablosu.
 */
export const RESMI_KIDEM_TAVANLARI_2016_2026: KidemTavanEntry[] = [
  // 2016
  {
    startDate: "2016-01-01",
    endDate: "2016-06-30",
    ceiling: 4092.53,
    periodLabel: "01.01.2016 – 30.06.2016",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2016 1. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  {
    startDate: "2016-07-01",
    endDate: "2016-12-31",
    ceiling: 4297.21,
    periodLabel: "01.07.2016 – 31.12.2016",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2016 2. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  // 2017
  {
    startDate: "2017-01-01",
    endDate: "2017-06-30",
    ceiling: 4426.16,
    periodLabel: "01.01.2017 – 30.06.2017",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2017 1. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  {
    startDate: "2017-07-01",
    endDate: "2017-12-31",
    ceiling: 4732.48,
    periodLabel: "01.07.2017 – 31.12.2017",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2017 2. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  // 2018
  {
    startDate: "2018-01-01",
    endDate: "2018-06-30",
    ceiling: 5001.76,
    periodLabel: "01.01.2018 – 30.06.2018",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2018 1. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  {
    startDate: "2018-07-01",
    endDate: "2018-12-31",
    ceiling: 5434.42,
    periodLabel: "01.07.2018 – 31.12.2018",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2018 2. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  // 2019
  {
    startDate: "2019-01-01",
    endDate: "2019-06-30",
    ceiling: 6017.60,
    periodLabel: "01.01.2019 – 30.06.2019",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2019 1. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  {
    startDate: "2019-07-01",
    endDate: "2019-12-31",
    ceiling: 6379.86,
    periodLabel: "01.07.2019 – 31.12.2019",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2019 2. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  // 2020
  {
    startDate: "2020-01-01",
    endDate: "2020-06-30",
    ceiling: 6730.15,
    periodLabel: "01.01.2020 – 30.06.2020",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2020 1. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  {
    startDate: "2020-07-01",
    endDate: "2020-12-31",
    ceiling: 7117.17,
    periodLabel: "01.07.2020 – 31.12.2020",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2020 2. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  // 2021
  {
    startDate: "2021-01-01",
    endDate: "2021-06-30",
    ceiling: 7638.96,
    periodLabel: "01.01.2021 – 30.06.2021",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2021 1. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  {
    startDate: "2021-07-01",
    endDate: "2021-12-31",
    ceiling: 8284.51,
    periodLabel: "01.07.2021 – 31.12.2021",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2021 2. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  // 2022
  {
    startDate: "2022-01-01",
    endDate: "2022-06-30",
    ceiling: 10848.59,
    periodLabel: "01.01.2022 – 30.06.2022",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2022 1. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  {
    startDate: "2022-07-01",
    endDate: "2022-12-31",
    ceiling: 15371.40,
    periodLabel: "01.07.2022 – 31.12.2022",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2022 2. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  // 2023
  {
    startDate: "2023-01-01",
    endDate: "2023-06-30",
    ceiling: 19982.83,
    periodLabel: "01.01.2023 – 30.06.2023",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2023 1. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  {
    startDate: "2023-07-01",
    endDate: "2023-12-31",
    ceiling: 23489.83,
    periodLabel: "01.07.2023 – 31.12.2023",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2023 2. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  // 2024
  {
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    ceiling: 35058.58,
    periodLabel: "01.01.2024 – 30.06.2024",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2024 1. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  {
    startDate: "2024-07-01",
    endDate: "2024-12-31",
    ceiling: 41828.42,
    periodLabel: "01.07.2024 – 31.12.2024",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 2024 2. Dönem Genelgesi",
    sourceUrl: CSGB_SOURCE_URL
  },
  // 2025
  {
    startDate: "2025-01-01",
    endDate: "2025-06-30",
    ceiling: 46655.43,
    periodLabel: "01.01.2025 – 30.06.2025",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 06.01.2025 tarihli ve 1 Sıra Nolu Genelge",
    sourceUrl: CSGB_SOURCE_URL
  },
  {
    startDate: "2025-07-01",
    endDate: "2025-12-31",
    ceiling: 53919.68,
    periodLabel: "01.07.2025 – 31.12.2025",
    circularRef: "ÇSGB Resmî Kıdem Tavanı Tarihçesi / HMB 07.07.2025 tarihli ve 5 Sıra Nolu Genelge",
    sourceUrl: CSGB_SOURCE_URL
  },
  // 2026
  {
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    ceiling: 64948.77,
    periodLabel: "01.01.2026 – 30.06.2026",
    circularRef: "ÇSGB Ücret ve Sendikal İstatistikler / HMB 06.01.2026 tarihli ve 1 Sıra Nolu Genelge",
    sourceUrl: CSGB_SOURCE_URL
  },
  {
    startDate: "2026-07-01",
    endDate: "2026-12-31",
    ceiling: 73729.87,
    periodLabel: "01.07.2026 – 31.12.2026",
    circularRef: "ÇSGB Ücret ve Sendikal İstatistikler / HMB 03.07.2026 tarihli ve 5 Sıra Nolu Genelge",
    sourceUrl: CSGB_SOURCE_URL
  }
];

/**
 * İşten ayrılış tarihine göre yürürlükteki resmî kıdem tazminatı tavanını bulur.
 * Yalnızca resmî ÇSGB tarihçesinde bulunan 2016–2026 dönemleri desteklenir.
 * Desteklenmeyen (2016 öncesi veya 2026 sonrası) ya da takvimde bulunmayan tarihlerde null döner.
 */
export function getKidemTavani(endDateStr: string): KidemTavanInfo | null {
  if (!isValidCalendarDate(endDateStr)) {
    return null;
  }

  const found = RESMI_KIDEM_TAVANLARI_2016_2026.find(
    (entry) => endDateStr >= entry.startDate && endDateStr <= entry.endDate
  );

  if (!found) {
    return null;
  }

  return {
    ceiling: found.ceiling,
    periodLabel: found.periodLabel,
    circularRef: found.circularRef,
    sourceUrl: found.sourceUrl
  };
}

/**
 * İki tarih arasındaki hizmet süresini (yıl, ay, gün ve toplam takvim günü) hesaplar.
 * Yargıtay 9. Hukuk Dairesi'nin yerleşik içtihatlarına göre takvim farkı esas alınır.
 */
export function calculateServicePeriod(startDateStr: string, endDateStr: string): ServicePeriod {
  if (!isValidCalendarDate(startDateStr) || !isValidCalendarDate(endDateStr)) {
    throw new Error("Geçerli bir takvim tarihi giriniz.");
  }

  if (endDateStr < startDateStr) {
    throw new Error("İşten ayrılış tarihi işe giriş tarihinden önce olamaz.");
  }

  const start = new Date(startDateStr + "T00:00:00Z");
  const end = new Date(endDateStr + "T00:00:00Z");

  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

  const startYear = start.getUTCFullYear();
  const startMonth = start.getUTCMonth();
  const startDay = start.getUTCDate();

  const endYear = end.getUTCFullYear();
  let endMonth = end.getUTCMonth();
  const endDay = end.getUTCDate();

  let days = endDay - startDay;
  let months = endMonth - startMonth;
  let years = endYear - startYear;

  if (days < 0) {
    // Bir önceki ayın gün sayısını ekle
    const prevMonthDays = new Date(Date.UTC(endYear, endMonth, 0)).getUTCDate();
    days += prevMonthDays;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yıl`);
  if (months > 0) parts.push(`${months} ay`);
  if (days > 0) parts.push(`${days} gün`);
  if (parts.length === 0) parts.push("0 gün");

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalDays,
    formattedString: parts.join(" ")
  };
}

export function calculateKidemTazminati(input: KidemTazminatiInput): KidemTazminatiResult {
  const { startDate, endDate, grossSalary } = input;

  if (!startDate || !endDate) {
    throw new Error("İşe başlama ve işten ayrılış tarihleri zorunludur.");
  }

  if (!isValidCalendarDate(startDate)) {
    throw new Error("İşe başlama tarihi için geçerli bir takvim günü girin (örn. 2026-02-30 geçersizdir).");
  }

  if (!isValidCalendarDate(endDate)) {
    throw new Error("İşten ayrılış tarihi için geçerli bir takvim günü girin (örn. 2026-02-30 geçersizdir).");
  }

  if (endDate < startDate) {
    throw new Error("İşten ayrılış tarihi işe giriş tarihinden önce olamaz.");
  }

  const tavanInfo = getKidemTavani(endDate);
  if (!tavanInfo) {
    throw new Error(
      "Belirtilen işten ayrılış tarihi için resmî kıdem tazminatı tavanı bulunamadı. Hesaplama yalnızca resmî ÇSGB tarihçesi ilan edilmiş 2016–2026 dönemleri için yapılabilir."
    );
  }

  const validGross = typeof grossSalary === "number" && !isNaN(grossSalary) && grossSalary > 0 ? grossSalary : 0;
  const servicePeriod = calculateServicePeriod(startDate, endDate);

  // 1475 sayılı Kanun Madde 14 uyarınca asgari 1 tam yıl çalışma şartı
  const isEligible = servicePeriod.years >= 1;

  const disclaimer =
    "Kıdem tazminatına hak kazanma durumu; iş sözleşmesinin fesih gerekçesine (işverenin haklı feshi dışındaki fesihler, çalışanın 4857 s.K. m. 24 uyarınca haklı feshi, emeklilik, askerlik, kadın işçinin evlilik tarihinden itibaren 1 yıl içinde ayrılması vb.) bağlıdır. Bu hesaplama aracı hukuki bir hak kazanma kararı veya bağlayıcı bilirkişi raporu teşkil etmez; yalnızca girilen tarihlere ve ücrete göre yasal formül üzerinden simülasyon yapar.";

  if (!isEligible) {
    return {
      isEligible: false,
      ineligibilityReason:
        "1475 sayılı İş Kanunu'nun 14. maddesi uyarınca kıdem tazminatına hak kazanabilmek için aynı işverene bağlı olarak en az 1 tam yıl (365 gün) çalışmış olmak şarttır.",
      servicePeriod,
      grossSalary: validGross,
      appliedCeiling: tavanInfo.ceiling,
      isCapped: validGross > tavanInfo.ceiling,
      effectiveBaseSalary: Math.min(validGross, tavanInfo.ceiling),
      tavanInfo,
      breakdown: {
        yearAmount: 0,
        monthAmount: 0,
        dayAmount: 0
      },
      grossSeverance: 0,
      stampTaxRate: 0.00759,
      stampTax: 0,
      incomeTax: 0,
      sgkDeduction: 0,
      netSeverance: 0,
      disclaimer
    };
  }

  const isCapped = validGross > tavanInfo.ceiling;
  const effectiveBaseSalary = isCapped ? tavanInfo.ceiling : validGross;

  // Her tam yıl için 30 günlük ücret, artan aylar ve günler için orantılı pay
  const yearAmount = round2(effectiveBaseSalary * servicePeriod.years);
  const monthAmount = round2((effectiveBaseSalary / 12) * servicePeriod.months);
  const dayAmount = round2((effectiveBaseSalary / 365) * servicePeriod.days);

  const grossSeverance = round2(yearAmount + monthAmount + dayAmount);

  // 488 sayılı Kanun: Binde 7,59 damga vergisi kesintisi
  const stampTaxRate = 0.00759;
  const stampTax = round2(grossSeverance * stampTaxRate);

  // Gelir vergisi ve SGK kesintisi yoktur (tavanı aşmayan kısım gelir vergisinden istisnadır)
  const incomeTax = 0;
  const sgkDeduction = 0;

  const netSeverance = round2(grossSeverance - stampTax);

  return {
    isEligible: true,
    servicePeriod,
    grossSalary: validGross,
    appliedCeiling: tavanInfo.ceiling,
    isCapped,
    effectiveBaseSalary,
    tavanInfo,
    breakdown: {
      yearAmount,
      monthAmount,
      dayAmount
    },
    grossSeverance,
    stampTaxRate,
    stampTax,
    incomeTax,
    sgkDeduction,
    netSeverance,
    disclaimer
  };
}
