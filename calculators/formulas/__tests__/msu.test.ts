import { calculateMsu } from '../msu';
import { describe, it, expect } from 'vitest';

describe('MSU Calculator', () => {
  it('1. T30/8, S15/4, M25/8, F12/4 => nets', () => {
    const res = calculateMsu(30, 8, 15, 4, 25, 8, 12, 4);
    expect(res.nets.turkce).toBe(28);
    expect(res.nets.sosyal).toBe(14);
    expect(res.nets.matematik).toBe(23);
    expect(res.nets.fen).toBe(11);
    expect(res.nets.total).toBe(76);
    expect(res.isEligible).toBe(true);
  });

  it('2. Perfect 40/0, 20/0, 40/0, 20/0 => nets 120', () => {
    const res = calculateMsu(40, 0, 20, 0, 40, 0, 20, 0);
    expect(res.nets.total).toBe(120);
    expect(res.isEligible).toBe(true);
  });

  it('3. Zero => nets 0', () => {
    const res = calculateMsu(0, 0, 0, 0, 0, 0, 0, 0);
    expect(res.nets.total).toBe(0);
    expect(res.isEligible).toBe(false);
  });

  it('4. T0/40 => -10 net (no negative clamp)', () => {
    const res = calculateMsu(0, 40, 0, 0, 0, 0, 0, 0);
    expect(res.nets.turkce).toBe(-10);
    expect(res.nets.total).toBe(-10);
    expect(res.isEligible).toBe(false);
  });

  it('5. Eligibility zero/zero => false', () => {
    const res = calculateMsu(0, 0, 0, 0, 0, 0, 0, 0);
    expect(res.isEligible).toBe(false);
  });

  it('6. Eligibility T1/2 => true', () => {
    const res = calculateMsu(1, 2, 0, 0, 0, 0, 0, 0);
    expect(res.nets.turkce).toBe(0.5);
    expect(res.isEligible).toBe(true);
  });

  it('7. Eligibility Mat1/2 => true', () => {
    const res = calculateMsu(0, 0, 0, 0, 1, 2, 0, 0);
    expect(res.nets.matematik).toBe(0.5);
    expect(res.isEligible).toBe(true);
  });

  it('8. Eligibility T0/1 => false', () => {
    const res = calculateMsu(0, 1, 0, 0, 0, 0, 0, 0);
    expect(res.nets.turkce).toBe(-0.25);
    expect(res.isEligible).toBe(false);
  });

  it('9. Soru asimi firlatir (Turkce 41)', () => {
    expect(() => calculateMsu(41, 0, 0, 0, 0, 0, 0, 0)).toThrow();
  });
  
  it('10. Soru asimi firlatir (Sosyal 21)', () => {
    expect(() => calculateMsu(0, 0, 21, 0, 0, 0, 0, 0)).toThrow();
  });

  it('11. Negatif input deger firlatir', () => {
    expect(() => calculateMsu(-1, 0, 0, 0, 0, 0, 0, 0)).toThrow();
  });

  it('12. Ondalikli input deger firlatir', () => {
    expect(() => calculateMsu(10.5, 0, 0, 0, 0, 0, 0, 0)).toThrow();
  });

  // 2026 CALIBRATED SCORE REGRESSION TESTS
  it('13. Golden 2026 Case A (10 net each)', () => {
    const res = calculateMsu(10, 0, 10, 0, 10, 0, 10, 0);
    expect(res.isEligible).toBe(true);
    expect(res.estimatedScores).toBeDefined();
    expect(res.estimatedScores!.SAY).toBeCloseTo(261.87444, 2);
    expect(res.estimatedScores!.EA).toBeCloseTo(256.47316, 2);
    expect(res.estimatedScores!.SOZ).toBeCloseTo(275.07469, 2);
    expect(res.estimatedScores!.GENEL).toBeCloseTo(258.04337, 2);
  });

  it('14. Golden 2026 Case F (76 net)', () => {
    const res = calculateMsu(30, 8, 15, 4, 25, 8, 12, 4);
    expect(res.estimatedScores!.SAY).toBeCloseTo(365.81894, 2);
    expect(res.estimatedScores!.EA).toBeCloseTo(376.60105, 2);
    expect(res.estimatedScores!.SOZ).toBeCloseTo(385.38623, 2);
    expect(res.estimatedScores!.GENEL).toBeCloseTo(373.73889, 2);
  });

  it('15. Golden 2026 Case G', () => {
    const res = calculateMsu(30, 0, 5, 0, 20, 0, 10, 0);
    expect(res.estimatedScores!.SAY).toBeCloseTo(338.24151, 2);
  });

  it('16. Golden 2026 Case H', () => {
    const res = calculateMsu(5, 0, 15, 0, 30, 0, 5, 0);
    expect(res.estimatedScores!.SAY).toBeCloseTo(298.2155, 2);
  });

  it('17. Golden 2026 Case I', () => {
    const res = calculateMsu(20, 0, 10, 0, 5, 0, 15, 0);
    expect(res.estimatedScores!.SAY).toBeCloseTo(296.50437, 2);
  });

  it('18. Golden 2026 Case J (Perfect Clamp 500)', () => {
    const res = calculateMsu(40, 0, 20, 0, 40, 0, 20, 0);
    expect(res.estimatedScores!.SAY).toBe(500);
    expect(res.estimatedScores!.EA).toBe(500);
    expect(res.estimatedScores!.SOZ).toBe(500);
    expect(res.estimatedScores!.GENEL).toBe(500);
  });

  it('19. Golden 2026 Case K (0 eligibility -> null)', () => {
    const res = calculateMsu(0, 0, 0, 0, 0, 0, 0, 0);
    expect(res.isEligible).toBe(false);
    expect(res.estimatedScores).toBeNull();
  });

  it('20. Golden 2026 Case L (0.5 eligibility)', () => {
    const res = calculateMsu(1, 2, 0, 0, 0, 0, 0, 0);
    expect(res.isEligible).toBe(true);
    expect(res.estimatedScores!.SAY).toBeCloseTo(139.48523, 2);
  });

  it('21. WeightsInfo returned on successful calc', () => {
    const res = calculateMsu(10, 0, 10, 0, 10, 0, 10, 0);
    expect(res.weightsInfo).toBeDefined();
    expect(res.weightsInfo.SAY.turkce).toBe(25);
  });
});
