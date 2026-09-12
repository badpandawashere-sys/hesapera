import { calculateOyp, formatOypResult } from '../oyp';
import { describe, it, expect } from 'vitest';

describe('OYP Calculator (Tarihi Sistem)', () => {
  it('should calculate maximum OYP score', () => {
    const res = calculateOyp(100, 100, 100);
    expect(res.oypScore).toBe(100);
  });

  it('should calculate minimum OYP score', () => {
    const res = calculateOyp(0, 0, 0);
    expect(res.oypScore).toBe(0);
  });

  it('should apply weights correctly', () => {
    // ALES:80 * 0.50 = 40, YD:60 * 0.10 = 6, Lisans:70 * 0.40 = 28 -> 74
    const res = calculateOyp(80, 60, 70);
    expect(res.oypScore).toBeCloseTo(74, 1);
  });

  it('should throw for ALES above 100', () => {
    expect(() => calculateOyp(101, 80, 80)).toThrow();
  });

  it('should throw for negative yabanci dil score', () => {
    expect(() => calculateOyp(80, -1, 80)).toThrow();
  });

  it('should include historical warning in notes', () => {
    const res = calculateOyp(80, 70, 85);
    const formatted = formatOypResult(res);
    expect(formatted.notes[0]).toContain('tarihi');
  });
});
