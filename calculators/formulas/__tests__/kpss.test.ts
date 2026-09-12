import { calculateKpss } from '../kpss';
import { describe, it, expect } from 'vitest';

describe('KPSS Calculator', () => {
  it('should give 100 for all correct (Lisans, KPSSP3)', () => {
    const res = calculateKpss('lisans', 'KPSSP3', 60, 0, 60, 0);
    expect(res.primaryResult).toBe('100.000');
  });

  it('should give base 50 for zero nets', () => {
    const res = calculateKpss('lisans', 'KPSSP3', 0, 0, 0, 0);
    expect(res.primaryResult).toBe('50.000');
  });

  it('should apply KPSSP1 weights (GY 30, GK 70)', () => {
    // GY: 60 net (max), GK: 0 → weighted = 0.3*1 + 0.7*0 = 0.3 → score = 50 + 15 = 65
    const res = calculateKpss('lisans', 'KPSSP1', 60, 0, 0, 0);
    expect(res.primaryResult).toBe('65.000');
  });

  it('should throw for exceeding GY limit (Onlisans)', () => {
    expect(() => calculateKpss('onlisans', 'KPSSP3', 41, 0, 0, 0)).toThrow();
  });

  it('should work for Ortaogretim level', () => {
    const res = calculateKpss('ortaogretim', 'KPSSP3', 40, 0, 40, 0);
    expect(res.primaryResult).toBe('100.000');
  });
});