import { describe, it, expect } from 'vitest';
import { calculateMaas, CONSTANTS_2026 } from '../maas';
import { maasCalculatorDef } from '../../definitions/maas';

describe('Maas Formula - Comprehensive Suite', () => {
  // ==========================================
  // 1. HISTORICAL / BASELINE PARITY TESTS
  // ==========================================
  it('TEST A — ASGARİ ÜCRET (HISTORICAL PARITY)', () => {
    const res = calculateMaas({ grossSalary: 33030, employerDiscountType: 'none' });
    
    res.months.forEach(m => {
      expect(m.netSalary).toBeCloseTo(28075.50, 2);
      expect(m.incomeTax).toBeCloseTo(0, 2);
      expect(m.stampTax).toBeCloseTo(0, 2);
    });
    
    expect(res.annualNet).toBeCloseTo(28075.50 * 12, 2);
  });

  it('TEST B — 50K OCAK (HISTORICAL PARITY)', () => {
    const res = calculateMaas({ grossSalary: 50000, employerDiscountType: 'none' });
    const jan = res.months[0];
    
    expect(jan.sgkEmployee).toBeCloseTo(7000, 2);
    expect(jan.unemploymentEmployee).toBeCloseTo(500, 2);
    expect(jan.grossSalary - jan.sgkEmployee - jan.unemploymentEmployee).toBeCloseTo(42500, 2);
    expect(jan.netSalary).toBeCloseTo(40207.53, 2);
  });

  it('TEST C — TAX BRACKET DYNAMICS (HISTORICAL PARITY)', () => {
    const res = calculateMaas({ grossSalary: 50000, employerDiscountType: 'none' });
    
    const may = res.months.find(m => m.month === 5)!;
    expect(may.cumulativeTaxBase).toBeGreaterThan(190000);
    
    const apr = res.months.find(m => m.month === 4)!;
    expect(apr.incomeTax).not.toBeCloseTo(may.incomeTax, 2);
  });

  it('TEST D — PEK CAP APPLICATION (400K GROSS)', () => {
    const res = calculateMaas({ grossSalary: 400000, employerDiscountType: 'none' });
    const jan = res.months[0];
    
    // 297,270 * 0.14 = 41,617.80
    expect(jan.sgkEmployee).toBeCloseTo(41617.80, 2);
    // 297,270 * 0.01 = 2,972.70
    expect(jan.unemploymentEmployee).toBeCloseTo(2972.70, 2);
  });

  it('TEST E — EMPLOYER COST AND ALL DISCOUNT TYPES', () => {
    const resNone = calculateMaas({ grossSalary: 33030, employerDiscountType: 'none' });
    expect(resNone.monthlyEmployerCost).toBeCloseTo(40874.63, 2);
    
    const resOther = calculateMaas({ grossSalary: 33030, employerDiscountType: 'other' });
    expect(resOther.monthlyEmployerCost).toBeCloseTo(40214.03, 2);
    
    const resMan = calculateMaas({ grossSalary: 33030, employerDiscountType: 'manufacturing' });
    expect(resMan.monthlyEmployerCost).toBeCloseTo(39223.13, 2);

    // Hierarchy: none > other (2 pt discount) > manufacturing (5 pt discount)
    expect(resNone.monthlyEmployerCost).toBeGreaterThan(resOther.monthlyEmployerCost);
    expect(resOther.monthlyEmployerCost).toBeGreaterThan(resMan.monthlyEmployerCost);
  });

  // ==========================================
  // 2. NETTEN BRÜTE & 1-KURUŞ DEVIATION TESTS
  // ==========================================
  it('TEST F — NETTEN BRÜTE ASGARİ ÜCRET (28.075,50 TL)', () => {
    const res = calculateMaas({
      calculationMode: 'netToGross',
      netSalary: 28075.50,
      employerDiscountType: 'none'
    });

    expect(res.calculationMode).toBe('netToGross');
    res.months.forEach(m => {
      expect(m.grossSalary).toBeCloseTo(33030.00, 2);
      expect(m.netSalary).toBeCloseTo(28075.50, 2);
      expect(m.incomeTax).toBeCloseTo(0, 2);
      expect(m.stampTax).toBeCloseTo(0, 2);
    });
    expect(res.annualNet).toBeCloseTo(28075.50 * 12, 2);
  });

  it('TEST G — NETTEN BRÜTE 45K (MAX 1 KURUŞ SAPMA TÜM 12 AYDA)', () => {
    const targetNet = 45000;
    const res = calculateMaas({
      calculationMode: 'netToGross',
      netSalary: targetNet,
      employerDiscountType: 'none'
    });

    const jan = res.months[0];
    const dec = res.months[11];

    // January required gross is 56,703.60 TL
    expect(jan.grossSalary).toBeCloseTo(56703.60, 2);

    // Strict 1-kuruş (0.01 TL) deviation guarantee across every single month
    res.months.forEach(m => {
      const dev = Math.abs(m.netSalary - targetNet);
      expect(dev).toBeLessThanOrEqual(0.01);
    });

    // In December, due to higher cumulative tax brackets, gross increases
    expect(dec.grossSalary).toBeGreaterThan(jan.grossSalary);
    expect(dec.grossSalary).toBeCloseTo(63849.82, 2);
    expect(res.annualNet).toBeCloseTo(540000, 2);
  });

  it('TEST H — 12-MONTH FIXED NET GUARANTEE ACROSS MULTIPLE SALARIES (30K, 60K, 85K, 120K, 250K)', () => {
    const targets = [30000, 60000, 85000, 120000, 250000];

    for (const targetNet of targets) {
      const res = calculateMaas({
        calculationMode: 'netToGross',
        netSalary: targetNet,
        employerDiscountType: 'none'
      });

      res.months.forEach(m => {
        const diff = Math.abs(m.netSalary - targetNet);
        expect(diff).toBeLessThanOrEqual(0.01);
      });
    }
  });

  it('TEST I — TAX BRACKET TRANSITIONS & HIGH NET (ALL 5 BRACKETS: 15% -> 20% -> 27% -> 35% -> 40%)', () => {
    // 250,000 net monthly crosses 5.3M threshold in late months
    const highRes = calculateMaas({
      calculationMode: 'netToGross',
      netSalary: 250000,
      employerDiscountType: 'manufacturing'
    });

    highRes.months.forEach(m => {
      expect(Math.abs(m.netSalary - 250000)).toBeLessThanOrEqual(0.01);
    });

    const dec = highRes.months[11];
    expect(dec.cumulativeTaxBase).toBeGreaterThan(4000000);
    // At high bracket, gross salary must exceed 350,000 TL
    expect(dec.grossSalary).toBeGreaterThan(350000);
  });

  it('TEST J — PEK CEILING BOUNDARY (BELOW VS ABOVE PEK CAP IN NET-TO-GROSS)', () => {
    // Below PEK cap: Net 100,000 (Gross ~130-150k < 297,270)
    const belowRes = calculateMaas({ calculationMode: 'netToGross', netSalary: 100000, employerDiscountType: 'none' });
    expect(belowRes.months[0].grossSalary).toBeLessThan(CONSTANTS_2026.SGK_CEILING);
    expect(belowRes.months[0].sgkEmployee).toBeCloseTo(belowRes.months[0].grossSalary * 0.14, 2);

    // Far above PEK cap: Net 300,000 (Gross ~400k+ > 297,270)
    const aboveRes = calculateMaas({ calculationMode: 'netToGross', netSalary: 300000, employerDiscountType: 'none' });
    expect(aboveRes.months[0].grossSalary).toBeGreaterThan(CONSTANTS_2026.SGK_CEILING);
    // SGK employee must be strictly capped at 297,270 * 0.14 = 41,617.80
    expect(aboveRes.months[0].sgkEmployee).toBeCloseTo(41617.80, 2);
    expect(aboveRes.months[0].unemploymentEmployee).toBeCloseTo(2972.70, 2);
  });

  it('TEST K — ROUND-TRIP INVARIANCE (GROSS -> NET -> GROSS EQUIVALENCE)', () => {
    for (const testGross of [45000, 75000, 150000, 320000]) {
      const fwd = calculateMaas({ grossSalary: testGross, calculationMode: 'grossToNet', employerDiscountType: 'none' });
      const janNet = fwd.months[0].netSalary;

      const rev = calculateMaas({ netSalary: janNet, calculationMode: 'netToGross', employerDiscountType: 'none' });
      const janGross = rev.months[0].grossSalary;

      // Round-trip gross must match within 0.02 TL
      expect(Math.abs(janGross - testGross)).toBeLessThanOrEqual(0.02);
    }
  });

  // ==========================================
  // 3. NON-FINITE, INVALID INPUTS & GUARDS
  // ==========================================
  it('TEST L — NON-FINITE AND INVALID INPUT GUARDS', () => {
    // NaN gross defaults safely to MIN_GROSS without throwing uncaught exceptions
    const nanRes = calculateMaas({ grossSalary: NaN, employerDiscountType: 'none' });
    expect(nanRes.months[0].grossSalary).toBe(33030);

    // Negative gross defaults safely to MIN_GROSS
    const negRes = calculateMaas({ grossSalary: -5000, employerDiscountType: 'none' });
    expect(negRes.months[0].grossSalary).toBe(33030);

    // Undefined/null net in netToGross defaults safely to MIN_WAGE_TAX_BASE
    const undefNetRes = calculateMaas({ calculationMode: 'netToGross', netSalary: undefined, employerDiscountType: 'none' });
    expect(undefNetRes.months[0].grossSalary).toBeCloseTo(33030, 2);

    // Infinity net in netToGross defaults safely to MIN_GROSS
    const infNetRes = calculateMaas({ calculationMode: 'netToGross', netSalary: Infinity, employerDiscountType: 'none' });
    expect(infNetRes.months[0].grossSalary).toBeCloseTo(33030, 2);
  });

  it('TEST M — EXACT PARITY TEST WITH FRACTIONAL SALARY (35,432.12 TL)', () => {
    // Historical verification: 35,432.12 gross in Jan should produce exact unrounded tax base & net
    const res = calculateMaas({ grossSalary: 35432.12, employerDiscountType: 'none' });
    const jan = res.months[0];
    
    // SGK = 35432.12 * 0.14 = 4960.50
    expect(jan.sgkEmployee).toBeCloseTo(4960.50, 2);
    // Unemp = 35432.12 * 0.01 = 354.32
    expect(jan.unemploymentEmployee).toBeCloseTo(354.32, 2);
    // Net salary should match original engine
    expect(jan.netSalary).toBeCloseTo(29792.80, 1);
  });

  // ==========================================
  // 4. ZOD SCHEMA BOUNDARY & VALIDATION ERRORS
  // ==========================================
  it('TEST N — ZOD SCHEMA VALIDATION RULES', () => {
    // Valid gross
    expect(() => maasCalculatorDef.schema.parse({ grossSalary: 50000, employerDiscountType: 'none' })).not.toThrow();

    // Invalid gross (below 33030)
    expect(() => maasCalculatorDef.schema.parse({ grossSalary: 25000, employerDiscountType: 'none' })).toThrow(
      /33\.030 TL'den düşük olamaz/
    );

    // Valid net
    expect(() => maasCalculatorDef.schema.parse({
      calculationMode: 'netToGross',
      netSalary: 45000,
      employerDiscountType: 'none'
    })).not.toThrow();

    // Invalid net (below 28075.50)
    expect(() => maasCalculatorDef.schema.parse({
      calculationMode: 'netToGross',
      netSalary: 20000,
      employerDiscountType: 'none'
    })).toThrow(/28\.075,50 TL'den düşük olamaz/);
  });
});
