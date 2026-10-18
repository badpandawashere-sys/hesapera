export type MaasCalculationMode = 'grossToNet' | 'netToGross';

export interface MaasInputs {
  calculationMode?: MaasCalculationMode;
  grossSalary?: number;
  netSalary?: number;
  employerDiscountType: 'none' | 'other' | 'manufacturing';
}

export interface MaasMonthResult {
  month: number;
  monthName: string;
  grossSalary: number;
  sgkEmployee: number;
  unemploymentEmployee: number;
  incomeTax: number;
  stampTax: number;
  netSalary: number;
  cumulativeTaxBase: number;
  monthlyEmployerCost: number;
}

export interface MaasResult {
  calculationMode: MaasCalculationMode;
  months: MaasMonthResult[];
  annualGross: number;
  annualNet: number;
  annualTaxesAndPremiums: number;
  monthlyEmployerCost: number;
  annualEmployerCost: number;
  averageMonthlyGross: number;
  averageMonthlyNet: number;
  averageMonthlyEmployerCost: number;
}

export const CONSTANTS_2026 = {
  MIN_GROSS: 33030.00,
  MIN_WAGE_TAX_BASE: 28075.50,
  SGK_EMPLOYEE_RATE: 0.14,
  UNEMPLOYMENT_EMPLOYEE_RATE: 0.01,
  SGK_CEILING: 297270.00,
  STAMP_TAX_RATE: 0.00759,
  EMPLOYER_UNEMPLOYMENT_RATE: 0.02,
  EMPLOYER_SGK_RATES: {
    none: 0.2175,
    other: 0.1975,
    manufacturing: 0.1675
  }
};

export const TAX_BRACKETS_2026 = [
  { limit: 190000, rate: 0.15 },
  { limit: 400000, rate: 0.20 },
  { limit: 1500000, rate: 0.27 },
  { limit: 5300000, rate: 0.35 },
  { limit: Infinity, rate: 0.40 }
];

export function round2(num: number): number {
  return Math.round(num * 100) / 100;
}

export function calculateIncomeTax(cumulativeBase: number): number {
  let tax = 0;
  let remaining = cumulativeBase;
  let previousLimit = 0;

  for (const bracket of TAX_BRACKETS_2026) {
    const bracketSize = bracket.limit - previousLimit;
    if (remaining > bracketSize) {
      tax = round2(tax + round2(bracketSize * bracket.rate));
      remaining -= bracketSize;
      previousLimit = bracket.limit;
    } else {
      tax = round2(tax + round2(remaining * bracket.rate));
      break;
    }
  }
  return tax;
}

export const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export interface InternalMonthState {
  monthResult: MaasMonthResult;
  currentTotalTax: number;
  currentMinimumTax: number;
}

/**
 * Calculates single-month payroll values.
 * Uses exact arithmetic expressions identical to the original grossToNet engine,
 * guaranteeing zero kuruş deviation and bitwise parity.
 */
export function calculateMonthForward(
  grossSalary: number,
  month: number,
  prevCumulativeTaxBase: number,
  prevTotalTax: number,
  prevMinimumTax: number,
  employerDiscountType: 'none' | 'other' | 'manufacturing' = 'none'
): InternalMonthState {
  const primeBase = Math.min(grossSalary, CONSTANTS_2026.SGK_CEILING);
  const sgkEmployee = round2(primeBase * CONSTANTS_2026.SGK_EMPLOYEE_RATE);
  const unemploymentEmployee = round2(primeBase * CONSTANTS_2026.UNEMPLOYMENT_EMPLOYEE_RATE);

  const monthlyTaxBase = grossSalary - sgkEmployee - unemploymentEmployee;

  const stampTaxBase = Math.max(0, grossSalary - CONSTANTS_2026.MIN_GROSS);
  const stampTax = round2(stampTaxBase * CONSTANTS_2026.STAMP_TAX_RATE);

  const employerSgkRate = CONSTANTS_2026.EMPLOYER_SGK_RATES[employerDiscountType] || CONSTANTS_2026.EMPLOYER_SGK_RATES.none;
  const employerSgk = round2(primeBase * employerSgkRate);
  const employerUnemployment = round2(primeBase * CONSTANTS_2026.EMPLOYER_UNEMPLOYMENT_RATE);
  const monthlyEmployerCost = grossSalary + employerSgk + employerUnemployment;

  const cumulativeTaxBase = prevCumulativeTaxBase + monthlyTaxBase;

  const currentTotalTax = calculateIncomeTax(cumulativeTaxBase);
  const monthlyGrossIncomeTax = currentTotalTax - prevTotalTax;

  const minimumWageCumulativeBase = CONSTANTS_2026.MIN_WAGE_TAX_BASE * month;
  const currentMinimumTax = calculateIncomeTax(minimumWageCumulativeBase);
  const minimumWageTaxExemption = currentMinimumTax - prevMinimumTax;

  const payableIncomeTax = Math.max(0, monthlyGrossIncomeTax - minimumWageTaxExemption);

  const netSalary = grossSalary - sgkEmployee - unemploymentEmployee - payableIncomeTax - stampTax;

  return {
    monthResult: {
      month,
      monthName: MONTH_NAMES[month - 1],
      grossSalary,
      sgkEmployee,
      unemploymentEmployee,
      incomeTax: payableIncomeTax,
      stampTax,
      netSalary,
      cumulativeTaxBase,
      monthlyEmployerCost
    },
    currentTotalTax,
    currentMinimumTax
  };
}

