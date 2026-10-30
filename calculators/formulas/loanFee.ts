export type LoanType = 'ihtiyac' | 'konut' | 'tasit' | 'ticari';

export type CommercialLoanKind =
  | 'taksitli_tl' // Standart / Taksitli / Spot TL Nakdi Krediler
  | 'rotatif_tl' // Rotatif (Borçlu Cari Hesap / BCH) TL Krediler
  | 'doviz'; // TL Dışı / Yabancı Para (Döviz) Nakdi Krediler

export type ExpenseDeductionMode =
  | 'deduct_all' // Tüm masraflar kredi tutarından kesilsin
  | 'deduct_bank_fee_only' // Yalnızca banka masrafları krediden kesilsin, 3. taraf masraflar ayrıca ödensin
  | 'pay_separately'; // Tüm masraflar ayrıca (peşin/hesaptan) ödensin

export interface LoanFeeInput {
  loanAmount: number; // Kullandırılan kredi tutarı
  loanType?: LoanType;

  // 1. Konut Kredisi 7491 Sayılı Kanun m. 6 (6802 SK m. 29/i & m. 29/y):
  // Kredi kullanım tarihinde tüketicinin üzerine kayıtlı konut veya hissesi var mı?
  hasExistingHome?: boolean; // false = ilk ev (%0 BSMV); true = üzerine kayıtlı konut var (%15 BSMV)

  // 2. Tüketici Kredileri (İhtiyaç, Konut, Taşıt) — TCMB 2020/7 m. 10
  feeRate?: number; // e.g. 0.50 for 0.50% ceiling
  customFeeAmount?: number; // Sabit tahsis tutarı (TL)

  // 3. Ticari Krediler — TCMB 2020/4 Sayılı Tebliğ Madde 9 (2025/24 ve 2026/5 değişiklikleriyle güncel)
  commercialKind?: CommercialLoanKind; // 'taksitli_tl' | 'rotatif_tl' | 'doviz'
  commercialLimitAmount?: number; // Tahsis edilen kredi limiti matrahı (TL/Döviz). Girilmezse loanAmount alınır.
  commercialLimitMonths?: number; // Kredi limit tahsis süresi (Ay). Default: 12 ay. (Azami oran: yıllık %0,20 * ay / 12)
  
  termDays?: number; // Kredi kullandırım vadesi gün sayısı (Gün). Default: 360 gün (1 yıl).
  termMonths?: number; // Destek amaçlı: ay cinsinden girilirse gün karşılığı (termMonths * 30, TCMB esası)
  startDate?: string; // İsteğe bağlı: Kredi başlangıç tarihi (YYYY-MM-DD)
  endDate?: string; // İsteğe bağlı: Kredi bitiş tarihi (YYYY-MM-DD)
  rotatifAverageBalance?: number; // Rotatif kredilerde dönem ortalama kredi kullandırım bakiyesi

  // Ticari Limit Tahsis Ücreti (Matrah: commercialLimitAmount, Yıllık Tavan: %0,20 * (commercialLimitMonths / 12))
  commercialLimitFeeRate?: number;
  customLimitFeeAmount?: number;

  // Ticari Kullandırım Ücreti (Matrah: loanAmount veya rotatifAverageBalance)
  // TL nakdi kredilerde 360 gün ve üzeri tavanı: %1,10. 1 yıldan kısa vadede: (termDays / 360) * 1,10% (TCMB 360 gün ticari yıl esası)
  // Döviz kredilerinde serbesttir.
  commercialUsageFeeRate?: number;
  customUsageFeeAmount?: number;

  // 4. Vergi
  includeBsmv?: boolean;

  // 5. Üçüncü Kişi Belgelenmiş Masrafları
  valuationFee?: number; // Ekspertiz ücreti (TL)
  mortgageFee?: number; // İpotek / Rehin tesis ücreti (TL)
  insuranceFee?: number; // Hayat / Kasko / DASK sigortası (TL)
  otherExpenses?: number; // Diğer belgelenmiş masraflar (TL)

