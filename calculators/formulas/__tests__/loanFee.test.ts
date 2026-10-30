import {
  calculateLoanFee,
  calculateDaysBetween,
  calculateCommercialLimitCeilingRate,
  calculateCommercialUsageCeilingRate,
} from '../loanFee';
import { describe, it, expect } from 'vitest';

describe('Loan Fee Calculator (calculators/formulas/loanFee)', () => {
  // -------------------------------------------------------------------------
  // 1. 180 GÜNLÜK TL TİCARİ KREDİ (TCMB 2020/4 Madde 9: 180/360 ile Tavan %0,55)
  // -------------------------------------------------------------------------
  it('calculates 180-day TL commercial loan usage fee with prorated ceiling (0.55%)', () => {
    const res = calculateLoanFee(1000000, {
      loanAmount: 1000000,
      loanType: 'ticari',
      commercialKind: 'taksitli_tl',
      termDays: 180, // 180 gün vade
      commercialLimitAmount: 1000000,
      commercialLimitMonths: 12,
      commercialLimitFeeRate: 0.20, // 1.000.000 * 0.002 = 2.000 TL
      commercialUsageFeeRate: 0.55, // 180 gün tavanı: 1.10% * (180/360) = 0.55% -> 5.500 TL
      includeBsmv: true,
      deductionMode: 'deduct_all',
    });

    expect(res.raw.termDays).toBe(180);
    expect(res.raw.maxLegalUsageFeeRate).toBe(0.55); // (1.10 * 180) / 360 = 0.55%
    expect(res.raw.maxLegalUsageFeeAmount).toBe(5500);
    expect(res.raw.commercialUsageFee).toBe(5500);
    expect(res.raw.commercialLimitFee).toBe(2000);
    expect(res.raw.allocationFee).toBe(7500); // 2000 + 5500
    expect(res.raw.bsmvRate).toBe(0.05); // %5 Ticari BSMV (6802 SK m. 33)
    expect(res.raw.bsmvAmount).toBe(375); // 7500 * 0.05
    expect(res.raw.totalAllocationCost).toBe(7875);
    expect(res.raw.isUsageFeeOverCeiling).toBe(false);
    expect(res.raw.isLimitFeeOverCeiling).toBe(false);
    expect(res.raw.isOverCeiling).toBe(false);
    expect(res.raw.netDisbursedAmount).toBe(992125); // 1.000.000 - 7875
  });

  // -------------------------------------------------------------------------
  // 2. 181 GÜNLÜK TL TİCARİ KREDİ (TCMB 2020/4 Madde 9: 181/360 ile Tavan %0,5531)
  // -------------------------------------------------------------------------
  it('calculates 181-day TL commercial loan with precise day-count ceiling (%0.5531)', () => {
    const ceilingRate = calculateCommercialUsageCeilingRate('taksitli_tl', 181);
    expect(ceilingRate).toBe(0.5531); // round4((1.10 * 181) / 360) = 0.5531%

    const res = calculateLoanFee(1000000, {
      loanAmount: 1000000,
      loanType: 'ticari',
      commercialKind: 'taksitli_tl',
      termDays: 181,
      commercialUsageFeeRate: 0.5531,
    });

    expect(res.raw.termDays).toBe(181);
    expect(res.raw.maxLegalUsageFeeRate).toBe(0.5531);
    expect(res.raw.maxLegalUsageFeeAmount).toBe(5531);
    expect(res.raw.commercialUsageFee).toBe(5531);
    expect(res.raw.isUsageFeeOverCeiling).toBe(false);

    // If rate exceeds 0.5531%, ceiling breach should be flagged
    const resBreach = calculateLoanFee(1000000, {
      loanAmount: 1000000,
      loanType: 'ticari',
      commercialKind: 'taksitli_tl',
      termDays: 181,
      commercialUsageFeeRate: 0.70, // Exceeds 0.5531%
    });
    expect(resBreach.raw.isUsageFeeOverCeiling).toBe(true);
    expect(resBreach.raw.usageFeeExcessAmount).toBe(1469); // 7000 - 5531
  });

  // -------------------------------------------------------------------------
  // 3. TAM 1 YILLIK KREDİ (360 GÜN) — TCMB 2020/4 Madde 9: %1,10 Yıllık Tavan
  // -------------------------------------------------------------------------
  it('calculates 1-year (360-day) term TL commercial loan with full 1.10% usage fee ceiling', () => {
    const res = calculateLoanFee(2000000, {
      loanAmount: 2000000,
      loanType: 'ticari',
      commercialKind: 'taksitli_tl',
      termDays: 360, // Tam 1 ticari yıl
      commercialLimitFeeRate: 0.20,
      commercialUsageFeeRate: 1.10,
      includeBsmv: true,
      deductionMode: 'deduct_all',
    });

    expect(res.raw.maxLegalUsageFeeRate).toBe(1.10);
    expect(res.raw.maxLegalUsageFeeAmount).toBe(22000);
    expect(res.raw.commercialUsageFee).toBe(22000);
    expect(res.raw.commercialLimitFee).toBe(4000);
    expect(res.raw.allocationFee).toBe(26000);
    expect(res.raw.bsmvAmount).toBe(1300); // 26.000 * 0.05
    expect(res.raw.totalAllocationCost).toBe(27300);
    expect(res.raw.isOverCeiling).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 4. 6 AYLIK LİMİT TAHSİSİ, 12 AYLIK KULLANDIRIM (Limit Süresi Ayrımı)
  // -------------------------------------------------------------------------
  it('calculates 6-month limit duration (%0.10 ceiling) with 12-month loan disbursement (%1.10 ceiling)', () => {
    const limitCeiling = calculateCommercialLimitCeilingRate(6);
    expect(limitCeiling).toBe(0.10); // 0.20% * (6/12) = 0.10%

    const res = calculateLoanFee(1000000, {
      loanAmount: 1000000,
      loanType: 'ticari',
      commercialKind: 'taksitli_tl',
      commercialLimitAmount: 1000000,
      commercialLimitMonths: 6, // 6 aylık limit tahsisi -> Tavan %0,10
      termDays: 360, // 12 aylık kullandırım -> Tavan %1,10
      commercialLimitFeeRate: 0.10,
      commercialUsageFeeRate: 1.10,
      includeBsmv: true,
      deductionMode: 'deduct_all',
    });

    expect(res.raw.commercialLimitMonths).toBe(6);
    expect(res.raw.maxLegalLimitFeeRate).toBe(0.10);
    expect(res.raw.maxLegalLimitFeeAmount).toBe(1000); // 1.000.000 * %0.10
    expect(res.raw.commercialLimitFee).toBe(1000);

    expect(res.raw.termDays).toBe(360);
    expect(res.raw.maxLegalUsageFeeRate).toBe(1.10);
    expect(res.raw.maxLegalUsageFeeAmount).toBe(11000); // 1.000.000 * %1.10
    expect(res.raw.commercialUsageFee).toBe(11000);

    expect(res.raw.allocationFee).toBe(12000); // 1.000 + 11.000
    expect(res.raw.bsmvAmount).toBe(600); // 12.000 * 0.05
    expect(res.raw.totalAllocationCost).toBe(12600);
    expect(res.raw.isOverCeiling).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 5. 12 AYLIK LİMİT TAHSİSİ, 6 AYLIK KULLANDIRIM (180 Gün)
  // -------------------------------------------------------------------------
  it('calculates 12-month limit duration (%0.20 ceiling) with 6-month loan disbursement (180 days -> %0.55 ceiling)', () => {
    const res = calculateLoanFee(1000000, {
      loanAmount: 1000000,
      loanType: 'ticari',
      commercialKind: 'taksitli_tl',
      commercialLimitAmount: 1000000,
      commercialLimitMonths: 12, // 12 aylık limit tahsisi -> Tavan %0,20
      termDays: 180, // 180 günlük kullandırım -> Tavan %0,55
      commercialLimitFeeRate: 0.20,
      commercialUsageFeeRate: 0.55,
      includeBsmv: true,
      deductionMode: 'deduct_all',
    });

    expect(res.raw.commercialLimitMonths).toBe(12);
    expect(res.raw.maxLegalLimitFeeRate).toBe(0.20);
    expect(res.raw.maxLegalLimitFeeAmount).toBe(2000); // 1.000.000 * %0.20
    expect(res.raw.commercialLimitFee).toBe(2000);

    expect(res.raw.termDays).toBe(180);
    expect(res.raw.maxLegalUsageFeeRate).toBe(0.55);
    expect(res.raw.maxLegalUsageFeeAmount).toBe(5500); // 1.000.000 * %0.55
    expect(res.raw.commercialUsageFee).toBe(5500);

    expect(res.raw.allocationFee).toBe(7500); // 2.000 + 5.500
    expect(res.raw.bsmvAmount).toBe(375); // 7.500 * 0.05
    expect(res.raw.totalAllocationCost).toBe(7875);
    expect(res.raw.isOverCeiling).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 6. BAŞLANGIÇ VE BİTİŞ TARİHİ İLE GÜN SAYISI HESABI
  // -------------------------------------------------------------------------
  it('calculates term days automatically from start and end dates', () => {
    const days = calculateDaysBetween('2026-01-01', '2026-07-01');
    expect(days).toBe(181);

    const res = calculateLoanFee(1000000, {
      loanAmount: 1000000,
      loanType: 'ticari',
      commercialKind: 'taksitli_tl',
      startDate: '2026-01-01',
      endDate: '2026-07-01',
    });

    expect(res.raw.termDays).toBe(181);
    expect(res.raw.maxLegalUsageFeeRate).toBe(0.5531);
  });

  // -------------------------------------------------------------------------
  // 7. ROTATİF KREDİ (TCMB 2020/4 Madde 9: Ortalama Bakiye ve Dönemsel Tahakkuk)
  // -------------------------------------------------------------------------
  it('calculates rotatif (BCH) commercial loan based on average credit balance', () => {
    const res = calculateLoanFee(3000000, {
      loanAmount: 3000000,
      loanType: 'ticari',
      commercialKind: 'rotatif_tl',
      rotatifAverageBalance: 1500000, // Dönem ortalama kredi kullandırım bakiyesi: 1.500.000 TL
      termDays: 90, // 90 günlük dönem
      commercialLimitMonths: 12,
      commercialLimitFeeRate: 0.20,
      commercialUsageFeeRate: 0.275, // 90 gün tavanı: 1.10% * (90/360) = 0.275%
      includeBsmv: true,
      deductionMode: 'deduct_all',
    });

    expect(res.raw.commercialKind).toBe('rotatif_tl');
    expect(res.raw.rotatifAverageBalance).toBe(1500000);
    expect(res.raw.maxLegalUsageFeeRate).toBe(0.275); // 1.10 * 90 / 360 = 0.275
    // Usage fee on 1.500.000 average balance: 1.500.000 * 0.00275 = 4125 TL
    expect(res.raw.commercialUsageFee).toBe(4125);
    expect(res.raw.isUsageFeeOverCeiling).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 8. DÖVİZ CİNSİ TİCARİ KREDİ (TCMB 2020/4 Madde 9 ve Uygulama Talimatı: Serbest Oran)
  // -------------------------------------------------------------------------
  it('calculates foreign currency (döviz) commercial loan with free market usage fee without legal ceiling breach', () => {
    const res = calculateLoanFee(500000, {
      loanAmount: 500000, // 500.000 USD/EUR
      loanType: 'ticari',
      commercialKind: 'doviz',
      commercialLimitFeeRate: 0.20,
      commercialUsageFeeRate: 1.50, // Dövizde serbest oran (örneğin %1,50)
      includeBsmv: true,
      deductionMode: 'deduct_all',
    });

    expect(res.raw.commercialKind).toBe('doviz');
    expect(res.raw.commercialLimitFee).toBe(1000);
    expect(res.raw.commercialUsageFee).toBe(7500);
    expect(res.raw.isUsageFeeOverCeiling).toBe(false); // FX has no rigid usage fee cap
    expect(res.raw.isLimitFeeOverCeiling).toBe(false);
    expect(res.raw.isOverCeiling).toBe(false);
    expect(res.raw.allocationFee).toBe(8500);
    expect(res.raw.bsmvAmount).toBe(425); // 8500 * 0.05
  });

  // -------------------------------------------------------------------------
  // 9. LİMİT TUTARI VE KULLANDIRIM TUTARI FARKLI OLAN KREDİ (Farklı Matrahlar)
  // -------------------------------------------------------------------------
  it('calculates commercial loan with different limit and disbursement amounts (distinct matrices)', () => {
    const res = calculateLoanFee(2000000, {
      loanAmount: 2000000, // Kullandırılan nakdi kredi: 2.000.000 TL
      commercialLimitAmount: 5000000, // Tahsis edilen kredi limiti: 5.000.000 TL
      commercialLimitMonths: 12,
      loanType: 'ticari',
      commercialKind: 'taksitli_tl',
      termDays: 360,
      commercialLimitFeeRate: 0.20, // 5.000.000 * 0.002 = 10.000 TL
      commercialUsageFeeRate: 1.10, // 2.000.000 * 0.011 = 22.000 TL
      includeBsmv: true,
      deductionMode: 'deduct_all',
    });

    expect(res.raw.commercialLimitAmount).toBe(5000000);
    expect(res.raw.loanAmount).toBe(2000000);
    expect(res.raw.commercialLimitFee).toBe(10000); // 5M * %0.20
    expect(res.raw.commercialUsageFee).toBe(22000); // 2M * %1.10
    expect(res.raw.allocationFee).toBe(32000); // 10.000 + 22.000
    expect(res.raw.bsmvAmount).toBe(1600); // 32.000 * 0.05
    expect(res.raw.totalAllocationCost).toBe(33600);
    expect(res.raw.netDisbursedAmount).toBe(1966400); // 2.000.000 - 33.600
    expect(res.raw.isOverCeiling).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 10. TÜKETİCİ KREDİSİ (İHTİYAÇ) — %0,50 Tavan ve %15 BSMV
  // -------------------------------------------------------------------------
  it('calculates consumer personal loan (ihtiyaç) with %0.5 ceiling and %15 BSMV', () => {
    const res = calculateLoanFee(100000, {
      loanAmount: 100000,
      loanType: 'ihtiyac',
      feeRate: 0.50,
      includeBsmv: true,
      insuranceFee: 1200,
      deductionMode: 'deduct_all',
    });

    expect(res.raw.allocationFee).toBe(500); // 100.000 * %0.5
    expect(res.raw.bsmvRate).toBe(0.15); // %15 BSMV
    expect(res.raw.bsmvAmount).toBe(75); // 500 * 0.15
    expect(res.raw.totalAllocationCost).toBe(575);
    expect(res.raw.insuranceFee).toBe(1200);
    expect(res.raw.totalCost).toBe(1775); // 575 + 1200
    expect(res.raw.netDisbursedAmount).toBe(98225); // 100.000 - 1775
    expect(res.raw.isOverCeiling).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 11. KONUT KREDİSİ — İLK EVİM %0 BSMV İSTİSNASI (7491 SK m. 6)
  // -------------------------------------------------------------------------
  it('calculates mortgage loan with %0 BSMV for first-time home buyers (7491 SK)', () => {
    const res = calculateLoanFee(2000000, {
      loanAmount: 2000000,
      loanType: 'konut',
      hasExistingHome: false, // İlk evim
      feeRate: 0.50,
      valuationFee: 15000,
      mortgageFee: 4500,
      deductionMode: 'deduct_all',
    });

    expect(res.raw.hasExistingHome).toBe(false);
    expect(res.raw.isBsmvExempt).toBe(true);
    expect(res.raw.bsmvRate).toBe(0.00); // %0 BSMV
    expect(res.raw.bsmvAmount).toBe(0);
    expect(res.raw.allocationFee).toBe(10000); // 2M * %0.5
    expect(res.raw.totalAllocationCost).toBe(10000);
    expect(res.raw.totalOtherExpenses).toBe(19500); // 15.000 + 4.500
    expect(res.raw.totalCost).toBe(29500);
    expect(res.raw.netDisbursedAmount).toBe(1970500);
  });

  // -------------------------------------------------------------------------
  // 12. KONUT KREDİSİ — KAYITLI KONUT VAR (%15 BSMV, 7491 SK)
  // -------------------------------------------------------------------------
  it('calculates mortgage loan with %15 BSMV when consumer has existing home (7491 SK)', () => {
    const res = calculateLoanFee(2000000, {
      loanAmount: 2000000,
      loanType: 'konut',
      hasExistingHome: true, // Üzerine kayıtlı konut var
      feeRate: 0.50,
      valuationFee: 15000,
      mortgageFee: 4500,
      deductionMode: 'deduct_all',
    });

    expect(res.raw.hasExistingHome).toBe(true);
    expect(res.raw.isBsmvExempt).toBe(false);
    expect(res.raw.bsmvRate).toBe(0.15); // %15 BSMV
    expect(res.raw.allocationFee).toBe(10000);
    expect(res.raw.bsmvAmount).toBe(1500); // 10.000 * 0.15
    expect(res.raw.totalAllocationCost).toBe(11500);
    expect(res.raw.totalCost).toBe(31000); // 11.500 + 19.500
    expect(res.raw.netDisbursedAmount).toBe(1969000);
  });

  // -------------------------------------------------------------------------
  // 13. TÜKETİCİ KREDİSİ TAVAN AŞIMI TESPİTİ (%0,75 > %0,50)
  // -------------------------------------------------------------------------
  it('detects ceiling breach when consumer fee rate exceeds %0.50', () => {
    const res = calculateLoanFee(100000, {
      loanAmount: 100000,
      loanType: 'ihtiyac',
      feeRate: 0.75, // Yasal tavan %0,50'den yüksek
    });

    expect(res.raw.allocationFee).toBe(750);
    expect(res.raw.legalCeilingAmount).toBe(500);
    expect(res.raw.isOverCeiling).toBe(true);
    expect(res.raw.excessAmount).toBe(250); // 750 - 500
  });

  // -------------------------------------------------------------------------
  // 14. 3 KESİNTİ MODU TESTİ (Tümü Kesilsin / Banka Masrafı Kesilsin / Tümü Ayrıca Ödensin)
  // -------------------------------------------------------------------------
  it('supports all 3 deduction modes accurately', () => {
    const common = {
      loanAmount: 100000,
      loanType: 'ihtiyac' as const,
      feeRate: 0.50, // 500 TL + 75 TL BSMV = 575 TL Banka
      insuranceFee: 1000, // 1000 TL 3. Kişi
    };

    // Mod 1: deduct_all
    const m1 = calculateLoanFee(100000, { ...common, deductionMode: 'deduct_all' });
    expect(m1.raw.totalCost).toBe(1575);
    expect(m1.raw.deductedFromLoan).toBe(1575);
    expect(m1.raw.paidSeparately).toBe(0);
    expect(m1.raw.netDisbursedAmount).toBe(98425); // 100.000 - 1575

    // Mod 2: deduct_bank_fee_only
    const m2 = calculateLoanFee(100000, { ...common, deductionMode: 'deduct_bank_fee_only' });
    expect(m2.raw.deductedFromLoan).toBe(575);
    expect(m2.raw.paidSeparately).toBe(1000);
    expect(m2.raw.netDisbursedAmount).toBe(99425); // 100.000 - 575

    // Mod 3: pay_separately
    const m3 = calculateLoanFee(100000, { ...common, deductionMode: 'pay_separately' });
    expect(m3.raw.deductedFromLoan).toBe(0);
    expect(m3.raw.paidSeparately).toBe(1575);
    expect(m3.raw.netDisbursedAmount).toBe(100000); // 100.000 tam finansman
  });

  // -------------------------------------------------------------------------
  // 15. SABİT TUTAR VE LEGACY OVERLOAD
  // -------------------------------------------------------------------------
  it('supports fixed custom fee amount and legacy number overload', () => {
    const resFixed = calculateLoanFee(100000, {
      loanAmount: 100000,
      loanType: 'ihtiyac',
      customFeeAmount: 400,
    });
    expect(resFixed.raw.allocationFee).toBe(400);
    expect(resFixed.raw.bsmvAmount).toBe(60); // 400 * 0.15

    const resLegacy = calculateLoanFee(100000, 0.40);
    expect(resLegacy.raw.allocationFee).toBe(400);
    expect(resLegacy.raw.bsmvAmount).toBe(60);
  });
});