/**
 * Numerically solves gross salary from target net salary for a specific month
 * using monotonic binary search with kuruş neighborhood evaluation.
 * Guarantees that resulting net is within 0.01 TL of target net.
 */
export function solveGrossFromNetForMonth(
  targetNet: number,
  month: number,
  prevCumulativeTaxBase: number,
  prevTotalTax: number,
  prevMinimumTax: number,
  employerDiscountType: 'none' | 'other' | 'manufacturing' = 'none'
): number {
  if (!Number.isFinite(targetNet) || targetNet <= CONSTANTS_2026.MIN_WAGE_TAX_BASE) {
    return CONSTANTS_2026.MIN_GROSS;
  }

  let low = targetNet;
  let high = Math.max(targetNet * 3.5, 3000000);

  // 42 binary search iterations reduce search interval to < 0.0001 TL
  for (let i = 0; i < 42; i++) {
    const mid = (low + high) / 2;
    const { monthResult } = calculateMonthForward(mid, month, prevCumulativeTaxBase, prevTotalTax, prevMinimumTax, employerDiscountType);
    if (monthResult.netSalary < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const baseGross = round2(low);
  let bestGross = baseGross;
  let minDiff = Infinity;

  // Search ±5 cents neighborhood to lock the exact 2-decimal kuruş that yields closest net
  for (let delta = -5; delta <= 5; delta++) {
    const candidate = round2(baseGross + delta * 0.01);
    if (candidate < CONSTANTS_2026.MIN_GROSS) continue;
    const { monthResult } = calculateMonthForward(candidate, month, prevCumulativeTaxBase, prevTotalTax, prevMinimumTax, employerDiscountType);
    const diff = Math.abs(monthResult.netSalary - targetNet);
    if (diff < minDiff) {
      minDiff = diff;
      bestGross = candidate;
    }
  }

  return bestGross;
}

export function calculateMaas(inputs: MaasInputs): MaasResult {
  const calculationMode = inputs.calculationMode || 'grossToNet';
  const employerDiscountType = inputs.employerDiscountType || 'none';

  let cumulativeTaxBase = 0;
  let previousTotalTax = 0;
  let previousMinimumTax = 0;

  let annualGross = 0;
  let annualNet = 0;
  let annualTaxesAndPremiums = 0;
  let annualEmployerCost = 0;

  const months: MaasMonthResult[] = [];

  if (calculationMode === 'netToGross') {
    const rawNet = inputs.netSalary;
    const targetNet = (rawNet !== undefined && rawNet !== null && Number.isFinite(rawNet) && rawNet > 0)
      ? rawNet
      : CONSTANTS_2026.MIN_WAGE_TAX_BASE;

    for (let month = 1; month <= 12; month++) {
      const grossForMonth = solveGrossFromNetForMonth(
        targetNet,
        month,
        cumulativeTaxBase,
        previousTotalTax,
        previousMinimumTax,
        employerDiscountType
      );

      const state = calculateMonthForward(
        grossForMonth,
        month,
        cumulativeTaxBase,
        previousTotalTax,
        previousMinimumTax,
        employerDiscountType
      );

      months.push(state.monthResult);

      annualGross += state.monthResult.grossSalary;
      annualNet += state.monthResult.netSalary;
      annualTaxesAndPremiums += (
        state.monthResult.sgkEmployee +
        state.monthResult.unemploymentEmployee +
        state.monthResult.incomeTax +
        state.monthResult.stampTax
      );
      annualEmployerCost += state.monthResult.monthlyEmployerCost;

      cumulativeTaxBase = state.monthResult.cumulativeTaxBase;
      previousTotalTax = state.currentTotalTax;
      previousMinimumTax = state.currentMinimumTax;
    }
  } else {
    // Standard grossToNet mode: fixed monthly gross
    const rawGross = inputs.grossSalary;
    const grossSalary = (rawGross !== undefined && rawGross !== null && Number.isFinite(rawGross) && rawGross > 0)
      ? rawGross
      : CONSTANTS_2026.MIN_GROSS;

    for (let month = 1; month <= 12; month++) {
      const state = calculateMonthForward(
        grossSalary,
        month,
        cumulativeTaxBase,
        previousTotalTax,
        previousMinimumTax,
        employerDiscountType
      );

      months.push(state.monthResult);

      annualGross += grossSalary;
      annualNet += state.monthResult.netSalary;
      annualTaxesAndPremiums += (
        state.monthResult.sgkEmployee +
        state.monthResult.unemploymentEmployee +
        state.monthResult.incomeTax +
        state.monthResult.stampTax
      );
      annualEmployerCost += state.monthResult.monthlyEmployerCost;

      cumulativeTaxBase = state.monthResult.cumulativeTaxBase;
      previousTotalTax = state.currentTotalTax;
      previousMinimumTax = state.currentMinimumTax;
    }
  }

  const monthlyEmployerCost = months[0]?.monthlyEmployerCost || 0;
  const averageMonthlyGross = round2(annualGross / 12);
  const averageMonthlyNet = round2(annualNet / 12);
  const averageMonthlyEmployerCost = round2(annualEmployerCost / 12);

  return {
    calculationMode,
    months,
    annualGross,
    annualNet,
    annualTaxesAndPremiums,
    monthlyEmployerCost,
    annualEmployerCost,
    averageMonthlyGross,
    averageMonthlyNet,
    averageMonthlyEmployerCost
  };
}