  // 6. Masraf Kesinti / Tahsilat Yöntemi
  deductionMode?: ExpenseDeductionMode;
}

export interface LoanFeeRawDetails {
  loanAmount: number;
  loanType: LoanType;
  feeRate: number;
  allocationFee: number;
  bsmvRate: number;
  bsmvAmount: number;
  totalAllocationCost: number;

  // Konut Detayları
  hasExistingHome: boolean;
  isBsmvExempt: boolean;

  // Ticari Detaylar (TCMB 2020/4 Madde 9)
  commercialKind?: CommercialLoanKind;
  commercialLimitAmount?: number;
  commercialLimitMonths?: number;
  termDays?: number;
  termMonths?: number;
  startDate?: string;
  endDate?: string;
  rotatifAverageBalance?: number;

  commercialLimitFeeRate?: number;
  commercialLimitFee?: number;
  maxLegalLimitFeeRate?: number;
  maxLegalLimitFeeAmount?: number;
  isLimitFeeOverCeiling?: boolean;
  limitFeeExcessAmount?: number;

  commercialUsageFeeRate?: number;
  commercialUsageFee?: number;
  maxLegalUsageFeeRate?: number;
  maxLegalUsageFeeAmount?: number;
  isUsageFeeOverCeiling?: boolean;
  usageFeeExcessAmount?: number;

  // 3. Kişi Masrafları
  valuationFee: number;
  mortgageFee: number;
  insuranceFee: number;
  otherExpenses: number;
  totalOtherExpenses: number;

  // Kesinti ve Net Tutar
  totalCost: number; // Toplam masraf (Tahsis + BSMV + 3. Taraf)
  deductionMode: ExpenseDeductionMode;
  deductedFromLoan: number; // Krediden kesilen masraf
  paidSeparately: number; // Ayrıca (peşin/hesaptan) ödenecek masraf
  netDisbursedAmount: number; // Kullanıcının eline geçen net tutar
  effectiveFeeRatio: number; // Toplam masrafın anaparaya oranı (%)

  // Yasal Tavan
  isOverCeiling: boolean;
  legalCeilingAmount: number;
  excessAmount: number;
}

export interface LoanFeeOutput {
  primaryLabel: string;
  primaryResult: string;
  secondaryResults: {
    'Kredi Tutarı': string;
    'Kredi Türü': string;
    'Banka Tahsis Ücreti': string;
    'Uygulanan BSMV': string;
    'Toplam Tahsis Masrafı': string;
    'Diğer Belgelenmiş Masraflar': string;
    'Toplam Masraf': string;
    'Krediden Kesilen Masraf': string;
    'Ayrıca Ödenecek Masraf': string;
    'Ele Geçen Net Tutar': string;
    'Efektif Masraf Oranı': string;
  };
  breakdown: Array<{ label: string; value: string }>;
  raw: LoanFeeRawDetails;
  infoReference?: {
    title: string;
    description: string;
  };
}

export const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;
export const round4 = (num: number) => Math.round((num + Number.EPSILON) * 10000) / 10000;

/**
 * İki takvim tarihi arasındaki gün farkını hesaplar.
 */
export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * TCMB 2020/4 Tebliği Madde 9 ve Uygulama Talimatı uyarınca:
 * Kredi Limit Tahsis Ücreti Tavanı:
 * Yıllık azami %0,20 olup tahsis edilen limit süresinin ay sayısı dikkate alınarak oransal uygulanır.
 * Oran Formülü: 0,20% * (commercialLimitMonths / 12)
 */
export function calculateCommercialLimitCeilingRate(commercialLimitMonths: number = 12): number {
  const months = Math.max(1, commercialLimitMonths);
  return round4((0.20 * months) / 12);
}

