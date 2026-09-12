import { describe, it, expect } from 'vitest';
import { calculateEbobEkok } from '../ebobEkok';

describe('EBOB EKOK Calculator', () => {
  it('should calculate gcd(48,18)=6 and lcm=144', () => {
    const res = calculateEbobEkok({ numbers: [{ value: 48 }, { value: 18 }] });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('6');
    expect(res.secondaryResults['EKOK (LCM)']).toBe('144');
  });

  it('should calculate gcd(12,8)=4 and lcm=24', () => {
    const res = calculateEbobEkok({ numbers: [{ value: 12 }, { value: 8 }] });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('4');
    expect(res.secondaryResults['EKOK (LCM)']).toBe('24');
  });

  it('should calculate lcm(21,6)=42', () => {
    const res = calculateEbobEkok({ numbers: [{ value: 21 }, { value: 6 }] });
    expect(res.secondaryResults['EKOK (LCM)']).toBe('42');
  });

  it('should handle multiple prime numbers (7, 13, 3)', () => {
    const res = calculateEbobEkok({ numbers: [{ value: 7 }, { value: 13 }, { value: 3 }] });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('1');
    expect(res.secondaryResults['EKOK (LCM)']).toBe('273');
  });

  it('should handle equal numbers', () => {
    const res = calculateEbobEkok({ numbers: [{ value: 10 }, { value: 10 }] });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('10');
    expect(res.secondaryResults['EKOK (LCM)']).toBe('10');
  });

  it('should handle when one is a multiple of others', () => {
    const res = calculateEbobEkok({ numbers: [{ value: 4 }, { value: 12 }, { value: 24 }] });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('4');
    expect(res.secondaryResults['EKOK (LCM)']).toBe('24');
  });

  it('should handle large integers safely', () => {
    const res = calculateEbobEkok({ numbers: [{ value: 1000000 }, { value: 999999 }] });
    expect(res.secondaryResults['EBOB (GCD)']).toBe('1');
  });

  it('should throw on negative or decimal', () => {
    expect(() => calculateEbobEkok({ numbers: [{ value: -3 }, { value: 6 }] })).toThrow();
    expect(() => calculateEbobEkok({ numbers: [{ value: 2.5 }, { value: 5 }] })).toThrow();
  });
});
