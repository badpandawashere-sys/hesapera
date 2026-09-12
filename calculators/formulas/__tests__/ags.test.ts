import { calculateAgs } from '../ags';
import { describe, it, expect } from 'vitest';

describe('AGS Calculator', () => {
  it('should calculate full score', () => {
    const res = calculateAgs(40, 0, 40, 0);
    expect(res.primaryResult).toBe('100.000');
    expect(res.secondaryResults['Toplam Net']).toBe('80.00');
  });

  it('should throw error for invalid input', () => {
    expect(() => calculateAgs(50, 0, 0, 0)).toThrow();
  });
});