/**
 * TCMB 2020/4 Tebliği Madde 9 (2025/24 ve 2026/5 değişiklikleriyle güncel) ve Uygulama Talimatı:
 * Nakdi Kredilerde Kredi Kullandırım Ücreti Tavanı:
 * - Bir yıldan kısa vadeli nakdi kredi kullandırımlarında azami ücret, vade gün sayısı dikkate alınarak
 *   oransal olarak düşürülür (TCMB 360 gün ticari yıl esası: Vade Gün Sayısı / 360).
 * - 360 gün ve üzeri (tam 1 yıl ve daha uzun) vadelerde azami tavan %1,10'dur.
 * - Döviz cinsi nakdi kredilerde serbesttir (null döner).
 */
export function calculateCommercialUsageCeilingRate(
  kind: CommercialLoanKind,
  termDays?: number,
  termMonths?: number
): number | null {
  if (kind === 'doviz') return null; // Serbest piyasa

  let days = termDays;
  if (days === undefined || days <= 0) {
    if (termMonths !== undefined && termMonths > 0) {
      days = termMonths * 30; // 30 gün / ay TCMB esası
    } else {
      days = 360; // 12 ay varsayılan
    }
  }

  if (days < 360) {
    return round4((1.10 * days) / 360);
  }
  return 1.10;
}

