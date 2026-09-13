import { describe, it, expect } from 'vitest';
import { calculateCreditCardLateFee } from '../creditCardLateFee';

describe('calculateCreditCardLateFee', () => {
  it('1. should calculate 10.000 TL / 15 gun / %4.55 correctly with taxes', () => {
    const result = calculateCreditCardLateFee(10000, 4.55, 15);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.secondaryResults['Saf Gecikme Faizi']).toContain('227,50');
    // @ts-ignore
    expect(result.secondaryResults['KKDF (%15)']).toContain('34,13');
    // @ts-ignore
    expect(result.secondaryResults['BSMV (%15)']).toContain('34,13');
    // @ts-ignore
    expect(result.primaryResult).toContain('295,75');
  });

  it('2. should calculate 5.000 TL / 30 gun / %4.55 correctly with taxes', () => {
    const result = calculateCreditCardLateFee(5000, 4.55, 30);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.secondaryResults['Saf Gecikme Faizi']).toContain('227,50');
    // @ts-ignore
    expect(result.primaryResult).toContain('295,75');
  });

  it('3. should calculate 0 gun correctly', () => {
    const result = calculateCreditCardLateFee(10000, 4.55, 0);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.primaryResult).toContain('0,00');
  });

  it('4. should calculate different principal and rate (20.000 TL / 20 gun / %3.55)', () => {
    const result = calculateCreditCardLateFee(20000, 3.55, 20);
    expect(result.success !== false).toBe(true);
    // Saf Faiz: 20000 * (0.0355/30) * 20 = 473.33
    // Vergili: 473.33 * 1.30 = 615.33
    // @ts-ignore
    expect(result.secondaryResults['Saf Gecikme Faizi']).toContain('473,33');
    // @ts-ignore
    expect(result.primaryResult).toContain('615,33');
  });

  it('5. should handle very high interest rates properly', () => {
    const result = calculateCreditCardLateFee(10000, 50, 30);
    expect(result.success !== false).toBe(true);
    // Saf Faiz: 10000 * 0.50 * 1 = 5000
    // Vergili = 5000 * 1.30 = 6500
    // @ts-ignore
    expect(result.primaryResult).toContain('6.500');
  });

  it('6. should return error on negative amount', () => {
    const result = calculateCreditCardLateFee(-10000, 4.25, 30);
    expect(result.success).toBe(false);
  });

  it('7. should return error on negative days', () => {
    const result = calculateCreditCardLateFee(10000, 4.25, -5);
    expect(result.success).toBe(false);
  });

  it('8. should return error on negative rate', () => {
    const result = calculateCreditCardLateFee(10000, -4.25, 30);
    expect(result.success).toBe(false);
  });
});
