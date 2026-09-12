import { describe, it, expect } from 'vitest';
import { calculateEbobEkok } from '../ebobEkok';

describe('EBOB EKOK Calculator', () => {
  it('should calculate gcd(12,18)=6 and lcm=36', () => {
    const res = calculateEbobEkok({ a: 12, b: 18 });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('6');
    expect(res.secondaryResults['EKOK (LCM)']).toBe('36');
  });

  it('should handle prime numbers (7, 13)', () => {
    const res = calculateEbobEkok({ a: 7, b: 13 });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('1');
    expect(res.secondaryResults['EKOK (LCM)']).toBe('91');
  });

  it('should handle equal numbers', () => {
    const res = calculateEbobEkok({ a: 10, b: 10 });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('10');
    expect(res.secondaryResults['EKOK (LCM)']).toBe('10');
  });

  it('should handle when b is a multiple of a', () => {
    const res = calculateEbobEkok({ a: 4, b: 12 });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('4');
    expect(res.secondaryResults['EKOK (LCM)']).toBe('12');
  });

  it('should handle 1 as input', () => {
    const res = calculateEbobEkok({ a: 1, b: 100 });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('1');
    expect(res.secondaryResults['EKOK (LCM)']).toBe('100');
  });

  it('should handle large integers safely', () => {
    const res = calculateEbobEkok({ a: 1000000, b: 999999 });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('1');
  });

  it('should throw on zero, negative, or decimal', () => {
    expect(() => calculateEbobEkok({ a: 0, b: 5 })).toThrow();
    expect(() => calculateEbobEkok({ a: -3, b: 6 })).toThrow();
    expect(() => calculateEbobEkok({ a: 2.5, b: 5 })).toThrow();
  });
});
