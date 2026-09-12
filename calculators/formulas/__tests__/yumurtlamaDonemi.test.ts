import { describe, it, expect } from 'vitest';
import { calculateYumurtlamaDonemi } from '../yumurtlamaDonemi';

describe('Yumurtlama Donemi Calculator', () => {
  it('should calculate typical 28 day cycle correctly', () => {
    // 2026-01-01 + (28-14) = 2026-01-15
    const res = calculateYumurtlamaDonemi({ sonAdetTarihi: '2026-01-01', donguSuresi: 28 });
    expect(res.primaryResult).toContain('15');
    expect(res.secondaryResults['Verimli Dönem Başlangıcı']).toContain('10'); // 15 - 5
    expect(res.secondaryResults['Verimli Dönem Bitişi']).toContain('16'); // 15 + 1
  });

  it('should calculate 30 day cycle correctly', () => {
    // 2026-01-01 + (30-14) = 2026-01-17
    const res = calculateYumurtlamaDonemi({ sonAdetTarihi: '2026-01-01', donguSuresi: 30 });
    expect(res.primaryResult).toContain('17');
  });

  it('should handle leap year correctly', () => {
    // 2024-02-15 + (28-14) = 2024-02-29
    const res = calculateYumurtlamaDonemi({ sonAdetTarihi: '2024-02-15', donguSuresi: 28 });
    expect(res.primaryResult).toContain('29');
    expect(res.primaryResult).toContain('Şubat');
  });

  it('should throw on out of bounds cycle', () => {
    expect(() => calculateYumurtlamaDonemi({ sonAdetTarihi: '2026-01-01', donguSuresi: 10 })).toThrow();
    expect(() => calculateYumurtlamaDonemi({ sonAdetTarihi: '2026-01-01', donguSuresi: 50 })).toThrow();
  });
});
