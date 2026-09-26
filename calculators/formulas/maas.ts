export interface MaasInputs {
  grossSalary: number;
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
}

export interface MaasResult {
  months: MaasMonthResult[];
  annualGross: number;
  annualNet: number;
  annualTaxesAndPremiums: number;
  monthlyEmployerCost: number;
  annualEmployerCost: number;
}

const CONSTANTS_2026 = {
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

const TAX_BRACKETS_2026 = [
  { limit: 190000, rate: 0.15 },
  { limit: 400000, rate: 0.20 },
  { limit: 1500000, rate: 0.27 },
  { limit: 5300000, rate: 0.35 },
  { limit: Infinity, rate: 0.40 }
];

function round2(num: number): number {
  return Math.round(num * 100) / 100;
}

function calculateIncomeTax(cumulativeBase: number): number {
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

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export function calculateMaas(inputs: MaasInputs): MaasResult {
  const { grossSalary, employerDiscountType } = inputs;

  let cumulativeTaxBase = 0;
  let previousTotalTax = 0;
  let previousMinimumTax = 0;

  let annualGross = 0;
  let annualNet = 0;
  let annualTaxesAndPremiums = 0;
  
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
  
  const months: MaasMonthResult[] = [];

  for (let month = 1; month <= 12; month++) {
    cumulativeTaxBase += monthlyTaxBase;
    
    const currentTotalTax = calculateIncomeTax(cumulativeTaxBase);
    const monthlyGrossIncomeTax = currentTotalTax - previousTotalTax;
    
    const minimumWageCumulativeBase = CONSTANTS_2026.MIN_WAGE_TAX_BASE * month;
    const currentMinimumTax = calculateIncomeTax(minimumWageCumulativeBase);
    const minimumWageTaxExemption = currentMinimumTax - previousMinimumTax;
    
    const payableIncomeTax = Math.max(0, monthlyGrossIncomeTax - minimumWageTaxExemption);
    
    const netSalary = grossSalary - sgkEmployee - unemploymentEmployee - payableIncomeTax - stampTax;
    
    months.push({
      month,
      monthName: MONTH_NAMES[month - 1],
      grossSalary,
      sgkEmployee,
      unemploymentEmployee,
      incomeTax: payableIncomeTax,
      stampTax,
      netSalary,
      cumulativeTaxBase
    });

    annualGross += grossSalary;
    annualNet += netSalary;
    annualTaxesAndPremiums += (sgkEmployee + unemploymentEmployee + payableIncomeTax + stampTax);

    previousTotalTax = currentTotalTax;
    previousMinimumTax = currentMinimumTax;
  }

  return {
    months,
    annualGross,
    annualNet,
    annualTaxesAndPremiums,
    monthlyEmployerCost,
    annualEmployerCost: monthlyEmployerCost * 12
  };
}
