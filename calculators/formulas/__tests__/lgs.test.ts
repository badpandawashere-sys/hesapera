import { calculateLgs } from '../lgs';
import { describe, it, expect } from 'vitest';

const allCorrect = { turkceC: 20, turkceW: 0, matematikC: 20, matematikW: 0, fenC: 20, fenW: 0, inkılapC: 10, inkılapW: 0, dinC: 10, dinW: 0, yabancıDilC: 10, yabancıDilW: 0 };
const allZero   = { turkceC: 0, turkceW: 0, matematikC: 0, matematikW: 0, fenC: 0, fenW: 0, inkılapC: 0, inkılapW: 0, dinC: 0, dinW: 0, yabancıDilC: 0, yabancıDilW: 0 };

describe('LGS Calculator', () => {
  it('should give 500 for all correct', () => {
    const res = calculateLgs(allCorrect);
    expect(res.primaryResult).toBe('500');
    expect(res.secondaryResults['Toplam Net']).toBe('90.00 / 90');
  });

  it('should give 100 for all zero', () => {
    const res = calculateLgs(allZero);
    expect(res.primaryResult).toBe('100');
  });

  it('should correctly apply 1/3 penalty', () => {
    // Türkçe: 18D 3Y → blank = 20-18-3 = -1 → INVALID
    // Correct test: 15D 3Y → blank = 2, net = 15 - 1 = 14
    const res = calculateLgs({ ...allZero, turkceC: 15, turkceW: 3 });
    expect(res.secondaryResults['Türkçe Net']).toBe('14.00 / 20');
  });

  it('should throw for exceeding Türkçe limit', () => {
    expect(() => calculateLgs({ ...allZero, turkceC: 21 })).toThrow();
  });

  it('should throw for exceeding İnkılap limit', () => {
    expect(() => calculateLgs({ ...allZero, inkılapC: 11 })).toThrow();
  });
});