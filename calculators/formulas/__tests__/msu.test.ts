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
});
