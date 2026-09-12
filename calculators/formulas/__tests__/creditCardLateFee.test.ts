import { describe, it, expect } from 'vitest';
import { calculateCreditCardLateFee } from '../creditCardLateFee';

describe('calculateCreditCardLateFee', () => {
  it('1. should calculate 10.000 TL / %4.25 / 30 gun correctly', () => {
    const result = calculateCreditCardLateFee(10000, 4.25, 30);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.primaryResult).toContain('425');
  });

  it('2. should calculate 10.000 TL / %4.25 / 15 gun correctly', () => {
    const result = calculateCreditCardLateFee(10000, 4.25, 15);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.primaryResult).toContain('212,50');
  });

  it('3. should calculate 10.000 TL / %4.25 / 1 gun correctly', () => {
    const result = calculateCreditCardLateFee(10000, 4.25, 1);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.primaryResult).toContain('14,17');
  });

  it('4. should calculate 10.000 TL / %4.25 / 0 gun correctly', () => {
    const result = calculateCreditCardLateFee(10000, 4.25, 0);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.primaryResult).toContain('0,00');
  });

  it('5. should handle very high interest rates properly', () => {
    const result = calculateCreditCardLateFee(10000, 50, 30);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.primaryResult).toContain('5.000');
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
