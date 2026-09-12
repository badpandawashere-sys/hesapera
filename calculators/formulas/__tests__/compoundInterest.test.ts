import { calculateCompoundInterest } from '../compoundInterest';
import { describe, it, expect } from 'vitest';

describe('Compound Interest Calculator', () => {
  it('should calculate correctly for annual compounding', () => {
    const result = calculateCompoundInterest(1000, 10, 2, '1');
    // A = 1000 * (1 + 0.10/1)^(1*2) = 1000 * 1.21 = 1210
    expect(result.primaryResult).toContain('1.210');
    expect(result.secondaryResults['Kazanılan Faiz']).toContain('210');
  });

  it('should calculate correctly for monthly compounding', () => {
    const result = calculateCompoundInterest(1000, 12, 1, '12');
    // A = 1000 * (1 + 0.12/12)^12 = 1000 * 1.12683... = 1126.83
    expect(result.primaryResult).toContain('1.126');
    expect(result.secondaryResults['Bileşikleşme (n)']).toBe('Aylık (12)');
  });

  it('should return zero interest for zero rate', () => {
    const result = calculateCompoundInterest(1000, 0, 5, '1');
    expect(result.primaryResult).toContain('1.000');
    expect(result.secondaryResults['Kazanılan Faiz']).toContain('0');
  });

  it('should show compounding frequency label correctly', () => {
    const annual = calculateCompoundInterest(1000, 10, 1, '1');
    expect(annual.secondaryResults['Bileşikleşme (n)']).toBe('Yıllık (1)');
    const sixMonth = calculateCompoundInterest(1000, 10, 1, '2');
    expect(sixMonth.secondaryResults['Bileşikleşme (n)']).toBe('6 Aylık (2)');
    const quarterly = calculateCompoundInterest(1000, 10, 1, '4');
    expect(quarterly.secondaryResults['Bileşikleşme (n)']).toBe('3 Aylık (4)');
    const daily = calculateCompoundInterest(1000, 10, 1, '365');
    expect(daily.secondaryResults['Bileşikleşme (n)']).toBe('Günlük (365)');
  });
});