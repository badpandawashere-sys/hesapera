import { describe, it, expect } from 'vitest';
import { calculateAsalCarpan } from '../asalCarpan';

describe('Asal Carpan Calculator', () => {
  it('should calculate composite numbers correctly (60)', () => {
    const res = calculateAsalCarpan({ sayi: 60 });
    expect(res.primaryResult).toBe('2^2 × 3 × 5');
    expect(res.secondaryResults['Asal Çarpanlar']).toBe('2 (2 adet), 3, 5');
    expect(res.secondaryResults['Sayı Türü']).toBe('Bileşik Sayı');
  });

  it('should calculate prime numbers correctly (7)', () => {
    const res = calculateAsalCarpan({ sayi: 7 });
    expect(res.primaryResult).toBe('7');
    expect(res.secondaryResults['Asal Çarpanlar']).toBe('7');
    expect(res.secondaryResults['Sayı Türü']).toBe('Asal Sayı');
  });

  it('should calculate correctly for 4', () => {
    const res = calculateAsalCarpan({ sayi: 4 });
    expect(res.primaryResult).toBe('2^2');
  });

  it('should calculate correctly for 12', () => {
    const res = calculateAsalCarpan({ sayi: 12 });
    expect(res.primaryResult).toBe('2^2 × 3');
  });

  it('should calculate correctly for large composites', () => {
    const res = calculateAsalCarpan({ sayi: 1024 });
    expect(res.primaryResult).toBe('2^10');
  });

  it('should handle 1 specially', () => {
    const res = calculateAsalCarpan({ sayi: 1 });
    expect(res.primaryResult).toBe('Ayrıştırılamaz');
  });

  it('should throw on negative/zero/decimal', () => {
    expect(() => calculateAsalCarpan({ sayi: 0 })).toThrow();
    expect(() => calculateAsalCarpan({ sayi: -5 })).toThrow();
    expect(() => calculateAsalCarpan({ sayi: 2.5 })).toThrow();
  });
});
