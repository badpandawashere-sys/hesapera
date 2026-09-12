import { calculateIrr } from '../irr';
import { describe, it, expect } from 'vitest';

describe('IRR Calculator', () => {
  it('should calculate IRR correctly for standard cash flow', () => {
    // -1000, 600, 600 -> IRR = 13.066%
    const cfs = [
      { period: 0, amount: -1000 },
      { period: 1, amount: 600 },
      { period: 2, amount: 600 }
    ];
    const res = calculateIrr(cfs);
    expect(res.primaryResult.includes('13.0')).toBe(true);
  });
  
  it('should throw error if no sign change', () => {
    const cfs = [
      { period: 0, amount: 1000 },
      { period: 1, amount: 600 }
    ];
    expect(() => calculateIrr(cfs)).toThrow('IRR hesaplanabilmesi için nakit akışlarında en az bir pozitif ve en az bir negatif tutar (yatırım vs.) bulunmalıdır.');
  });
});