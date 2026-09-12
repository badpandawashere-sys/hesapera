import { describe, it, expect } from 'vitest';
import { calculateModulerAritmetik } from '../modulerAritmetik';

describe('Modüler Aritmetik Calculator', () => {
  it('should calculate basic mod correctly (17 mod 5 = 2)', () => {
    const res = calculateModulerAritmetik({ a: 17, b: 0, m: 5, islem: 'mod' });
    expect(res.primaryResult).toBe('2');
  });

  it('should calculate negative modulo correctly (-1 mod 5 = 4)', () => {
    const res = calculateModulerAritmetik({ a: -1, b: 0, m: 5, islem: 'mod' });
    expect(res.primaryResult).toBe('4');
  });

  it('should calculate negative modulo (-17 mod 5 = 3)', () => {
    const res = calculateModulerAritmetik({ a: -17, b: 0, m: 5, islem: 'mod' });
    expect(res.primaryResult).toBe('3');
  });

  it('should calculate addition mod (7 + 8 mod 5 = 0)', () => {
    const res = calculateModulerAritmetik({ a: 7, b: 8, m: 5, islem: 'toplama' });
    expect(res.primaryResult).toBe('0');
  });

  it('should calculate subtraction mod (7 - 10 mod 5 = 2)', () => {
    const res = calculateModulerAritmetik({ a: 7, b: 10, m: 5, islem: 'cikarma' });
    expect(res.primaryResult).toBe('2');
  });

  it('should calculate multiplication mod (7 * 8 mod 5 = 1)', () => {
    const res = calculateModulerAritmetik({ a: 7, b: 8, m: 5, islem: 'carpma' });
    expect(res.primaryResult).toBe('1');
  });

  it('should safely handle large integer multiplications', () => {
    // 100000000 * 100000000 mod 7 -> (BigInt multiplication)
    const res = calculateModulerAritmetik({ a: 100000000, b: 100000000, m: 7, islem: 'carpma' });
    // 100,000,000 = 2 (mod 7). 2 * 2 = 4.
    expect(res.primaryResult).toBe('4');
  });

  it('should throw on mod = 0 or negative', () => {
    expect(() => calculateModulerAritmetik({ a: 5, b: 0, m: 0, islem: 'mod' })).toThrow();
    expect(() => calculateModulerAritmetik({ a: 5, b: 0, m: -3, islem: 'mod' })).toThrow();
  });

  it('should throw on decimal inputs', () => {
    expect(() => calculateModulerAritmetik({ a: 2.5, b: 1, m: 5, islem: 'mod' })).toThrow();
  });
});
