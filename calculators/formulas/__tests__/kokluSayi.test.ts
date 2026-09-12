import { describe, it, expect } from 'vitest';
import { calculateKokluSayi } from '../kokluSayi';

describe('Köklü Sayı Calculator', () => {
  it('should calculate square root of 4 (perfect root)', () => {
    const res = calculateKokluSayi({ sayi: 4, derece: 2 });
    expect(res.primaryResult).toBe('2');
    expect(res.secondaryResults['Tam Kök mü']).toBe('Evet');
  });

  it('should calculate square root of 2 (irrational)', () => {
    const res = calculateKokluSayi({ sayi: 2, derece: 2 });
    expect(res.primaryResult).toContain('1.41421356');
    expect(res.secondaryResults['Tam Kök mü']).toBe('Hayır');
  });

  it('should calculate cube root of 27 (perfect root)', () => {
    const res = calculateKokluSayi({ sayi: 27, derece: 3 });
    expect(res.primaryResult).toBe('3');
  });

  it('should calculate cube root of -8 (negative perfect root)', () => {
    const res = calculateKokluSayi({ sayi: -8, derece: 3 });
    expect(res.primaryResult).toBe('-2');
  });

  it('should calculate 4th root of 16', () => {
    const res = calculateKokluSayi({ sayi: 16, derece: 4 });
    expect(res.primaryResult).toBe('2');
  });

  it('should throw on negative even root (e.g. sqrt(-4))', () => {
    expect(() => calculateKokluSayi({ sayi: -4, derece: 2 })).toThrow();
    expect(() => calculateKokluSayi({ sayi: -16, derece: 4 })).toThrow();
  });

  it('should handle zero correctly', () => {
    const res = calculateKokluSayi({ sayi: 0, derece: 2 });
    expect(res.primaryResult).toBe('0');
  });

  it('should handle large root degrees', () => {
    const res = calculateKokluSayi({ sayi: 1024, derece: 10 });
    expect(res.primaryResult).toBe('2');
  });

  it('should throw on invalid degree (decimal)', () => {
    expect(() => calculateKokluSayi({ sayi: 16, derece: 2.5 })).toThrow();
  });

  it('should throw on invalid degree (less than 2)', () => {
    expect(() => calculateKokluSayi({ sayi: 16, derece: 1 })).toThrow();
    expect(() => calculateKokluSayi({ sayi: 16, derece: -2 })).toThrow();
  });
});
