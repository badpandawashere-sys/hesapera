import { describe, it, expect } from 'vitest';
import { calculateMaas } from '../maas';

describe('Maas Formula', () => {
  it('TEST A — ASGARİ ÜCRET', () => {
    const res = calculateMaas({ grossSalary: 33030, employerDiscountType: 'none' });
    
    res.months.forEach(m => {
      expect(m.netSalary).toBeCloseTo(28075.50, 1);
      expect(m.incomeTax).toBeCloseTo(0, 1);
      expect(m.stampTax).toBeCloseTo(0, 1);
    });
    
    expect(res.annualNet).toBeCloseTo(28075.50 * 12, 1);
  });

  it('TEST B — 50K OCAK', () => {
    const res = calculateMaas({ grossSalary: 50000, employerDiscountType: 'none' });
    const jan = res.months[0];
    
    expect(jan.sgkEmployee).toBeCloseTo(7000, 2);
    expect(jan.unemploymentEmployee).toBeCloseTo(500, 2);
    expect(jan.grossSalary - jan.sgkEmployee - jan.unemploymentEmployee).toBeCloseTo(42500, 2);
    expect(jan.netSalary).toBeCloseTo(40207.53, 2);
  });

  it('TEST C — TAX BRACKET', () => {
    const res = calculateMaas({ grossSalary: 50000, employerDiscountType: 'none' });
    
    const may = res.months.find(m => m.month === 5)!;
    expect(may.cumulativeTaxBase).toBeGreaterThan(190000);
    
    const apr = res.months.find(m => m.month === 4)!;
    // Income tax should not be the same between April and May because the 190k threshold is crossed in May
    expect(apr.incomeTax).not.toBeCloseTo(may.incomeTax, 2);
  });

  it('TEST D — PEK CAP', () => {
    const res = calculateMaas({ grossSalary: 400000, employerDiscountType: 'none' });
    const jan = res.months[0];
    
    expect(jan.sgkEmployee).toBeCloseTo(41617.80, 2);
    expect(jan.unemploymentEmployee).toBeCloseTo(2972.70, 2);
  });

  it('TEST E — EMPLOYER COST / MIN WAGE', () => {
    const resNone = calculateMaas({ grossSalary: 33030, employerDiscountType: 'none' });
    expect(resNone.monthlyEmployerCost).toBeCloseTo(40874.63, 2);
    
    const resOther = calculateMaas({ grossSalary: 33030, employerDiscountType: 'other' });
    expect(resOther.monthlyEmployerCost).toBeCloseTo(40214.03, 2);
    
    const resMan = calculateMaas({ grossSalary: 33030, employerDiscountType: 'manufacturing' });
    expect(resMan.monthlyEmployerCost).toBeCloseTo(39223.13, 2);
  });
});
