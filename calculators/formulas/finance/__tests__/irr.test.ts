import { npv, calculateIRR } from '../irr';
import { describe, it, expect } from 'vitest';

describe('IRR Solver', () => {
  it('should calculate IRR correctly for a standard loan', () => {
    // 1000 loan, 100 payment for 12 months.
    // rate should be approx 2.922% per month
    const cf = [1000, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100, -100];
    const rate = calculateIRR(cf);
    expect(rate).toBeCloseTo(0.0292285, 5);
  });

  it('should throw error for non-convergent cash flows', () => {
    const cf = [1000, 100, 100]; // all positive, no sign change
    expect(() => calculateIRR(cf)).toThrow();
  });
});