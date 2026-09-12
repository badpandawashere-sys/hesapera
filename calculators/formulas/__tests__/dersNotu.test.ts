import { calculateDersNotu } from '../dersNotu';
import { describe, it, expect } from 'vitest';

describe('Ders Notu Calculator', () => {
  it('should calculate simple average', () => {
    const notlar = [{ not: 60 }, { not: 80 }];
    const res = calculateDersNotu(notlar, false);
    expect(res.primaryResult).toBe('70.00');
    expect(res.secondaryResults['Hesaplama Türü']).toBe('Basit Ortalama');
    expect(res.secondaryResults['Genel Başarı Durumu']).toContain('Gecti');
  });

  it('should calculate weighted average', () => {
    const notlar = [{ not: 60, agirlik: 2 }, { not: 80, agirlik: 3 }];
    // (120 + 240) / 5 = 360 / 5 = 72
    const res = calculateDersNotu(notlar, true);
    expect(res.primaryResult).toBe('72.00');
    expect(res.secondaryResults['Hesaplama Türü']).toBe('Ağırlıklı Ortalama');
  });

  it('should handle zero weight case properly by throwing if total is zero', () => {
    const notlar = [{ not: 60, agirlik: 0 }, { not: 80, agirlik: 0 }];
    expect(() => calculateDersNotu(notlar, true)).toThrow();
  });

  it('should throw on limits', () => {
    expect(() => calculateDersNotu([], false)).toThrow();
    expect(() => calculateDersNotu([{ not: 101 }], false)).toThrow();
    expect(() => calculateDersNotu([{ not: -1 }], false)).toThrow();
    expect(() => calculateDersNotu([{ not: 50, agirlik: -1 }], true)).toThrow();
  });
});
