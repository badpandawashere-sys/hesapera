import { calculateOzelGuvenlik } from '../ozelGuvenlik';
import { describe, it, expect } from 'vitest';

describe('Ozel Guvenlik Sinavi', () => {
  it('should calculate silahsiz basarili', () => {
    const res = calculateOzelGuvenlik(false, 60, 0, 0);
    expect(res.yaziliPuani).toBe(60);
    expect(res.isSuccessful).toBe(true);
  });

  it('should calculate silahsiz basarisiz', () => {
    const res = calculateOzelGuvenlik(false, 59, 0, 0);
    expect(res.yaziliPuani).toBe(59);
    expect(res.isSuccessful).toBe(false);
  });

  it('should calculate silahli basarili (Ortalama >= 60, min 50)', () => {
    // Yazili: 60, Silah: 15*2 + 2*10 = 50. Ortalama: 110/2 = 55. FAILS average.
    // Let's do Yazili: 70, Silah: 15*2 + 2*10 = 50. Ortalama: 120/2 = 60. PASSES
    const res = calculateOzelGuvenlik(true, 70, 15, 2);
    expect(res.genelPuan).toBe(60);
    expect(res.silahSinaviToplami).toBe(50);
    expect(res.isSuccessful).toBe(true);
  });

  it('should calculate silahli basarisiz (Yazili 49)', () => {
    // Yazili: 49, Silah: 100. Ortalama: 149/2 = 74.5, ama yazili 50 alti.
    const res = calculateOzelGuvenlik(true, 49, 25, 5);
    expect(res.genelPuan).toBe(74.5);
    expect(res.isSuccessful).toBe(false);
  });

  it('should calculate silahli basarisiz (Silah 48)', () => {
    // Yazili: 80, Silah: 24*2 + 0 = 48. Ortalama: 128/2 = 64, ama silah 50 alti.
    const res = calculateOzelGuvenlik(true, 80, 24, 0);
    expect(res.genelPuan).toBe(64);
    expect(res.isSuccessful).toBe(false);
  });

  it('should throw on limits', () => {
    expect(() => calculateOzelGuvenlik(false, 101, 0, 0)).toThrow();
    expect(() => calculateOzelGuvenlik(true, 100, 26, 0)).toThrow();
    expect(() => calculateOzelGuvenlik(true, 100, 25, 6)).toThrow();
    expect(() => calculateOzelGuvenlik(true, -1, 0, 0)).toThrow();
  });
});
