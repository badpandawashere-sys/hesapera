import { describe, it, expect } from 'vitest';
import {
  calculateKidemTazminati,
  calculateServicePeriod,
  getKidemTavani,
  isValidCalendarDate,
  CSGB_SOURCE_URL,
  RESMI_KIDEM_TAVANLARI_2016_2026
} from '../kidemTazminati';

describe('Kıdem Tazminatı Motoru (calculateKidemTazminati)', () => {
  it('1. Tam yıl hesabı (Tam 3 yıl, tavan altı brüt ücret)', () => {
    // 01.01.2023 - 01.01.2026: Tam 3 yıl
    // Brüt: 50.000 TL (2026/1. dönem tavanı 64.948,77 TL'nin altında)
    const result = calculateKidemTazminati({
      startDate: '2023-01-01',
      endDate: '2026-01-01',
      grossSalary: 50000
    });

    expect(result.isEligible).toBe(true);
    expect(result.servicePeriod.years).toBe(3);
    expect(result.servicePeriod.months).toBe(0);
    expect(result.servicePeriod.days).toBe(0);
    expect(result.isCapped).toBe(false);
    expect(result.effectiveBaseSalary).toBe(50000);

    // Brüt kıdem: 50.000 * 3 = 150.000 TL
    expect(result.grossSeverance).toBe(150000);
    // Damga vergisi: 150.000 * 0.00759 = 1.138,50 TL
    expect(result.stampTax).toBe(1138.50);
    // Net kıdem: 150.000 - 1.138,50 = 148.861,50 TL
    expect(result.netSeverance).toBe(148861.50);
    expect(result.incomeTax).toBe(0);
    expect(result.sgkDeduction).toBe(0);
  });

  it('2. Kısmi yıl hesabı (Yıl + Ay + Gün orantısı)', () => {
    // 15.03.2021 - 20.08.2024: 3 yıl, 5 ay, 5 gün
    // Esas ücret: 30.000 TL
    const result = calculateKidemTazminati({
      startDate: '2021-03-15',
      endDate: '2024-08-20',
      grossSalary: 30000
    });

    expect(result.isEligible).toBe(true);
    expect(result.servicePeriod.years).toBe(3);
    expect(result.servicePeriod.months).toBe(5);
    expect(result.servicePeriod.days).toBe(5);

    // Yıl tutarı: 30.000 * 3 = 90.000 TL
    // Ay tutarı: (30.000 / 12) * 5 = 12.500 TL
    // Gün tutarı: (30.000 / 365) * 5 = 410.96 TL
    // Toplam Brüt: 90.000 + 12.500 + 410.96 = 102.910,96 TL
    expect(result.breakdown.yearAmount).toBe(90000);
    expect(result.breakdown.monthAmount).toBe(12500);
    expect(result.breakdown.dayAmount).toBe(410.96);
    expect(result.grossSeverance).toBe(102910.96);

    // Damga vergisi: 102.910,96 * 0.00759 = 781.09418... -> 781.09 TL
    expect(result.stampTax).toBe(781.09);
    // Net: 102.910,96 - 781.09 = 102.129,87 TL
    expect(result.netSeverance).toBe(102129.87);
  });

  it('3. 1 yıldan az kıdem şartı (Hak kazanılamaz, 0 TL)', () => {
    // 01.02.2026 - 15.10.2026: 8 ay 14 gün (1 yıldan az)
    const result = calculateKidemTazminati({
      startDate: '2026-02-01',
      endDate: '2026-10-15',
      grossSalary: 50000
    });

    expect(result.isEligible).toBe(false);
    expect(result.ineligibilityReason).toContain('en az 1 tam yıl');
    expect(result.grossSeverance).toBe(0);
    expect(result.netSeverance).toBe(0);
    expect(result.stampTax).toBe(0);
  });

  it('4. Tavan üstü brüt ücret ve 2026 1. Dönem Tavanı (64.948,77 TL)', () => {
    // Ayrılış: 15.04.2026 (2026 1. dönem: 01.01.2026 - 30.06.2026)
    // Brüt: 100.000 TL (Tavan olan 64.948,77 TL'yi aşıyor)
    const result = calculateKidemTazminati({
      startDate: '2024-04-15',
      endDate: '2026-04-15',
      grossSalary: 100000
    });

    expect(result.isEligible).toBe(true);
    expect(result.servicePeriod.years).toBe(2);
    expect(result.isCapped).toBe(true);
    expect(result.appliedCeiling).toBe(64948.77);
    expect(result.effectiveBaseSalary).toBe(64948.77);

    // Brüt: 64.948,77 * 2 = 129.897,54 TL
    expect(result.grossSeverance).toBe(129897.54);
    // Damga vergisi: 129.897,54 * 0.00759 = 985.92 TL
    expect(result.stampTax).toBe(985.92);
    // Net: 129.897,54 - 985.92 = 128.911,62 TL
    expect(result.netSeverance).toBe(128911.62);
  });

  it('5. Tavan üstü brüt ücret ve 2026 2. Dönem Tavanı (73.729,87 TL)', () => {
    // Ayrılış: 15.08.2026 (2026 2. dönem: 01.07.2026 - 31.12.2026)
    // Brüt: 120.000 TL
    const result = calculateKidemTazminati({
      startDate: '2025-08-15',
      endDate: '2026-08-15',
      grossSalary: 120000
    });

    expect(result.isEligible).toBe(true);
    expect(result.appliedCeiling).toBe(73729.87);
    expect(result.effectiveBaseSalary).toBe(73729.87);
    expect(result.isCapped).toBe(true);

    // 1 yıl: 73.729,87 TL brüt
    expect(result.grossSeverance).toBe(73729.87);
    // Damga vergisi: 73.729,87 * 0.00759 = 559.61 TL
    expect(result.stampTax).toBe(559.61);
    expect(result.netSeverance).toBe(73170.26);
  });

  it('6. 2025 1. Dönem tavan düzeltmesi (46.655,43 TL) ve hesaplama doğrulaması', () => {
    // Ayrılış: 15.03.2025 (2025 1. dönem: 01.01.2025 - 30.06.2025)
    // 01.01.2025–30.06.2025 için resmî tavan 46.655,43 TL olmalıdır.
    const result = calculateKidemTazminati({
      startDate: '2024-03-15',
      endDate: '2025-03-15',
      grossSalary: 60000
    });

    expect(result.isEligible).toBe(true);
    expect(result.appliedCeiling).toBe(46655.43);
    expect(result.effectiveBaseSalary).toBe(46655.43);
    expect(result.isCapped).toBe(true);
    expect(result.grossSeverance).toBe(46655.43);
    // Damga vergisi: 46.655,43 * 0.00759 = 354.11 TL
    expect(result.stampTax).toBe(354.11);
    expect(result.netSeverance).toBe(46301.32);
  });

  it('7. 2025 2. Dönem tavanı (53.919,68 TL) doğrulaması', () => {
    const result = calculateKidemTazminati({
      startDate: '2024-08-01',
      endDate: '2025-08-01',
      grossSalary: 70000
    });

    expect(result.isEligible).toBe(true);
    expect(result.appliedCeiling).toBe(53919.68);
    expect(result.effectiveBaseSalary).toBe(53919.68);
    expect(result.isCapped).toBe(true);
  });

  it('8. Dönem sınırları regresyon testi (Tüm geçiş tarihleri tam sınır kontrolü)', () => {
    // 2024 2. dönem son günü
    expect(getKidemTavani('2024-12-31')?.ceiling).toBe(41828.42);

    // 2025 1. dönem ilk ve son günü (46.655,43 TL)
    expect(getKidemTavani('2025-01-01')?.ceiling).toBe(46655.43);
    expect(getKidemTavani('2025-06-30')?.ceiling).toBe(46655.43);

    // 2025 2. dönem ilk ve son günü (53.919,68 TL)
    expect(getKidemTavani('2025-07-01')?.ceiling).toBe(53919.68);
    expect(getKidemTavani('2025-12-31')?.ceiling).toBe(53919.68);

    // 2026 1. dönem ilk ve son günü (64.948,77 TL)
    expect(getKidemTavani('2026-01-01')?.ceiling).toBe(64948.77);
    expect(getKidemTavani('2026-06-30')?.ceiling).toBe(64948.77);

    // 2026 2. dönem ilk ve son günü (73.729,87 TL)
    expect(getKidemTavani('2026-07-01')?.ceiling).toBe(73729.87);
    expect(getKidemTavani('2026-12-31')?.ceiling).toBe(73729.87);
  });

  it('9. 2016-2024 ÇSGB resmî tarihçe tablosunun tam kapsanması', () => {
    expect(RESMI_KIDEM_TAVANLARI_2016_2026.length).toBe(22); // 11 yıl x 2 dönem = 22 dönem

    expect(getKidemTavani('2016-03-01')?.ceiling).toBe(4092.53);
    expect(getKidemTavani('2016-09-01')?.ceiling).toBe(4297.21);
    expect(getKidemTavani('2017-03-01')?.ceiling).toBe(4426.16);
    expect(getKidemTavani('2017-09-01')?.ceiling).toBe(4732.48);
    expect(getKidemTavani('2018-03-01')?.ceiling).toBe(5001.76);
    expect(getKidemTavani('2018-09-01')?.ceiling).toBe(5434.42);
    expect(getKidemTavani('2019-03-01')?.ceiling).toBe(6017.60);
    expect(getKidemTavani('2019-09-01')?.ceiling).toBe(6379.86);
    expect(getKidemTavani('2020-03-01')?.ceiling).toBe(6730.15);
    expect(getKidemTavani('2020-09-01')?.ceiling).toBe(7117.17);
    expect(getKidemTavani('2021-03-01')?.ceiling).toBe(7638.96);
    expect(getKidemTavani('2021-09-01')?.ceiling).toBe(8284.51);
    expect(getKidemTavani('2022-03-01')?.ceiling).toBe(10848.59);
    expect(getKidemTavani('2022-09-01')?.ceiling).toBe(15371.40);
    expect(getKidemTavani('2023-03-01')?.ceiling).toBe(19982.83);
    expect(getKidemTavani('2023-09-01')?.ceiling).toBe(23489.83);
    expect(getKidemTavani('2024-03-01')?.ceiling).toBe(35058.58);
    expect(getKidemTavani('2024-09-01')?.ceiling).toBe(41828.42);
  });

  it('10. Desteklenmeyen tarihlerin güvenli reddi (2016 öncesi ve 2026 sonrası)', () => {
    // 2016 öncesi: tavan bulunamaz, asla eski tavan uygulanmaz
    expect(getKidemTavani('2015-12-31')).toBeNull();
    expect(() => {
      calculateKidemTazminati({
        startDate: '2014-01-01',
        endDate: '2015-12-31',
        grossSalary: 50000
      });
    }).toThrow(/resmî kıdem tazminatı tavanı bulunamadı/i);

    // 2026 sonrası: tavan henüz ilan edilmediği için güvenli reddedilir
    expect(getKidemTavani('2027-01-01')).toBeNull();
    expect(() => {
      calculateKidemTazminati({
        startDate: '2025-01-01',
        endDate: '2027-01-01',
        grossSalary: 50000
      });
    }).toThrow(/resmî kıdem tazminatı tavanı bulunamadı/i);
  });

  it('11. Gerçek takvim tarihi doğrulaması (2026-02-30 gibi takvimde olmayan tarihlerin reddi)', () => {
    // Takvimde olmayan tarihler
    expect(isValidCalendarDate('2026-02-30')).toBe(false);
    expect(isValidCalendarDate('2026-02-29')).toBe(false); // 2026 artık yıl değil
    expect(isValidCalendarDate('2025-04-31')).toBe(false); // Nisan 30 gün
    expect(isValidCalendarDate('2025-06-31')).toBe(false); // Haziran 30 gün
    expect(isValidCalendarDate('2025-09-31')).toBe(false); // Eylül 30 gün
    expect(isValidCalendarDate('2025-11-31')).toBe(false); // Kasım 30 gün
    expect(isValidCalendarDate('2026-00-10')).toBe(false);
    expect(isValidCalendarDate('2026-13-01')).toBe(false);
    expect(isValidCalendarDate('not-a-date')).toBe(false);

    // Geçerli tarihler
    expect(isValidCalendarDate('2024-02-29')).toBe(true);  // 2024 artık yıl
    expect(isValidCalendarDate('2026-02-28')).toBe(true);
    expect(isValidCalendarDate('2026-01-31')).toBe(true);

    // calculateKidemTazminati takvim dışı tarihlerde Date.parse'ın sessiz yuvarlamasına izin vermez
    expect(() => {
      calculateKidemTazminati({
        startDate: '2024-01-01',
        endDate: '2026-02-30',
        grossSalary: 50000
      });
    }).toThrow(/geçerli bir takvim günü girin/i);

    expect(() => {
      calculateKidemTazminati({
        startDate: '2024-02-30',
        endDate: '2026-02-28',
        grossSalary: 50000
      });
    }).toThrow(/geçerli bir takvim günü girin/i);
  });

  it('12. Geçersiz tarih sırası kontrolü (Çıkış tarihi girişten önce)', () => {
    expect(() => {
      calculateKidemTazminati({
        startDate: '2026-05-01',
        endDate: '2025-05-01',
        grossSalary: 50000
      });
    }).toThrow('İşten ayrılış tarihi işe giriş tarihinden önce olamaz.');
  });

  it('13. Artık yıl (Leap Year) ve artık günler hesabı', () => {
    // 2024 yılı artık yıldır (Şubat 29 çeker)
    // 28.02.2024 - 01.03.2024 (2 gün)
    const sp = calculateServicePeriod('2024-02-28', '2024-03-01');
    expect(sp.days).toBe(2);
    expect(sp.months).toBe(0);
    expect(sp.years).toBe(0);
    expect(sp.totalDays).toBe(3); // 28 Şubat, 29 Şubat, 1 Mart (3 gün)
  });

  it('14. Resmî ÇSGB kaynak URL ve referans doğrulaması', () => {
    const tavan2026_1 = getKidemTavani('2026-03-15');
    expect(tavan2026_1).not.toBeNull();
    expect(tavan2026_1?.sourceUrl).toBe(CSGB_SOURCE_URL);
    expect(tavan2026_1?.sourceUrl).toContain('csgb.gov.tr');
    expect(tavan2026_1?.sourceUrl).toContain('ucret-ve-sendikal-istatistikler');

    const result = calculateKidemTazminati({
      startDate: '2022-01-01',
      endDate: '2026-03-15',
      grossSalary: 50000
    });
    expect(result.tavanInfo.sourceUrl).toBe(CSGB_SOURCE_URL);
    expect(result.disclaimer).toBeDefined();
    expect(result.disclaimer.length).toBeGreaterThan(50);
  });
});