export function calculateLoanFee(
  loanAmount: number,
  feeRateOrInput: number | LoanFeeInput = 0.5,
  legacyRate?: number
): LoanFeeOutput {
  // Geriye dönük uyumluluk: calculateLoanFee(amount, rate)
  const input: LoanFeeInput =
    typeof feeRateOrInput === 'number'
      ? { loanAmount, feeRate: feeRateOrInput }
      : { ...feeRateOrInput, loanAmount };

  const amount = Math.max(0, input.loanAmount || 0);
  const type: LoanType = input.loanType || 'ihtiyac';
  const includeBsmv = input.includeBsmv !== false;
  const hasExistingHome = !!input.hasExistingHome;
  const deductionMode: ExpenseDeductionMode = input.deductionMode || 'deduct_all';

  let allocationFee = 0;
  let feeRate = 0;
  let bsmvRate = 0;
  let isOverCeiling = false;
  let legalCeilingAmount = 0;
  let excessAmount = 0;

  // Ticari Kredi Değişkenleri
  let commercialKind: CommercialLoanKind = input.commercialKind || 'taksitli_tl';
  let limitAmount = amount;
  let commercialLimitMonths = input.commercialLimitMonths !== undefined ? Math.max(1, input.commercialLimitMonths) : 12;
  
  // Gün hesabı çözümü (Tarih -> Gün -> Ay -> 360 gün)
  let resolvedDays = 360;
  if (input.startDate && input.endDate) {
    const days = calculateDaysBetween(input.startDate, input.endDate);
    resolvedDays = days > 0 ? days : 360;
  } else if (input.termDays !== undefined && input.termDays > 0) {
    resolvedDays = input.termDays;
  } else if (input.termMonths !== undefined && input.termMonths > 0) {
    resolvedDays = input.termMonths * 30;
  }
  let termMonths = Math.max(1, Math.round(resolvedDays / 30));
  let rotatifAvgBal = amount;

  let commercialLimitFee = 0;
  let commercialLimitFeeRate = 0.20;
  let maxLegalLimitFeeRate = 0.20;
  let maxLegalLimitFeeAmount = 0;
  let isLimitFeeOverCeiling = false;
  let limitFeeExcessAmount = 0;

  let commercialUsageFee = 0;
  let commercialUsageFeeRate = 1.10;
  let maxLegalUsageFeeRate = 1.10;
  let maxLegalUsageFeeAmount = 0;
  let isUsageFeeOverCeiling = false;
  let usageFeeExcessAmount = 0;

  // =========================================================================
  // 1. BANKA KOMİSYON / TAHSİS & KULLANDIRIM HESAPLAMALARI
  // =========================================================================
  if (type === 'ticari') {
    commercialKind = input.commercialKind || 'taksitli_tl';
    limitAmount =
      input.commercialLimitAmount !== undefined && input.commercialLimitAmount > 0
        ? input.commercialLimitAmount
        : amount;

    // -----------------------------------------------------------------------
    // A) KREDİ LİMİT TAHSİS ÜCRETİ (TCMB 2020/4 Madde 9)
    // Matrah: Tahsis Edilen Kredi Limiti (commercialLimitAmount)
    // Süre: Tahsis edilen limit süresinin ay sayısı (commercialLimitMonths)
    // Yıllık Azami Tavan: %0,20 * (commercialLimitMonths / 12)
    // -----------------------------------------------------------------------
    maxLegalLimitFeeRate = calculateCommercialLimitCeilingRate(commercialLimitMonths);
    maxLegalLimitFeeAmount = round2(limitAmount * (maxLegalLimitFeeRate / 100));

    commercialLimitFeeRate =
      input.commercialLimitFeeRate !== undefined
        ? Math.max(0, input.commercialLimitFeeRate)
        : maxLegalLimitFeeRate;

    if (input.customLimitFeeAmount && input.customLimitFeeAmount > 0) {
      commercialLimitFee = round2(input.customLimitFeeAmount);
      commercialLimitFeeRate = limitAmount > 0 ? round4((commercialLimitFee / limitAmount) * 100) : 0;
    } else {
      commercialLimitFee = round2(limitAmount * (commercialLimitFeeRate / 100));
    }

    isLimitFeeOverCeiling = commercialLimitFee > maxLegalLimitFeeAmount + 0.01;
    limitFeeExcessAmount = isLimitFeeOverCeiling
      ? round2(Math.max(0, commercialLimitFee - maxLegalLimitFeeAmount))
      : 0;

    // -----------------------------------------------------------------------
    // B) KREDİ KULLANDIRIM ÜCRETİ (TCMB 2020/4 Madde 9)
    // Matrah: Fiilen kullandırılan tutar (amount) veya rotatif kredilerde dönem ortalama bakiyesi.
    // Süre: Kredi vadesi gün sayısı (resolvedDays).
    // Tavan: 1 yıldan (<360 gün) kısa vadeli nakdi TL kredilerde (1,10% * resolvedDays / 360).
    //        360 gün ve üzerinde azami %1,10.
    //        Döviz kredilerinde serbesttir.
    // -----------------------------------------------------------------------
    const calculatedCeilingRate = calculateCommercialUsageCeilingRate(commercialKind, resolvedDays);

    if (commercialKind === 'doviz') {
      // TÜRK LİRASI DIŞINDAKİ (DÖVİZ) NAKDİ KREDİLER:
      // TCMB 2020/4 Tebliği Madde 9 ve Uygulama Talimatı uyarınca kredi kullandırım ücreti serbesttir.
      maxLegalUsageFeeRate = 0;
      maxLegalUsageFeeAmount = 0;
      isUsageFeeOverCeiling = false;
      usageFeeExcessAmount = 0;

      commercialUsageFeeRate =
        input.commercialUsageFeeRate !== undefined ? Math.max(0, input.commercialUsageFeeRate) : 1.00;

      if (input.customUsageFeeAmount && input.customUsageFeeAmount > 0) {
        commercialUsageFee = round2(input.customUsageFeeAmount);
      } else {
        commercialUsageFee = round2(amount * (commercialUsageFeeRate / 100));
      }
    } else if (commercialKind === 'rotatif_tl') {
      // ROTATİF (BORÇLU CARİ HESAP / BCH) TL KREDİLER:
      // Matrah: İlgili dönemin ortalama kredi kullandırım bakiyesi. Dönem sonunda tahakkuk eder.
      rotatifAvgBal =
        input.rotatifAverageBalance !== undefined && input.rotatifAverageBalance > 0
          ? input.rotatifAverageBalance
          : amount;

      maxLegalUsageFeeRate = calculatedCeilingRate ?? 1.10;
      maxLegalUsageFeeAmount = round2(rotatifAvgBal * (maxLegalUsageFeeRate / 100));

      commercialUsageFeeRate =
        input.commercialUsageFeeRate !== undefined
          ? Math.max(0, input.commercialUsageFeeRate)
          : maxLegalUsageFeeRate;

      if (input.customUsageFeeAmount && input.customUsageFeeAmount > 0) {
        commercialUsageFee = round2(input.customUsageFeeAmount);
      } else {
        commercialUsageFee = round2(rotatifAvgBal * (commercialUsageFeeRate / 100));
      }

      isUsageFeeOverCeiling = commercialUsageFee > maxLegalUsageFeeAmount + 0.01;
      usageFeeExcessAmount = isUsageFeeOverCeiling
        ? round2(Math.max(0, commercialUsageFee - maxLegalUsageFeeAmount))
        : 0;
    } else {
      // STANDART / TAKSİTLİ / SPOT TL NAKDİ KREDİLER:
      // Matrah: Fiilen kullandırılan kredi tutarı (amount).
      // Vade gün sayısı dikkate alınarak oransal düşürülür (TCMB 360 gün ticari yıl esası: gün / 360).
      maxLegalUsageFeeRate = calculatedCeilingRate ?? 1.10;
      maxLegalUsageFeeAmount = round2(amount * (maxLegalUsageFeeRate / 100));

      commercialUsageFeeRate =
        input.commercialUsageFeeRate !== undefined
          ? Math.max(0, input.commercialUsageFeeRate)
          : maxLegalUsageFeeRate;

      if (input.customUsageFeeAmount && input.customUsageFeeAmount > 0) {
        commercialUsageFee = round2(input.customUsageFeeAmount);
      } else {
        commercialUsageFee = round2(amount * (commercialUsageFeeRate / 100));
      }

      isUsageFeeOverCeiling = commercialUsageFee > maxLegalUsageFeeAmount + 0.01;
      usageFeeExcessAmount = isUsageFeeOverCeiling
        ? round2(Math.max(0, commercialUsageFee - maxLegalUsageFeeAmount))
        : 0;
    }

    // Toplam Banka Komisyonu
    allocationFee = round2(commercialLimitFee + commercialUsageFee);
    feeRate = amount > 0 ? round4((allocationFee / amount) * 100) : 0;
    legalCeilingAmount = round2(maxLegalLimitFeeAmount + maxLegalUsageFeeAmount);
    isOverCeiling = isLimitFeeOverCeiling || isUsageFeeOverCeiling;
    excessAmount = round2(limitFeeExcessAmount + usageFeeExcessAmount);

    // Ticari kredilerde BSMV oranı standart %5'tir (6802 SK m. 33).
    bsmvRate = 0.05;
  } else {
    // -----------------------------------------------------------------------
    // TÜKETİCİ KREDİLERİ (İHTİYAÇ, KONUT, TAŞIT) — TCMB 2020/7 MADDE 10
    // Azami kredi tahsis ücreti anaparanın binde beşini (%0,50) geçemez.
    // -----------------------------------------------------------------------
    feeRate = input.feeRate !== undefined ? Math.max(0, input.feeRate) : 0.50;

    if (input.customFeeAmount && input.customFeeAmount > 0) {
      allocationFee = round2(input.customFeeAmount);
      feeRate = amount > 0 ? round2((allocationFee / amount) * 100) : 0;
    } else {
      allocationFee = round2(amount * (feeRate / 100));
    }

    legalCeilingAmount = round2(amount * 0.005);
    isOverCeiling = allocationFee > legalCeilingAmount + 0.01;
    excessAmount = isOverCeiling ? round2(Math.max(0, allocationFee - legalCeilingAmount)) : 0;

    // BSMV ORANI (28.12.2023 Tarihli 7491 Sayılı Kanun m. 6):
    if (type === 'konut') {
      if (hasExistingHome) {
        bsmvRate = 0.15; // Üzerine kayıtlı konut/hisse var -> İstisna dışı, %15 BSMV
      } else {
        bsmvRate = 0.00; // İlk evim -> %0 BSMV Muaf (6802 SK m. 29/i)
      }
    } else {
      bsmvRate = 0.15; // İhtiyaç ve Taşıt kredilerinde %15 BSMV
    }
  }

  // =========================================================================
  // 2. BSMV TUTARI & TOPLAM TAHSİS MALİYETİ
  // =========================================================================
  const bsmvAmount = includeBsmv ? round2(allocationFee * bsmvRate) : 0;
  const totalAllocationCost = round2(allocationFee + bsmvAmount);

  // =========================================================================
  // 3. ÜÇÜNCÜ KİŞİ BELGELENMİŞ GİDERLERİ
  // =========================================================================
  const valuationFee = Math.max(0, input.valuationFee || 0);
  const mortgageFee = Math.max(0, input.mortgageFee || 0);
  const insuranceFee = Math.max(0, input.insuranceFee || 0);
  const otherExpenses = Math.max(0, input.otherExpenses || 0);
  const totalOtherExpenses = valuationFee + mortgageFee + insuranceFee + otherExpenses;

  // =========================================================================
  // 4. TOPLAM MASRAF, KREDİDEN KESİLEN & NET ELE GEÇEN TUTAR
  // =========================================================================
  const totalCost = round2(totalAllocationCost + totalOtherExpenses);

  let deductedFromLoan = 0;
  let paidSeparately = 0;

  if (deductionMode === 'deduct_all') {
    deductedFromLoan = totalCost;
    paidSeparately = 0;
  } else if (deductionMode === 'deduct_bank_fee_only') {
    deductedFromLoan = totalAllocationCost;
    paidSeparately = totalOtherExpenses;
  } else {
    // pay_separately
    deductedFromLoan = 0;
    paidSeparately = totalCost;
  }

  const netDisbursedAmount = round2(Math.max(0, amount - deductedFromLoan));
  const effectiveFeeRatio = amount > 0 ? round2((totalCost / amount) * 100) : 0;

  // Biçimlendirme yardımcıları
  const fmtTRY = (val: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2,
    }).format(val);

  return {
    primaryLabel: 'Toplam Kredi Masrafı',
    primaryResult: fmtTRY(totalCost),
    secondaryResults: {
      'Kredi Tutarı': fmtTRY(amount),
      'Kredi Türü':
        type === 'ticari'
          ? `Ticari Kredi (${commercialKind === 'doviz' ? 'Döviz' : commercialKind === 'rotatif_tl' ? 'Rotatif TL' : 'Taksitli TL'})`
          : type === 'konut'
          ? `Konut Kredisi (${hasExistingHome ? 'Kayıtlı Konut Var' : 'İlk Evim'})`
          : type === 'tasit'
          ? 'Taşıt Kredisi'
          : 'İhtiyaç Kredisi',
      'Banka Tahsis Ücreti': fmtTRY(allocationFee),
      'Uygulanan BSMV': fmtTRY(bsmvAmount),
      'Toplam Tahsis Masrafı': fmtTRY(totalAllocationCost),
      'Diğer Belgelenmiş Masraflar': fmtTRY(totalOtherExpenses),
      'Toplam Masraf': fmtTRY(totalCost),
      'Krediden Kesilen Masraf': fmtTRY(deductedFromLoan),
      'Ayrıca Ödenecek Masraf': fmtTRY(paidSeparately),
      'Ele Geçen Net Tutar': fmtTRY(netDisbursedAmount),
      'Efektif Masraf Oranı': `%${effectiveFeeRatio.toFixed(2)}`,
    },
    breakdown: [
      { label: 'Kullandırılan Kredi Tutarı', value: fmtTRY(amount) },
      ...(type === 'ticari'
        ? [
            {
              label: `Kredi Limit Tahsis Ücreti (Limit: ${fmtTRY(limitAmount)}, Süre: ${commercialLimitMonths} Ay, %${commercialLimitFeeRate.toFixed(2)})`,
              value: fmtTRY(commercialLimitFee),
            },
            {
              label:
                commercialKind === 'doviz'
                  ? `Kredi Kullandırım Ücreti (Döviz Serbest, %${commercialUsageFeeRate.toFixed(2)})`
                  : commercialKind === 'rotatif_tl'
                  ? `Dönemsel Kullandırım Ücreti (Ort. Bakiye: ${fmtTRY(rotatifAvgBal)}, %${commercialUsageFeeRate.toFixed(2)})`
                  : `Kredi Kullandırım Ücreti (Vade: ${resolvedDays} Gün, %${commercialUsageFeeRate.toFixed(4)})`,
              value: fmtTRY(commercialUsageFee),
            },
          ]
        : [
            {
              label: `Banka Kredi Tahsis Ücreti (%${feeRate.toFixed(2)})`,
              value: fmtTRY(allocationFee),
            },
          ]),
      {
        label: `Banka ve Sigorta Muameleleri Vergisi (BSMV %${(bsmvRate * 100).toFixed(0)})`,
        value: fmtTRY(bsmvAmount),
      },
      ...(valuationFee > 0
        ? [{ label: 'SPK Lisanslı Gayrimenkul Ekspertiz Ücreti', value: fmtTRY(valuationFee) }]
        : []),
      ...(mortgageFee > 0
        ? [
            {
              label:
                type === 'tasit'
                  ? 'Araç Rehin Tesis Harcı (Noter/TNB)'
                  : 'Tapu İpotek Tesis Harcı / Masrafı',
              value: fmtTRY(mortgageFee),
            },
          ]
        : []),
      ...(insuranceFee > 0
        ? [{ label: 'Sigorta Primleri (DASK / Konut / Kasko / Hayat)', value: fmtTRY(insuranceFee) }]
        : []),
      ...(otherExpenses > 0
        ? [{ label: 'Diğer Belgelenmiş Harcamalar', value: fmtTRY(otherExpenses) }]
        : []),
      { label: 'TOPLAM TÜM MASRAFLAR', value: fmtTRY(totalCost) },
      { label: 'Krediden Peşin Kesilen Tutar', value: fmtTRY(deductedFromLoan) },
      { label: 'Ayrıca (Elden/Hesaptan) Ödenecek Tutar', value: fmtTRY(paidSeparately) },
      { label: 'Kullanıcının Eline Geçecek Net Finansman Tutarı', value: fmtTRY(netDisbursedAmount) },
    ],
    raw: {
      loanAmount: amount,
      loanType: type,
      feeRate,
      allocationFee,
      bsmvRate,
      bsmvAmount,
      totalAllocationCost,
      hasExistingHome,
      isBsmvExempt: type === 'konut' && !hasExistingHome,
      commercialKind: type === 'ticari' ? commercialKind : undefined,
      commercialLimitAmount: type === 'ticari' ? limitAmount : undefined,
      commercialLimitMonths: type === 'ticari' ? commercialLimitMonths : undefined,
      termDays: type === 'ticari' ? resolvedDays : undefined,
      termMonths: type === 'ticari' ? termMonths : undefined,
      startDate: type === 'ticari' ? input.startDate : undefined,
      endDate: type === 'ticari' ? input.endDate : undefined,
      rotatifAverageBalance: type === 'ticari' ? rotatifAvgBal : undefined,
      commercialLimitFeeRate: type === 'ticari' ? commercialLimitFeeRate : undefined,
      commercialLimitFee: type === 'ticari' ? commercialLimitFee : undefined,
      maxLegalLimitFeeRate: type === 'ticari' ? maxLegalLimitFeeRate : undefined,
      maxLegalLimitFeeAmount: type === 'ticari' ? maxLegalLimitFeeAmount : undefined,
      isLimitFeeOverCeiling: type === 'ticari' ? isLimitFeeOverCeiling : undefined,
      limitFeeExcessAmount: type === 'ticari' ? limitFeeExcessAmount : undefined,
      commercialUsageFeeRate: type === 'ticari' ? commercialUsageFeeRate : undefined,
      commercialUsageFee: type === 'ticari' ? commercialUsageFee : undefined,
      maxLegalUsageFeeRate: type === 'ticari' ? maxLegalUsageFeeRate : undefined,
      maxLegalUsageFeeAmount: type === 'ticari' ? maxLegalUsageFeeAmount : undefined,
      isUsageFeeOverCeiling: type === 'ticari' ? isUsageFeeOverCeiling : undefined,
      usageFeeExcessAmount: type === 'ticari' ? usageFeeExcessAmount : undefined,
      valuationFee,
      mortgageFee,
      insuranceFee,
      otherExpenses,
      totalOtherExpenses,
      totalCost,
      deductionMode,
      deductedFromLoan,
      paidSeparately,
      netDisbursedAmount,
      effectiveFeeRatio,
      isOverCeiling,
      legalCeilingAmount,
      excessAmount,
    },
    infoReference: {
      title:
        type === 'ticari'
          ? 'TCMB 2020/4 Sayılı Tebliğ Madde 9 Kapsamı (Ticari Krediler)'
          : 'TCMB 2020/7 Sayılı Tebliğ & 7491 Sayılı Kanun Kapsamı',
      description:
        type === 'ticari'
          ? commercialKind === 'doviz'
            ? 'TCMB 2020/4 Tebliği Madde 9 ve Uygulama Talimatı uyarınca döviz cinsi nakdi kredilerde kredi kullandırım ücreti serbest piyasa koşullarında belirlenir; kredi limit tahsis ücreti tavanı tahsis süresine orantılı yıllık azami %0,20 olup komisyonlar üzerinden %5 BSMV uygulanır.'
            : commercialKind === 'rotatif_tl'
            ? 'TCMB 2020/4 Tebliği Madde 9 uyarınca rotatif (BCH) kredilerde kredi kullandırım ücreti dönem ortalama kredi kullandırım bakiyesi üzerinden tahakkuk ettirilir; yıllık tavan oranı %1,10 olup dönem süresine göre oransal uygulanır. Kredi limit tahsis ücreti tavanı yıllık %0,20 olup %5 BSMV uygulanır.'
            : 'TCMB 2020/4 Tebliği Madde 9 (2025/24 ve 2026/5 değişiklikleriyle güncel) uyarınca ticari kredilerde iki ayrı ücret kalemi bulunur: (1) Kredi Limit Tahsis Ücreti, tahsis edilen limit üzerinden limit süresinin ay sayısı dikkate alınarak yıllık azami %0,20 oranında uygulanır. (2) Kredi Kullandırım Ücreti, fiilen kullandırılan kredi tutarı üzerinden 360 gün ve üzeri vadelerde azami %1,10 oranındadır; 1 yıldan (360 günden) kısa vadeli TL kredilerde ise TCMB 360 gün ticari yıl esasına göre vade gün sayısı ile orantılı olarak (Gün / 360) düşürülerek uygulanır. Ticari işlemlerde BSMV oranı %5’tir.'
          : 'TCMB 2020/7 Tebliği Madde 10 uyarınca tüketici kredilerinde tahsis ücreti anaparanın binde beşini (%0,50) geçemez. 28.12.2023 tarihli 7491 sayılı Kanun m. 6 uyarınca üzerine kayıtlı konutu bulunmayanların ilk konut kredilerinde BSMV %0 istisnadır; üzerine kayıtlı konut bulunanlarda %15 BSMV uygulanır.',
    },
  };
}