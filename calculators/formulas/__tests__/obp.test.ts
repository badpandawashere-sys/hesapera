import { calculateObp, formatObpResult } from '../obp';
import { describe, it, expect } from 'vitest';

describe('OBP Calculator', () => {
  it('should calculate OBP for diploma 100', () => {
    const res = calculateObp(100);
    expect(res.obp).toBe(500);
    expect(res.normalContribution).toBeCloseTo(60, 1);
    expect(res.kirikcContribution).toBeCloseTo(30, 1); // 500 * 0.06 = 30
  });

  it('should calculate OBP for diploma 50', () => {
    const res = calculateObp(50);
    expect(res.obp).toBe(250);
    expect(res.normalContribution).toBeCloseTo(30, 1); // 250 * 0.12 = 30
    expect(res.kirikcContribution).toBeCloseTo(15, 1); // 250 * 0.06 = 15
  });

  it('should calculate OBP for diploma 0', () => {
    const res = calculateObp(0);
    expect(res.obp).toBe(0);
    expect(res.normalContribution).toBe(0);
  });

  it('should throw for diploma above 100', () => {
    expect(() => calculateObp(101)).toThrow();
  });

  it('should throw for negative diploma note', () => {
    expect(() => calculateObp(-1)).toThrow();
  });

  it('should format result with normal contribution label', () => {
    const res = calculateObp(85);
    const formatted = formatObpResult(res, false);
    expect(formatted.secondaryResults['Aktif Katki Turu']).toContain('Normal');
  });

  it('should format result with kirik contribution label', () => {
    const res = calculateObp(85);
    const formatted = formatObpResult(res, true);
    expect(formatted.secondaryResults['Aktif Katki Turu']).toContain('Kirik');
    expect(formatted.secondaryResults['Aktif Katki Turu']).toContain('Onceki Yil');
  });
});
