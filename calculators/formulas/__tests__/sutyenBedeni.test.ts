import { describe, it, expect } from 'vitest';
import { calculateSutyenBedeni } from '../sutyenBedeni';

describe('Sutyen Bedeni Calculator', () => {
  it('should calculate size correctly (75 B)', () => {
    // Underbust: 74 -> Band 75
    // Bust: 89
    // Diff: 15 -> B cup
    const res = calculateSutyenBedeni({ gogusAltiCevresi: 74, gogusCevresi: 89 });
    expect(res.primaryResult).toBe('75B');
  });

  it('should calculate size correctly (80 C)', () => {
    // Underbust: 81 -> Band 80
    // Bust: 98
    // Diff: 17 -> C cup
    const res = calculateSutyenBedeni({ gogusAltiCevresi: 81, gogusCevresi: 98 });
    expect(res.primaryResult).toBe('80C');
  });

  it('should calculate size correctly (90 AA)', () => {
    // Diff: 11
    const res = calculateSutyenBedeni({ gogusAltiCevresi: 88, gogusCevresi: 99 });
    expect(res.primaryResult).toBe('90AA');
  });

  it('should handle edge cases', () => {
    expect(() => calculateSutyenBedeni({ gogusAltiCevresi: 80, gogusCevresi: 75 })).toThrow();
  });
});
