import { calculateDibMbsts } from '../dibMbsts';
import { describe, it, expect } from 'vitest';

describe('DİB MBSTS Calculator', () => {
  it('should calculate 100 score for all correct', () => {
    const res = calculateDibMbsts(100, 0);
    expect(res.primaryResult).toBe('100.000');
    expect(res.secondaryResults['Net']).toBe('100.00');
  });

  it('should calculate 0 for all wrong', () => {
    // 100 yanlış, 4*100/4 = 25 → but net floor = 0
    const res = calculateDibMbsts(0, 100);
    expect(parseFloat(res.primaryResult)).toBe(0);
  });

  it('should throw for exceeding total', () => {
    expect(() => calculateDibMbsts(80, 30)).toThrow();
  });
});