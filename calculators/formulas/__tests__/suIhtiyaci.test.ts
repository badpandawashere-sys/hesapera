import { describe, it, expect } from 'vitest';
import { calculateSuIhtiyaci } from '../suIhtiyaci';

describe('Su Ihtiyaci Calculator', () => {
  it('should calculate water correctly for 70 kg', () => {
    // 70 * 35 = 2450 ml = 2.45 Litre
    const res = calculateSuIhtiyaci({ kilo: 70 });
    expect(res.primaryResult).toBe('2.45 Litre / gün');
    expect(res.secondaryResults['Mililitre (ml) Cinsinden']).toBe('2450 ml');
  });

  it('should calculate water correctly for 100 kg', () => {
    // 100 * 35 = 3500 ml = 3.50 Litre
    const res = calculateSuIhtiyaci({ kilo: 100 });
    expect(res.primaryResult).toBe('3.50 Litre / gün');
  });

  it('should throw on out of bounds weight', () => {
    expect(() => calculateSuIhtiyaci({ kilo: 15 })).toThrow();
  });
});
