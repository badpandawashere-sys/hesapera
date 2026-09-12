import { describe, it, expect } from 'vitest';
import { calculateGebelik } from '../gebelik';

describe('Gebelik Calculator', () => {
  it('should calculate pregnancy weeks correctly', () => {
    // 28 days = 4 weeks
    const res = calculateGebelik({ sonAdetTarihi: '2026-01-01', referansTarihi: '2026-01-29' });
    expect(res.primaryResult).toBe('4 Hafta 0 Gün');
    expect(res.secondaryResults['İçinde Bulunulan Dönem']).toBe('1. Trimester');
    expect(res.secondaryResults['Tahmini Doğum Tarihi']).toBe('2026-10-08'); // +280 days
  });

  it('should identify trimesters correctly', () => {
    // 14 weeks = 98 days
    const res = calculateGebelik({ sonAdetTarihi: '2026-01-01', referansTarihi: '2026-04-09' });
    expect(res.primaryResult).toBe('14 Hafta 0 Gün');
    expect(res.secondaryResults['İçinde Bulunulan Dönem']).toBe('2. Trimester');
  });

  it('should throw on future LMP', () => {
    expect(() => calculateGebelik({ sonAdetTarihi: '2027-01-01', referansTarihi: '2026-01-01' })).toThrow();
  });

  it('should throw on over 300 days', () => {
    expect(() => calculateGebelik({ sonAdetTarihi: '2025-01-01', referansTarihi: '2026-12-01' })).toThrow();
  });
});
