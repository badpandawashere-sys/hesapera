import { calculateInflation } from '../inflation';
import { describe, it, expect, vi } from 'vitest';
import { inflationCalculatorDef } from '../../definitions/inflation';
import { TUIK_CPI_2025_BASE } from '@/lib/data/sources/tuik-cpi';

describe('ID25 Enflasyon Hesaplama Formülü', () => {

  it('TEST 1: 250.000 TL, 2018-01 -> 2026-08', () => {
    // We expect start = 10.45, end = 134.74
    // Result: 3,223,444.98
    const res = calculateInflation(250000, '2018-01', '2026-08');
    expect(res.primaryResult.includes('3.223.444,98')).toBe(true);
    expect(res.secondaryResults['Bitiş Endeksi'].includes('134,74')).toBe(true);
  });

  it('TEST 2: Aynı tarih, tutar değişmemeli (2018-01 -> 2018-01)', () => {
    const res = calculateInflation(250000, '2018-01', '2018-01');
    expect(res.primaryResult.includes('250.000,00')).toBe(true);
    expect(res.secondaryResults['TÜFE Değişimi']).toBe('%0');
    expect(res.secondaryResults['Değer Artışı'].includes('0,00')).toBe(true);
  });

  it('TEST 3: Başlangıç tarihi > Bitiş tarihi olamaz', () => {
    expect(() => calculateInflation(250000, '2026-08', '2018-01')).toThrow('Başlangıç tarihi, bitiş tarihinden ileri olamaz.');
  });

  it('TEST 4: NaN Handling ve Negatif Tutar', () => {
    expect(() => calculateInflation(NaN, '2018-01', '2026-08')).toThrow();
    expect(() => calculateInflation(-100, '2018-01', '2026-08')).toThrow();
  });

  it('TEST 5: Olmayan veri ayı hatası', () => {
    expect(() => calculateInflation(1000, '1999-01', '2026-08')).toThrow();
    expect(() => calculateInflation(1000, '2018-01', '2050-08')).toThrow();
  });

  it('TEST 6: Zod Schema Kontrolü', () => {
    const schema = inflationCalculatorDef.schema;
    // Geçersiz tarih formatı
    expect(schema.safeParse({ startAmount: 1000, startDate: '01-2018', endDate: '2026-08' }).success).toBe(false);
    // Bitiş başlangıçtan küçük
    expect(schema.safeParse({ startAmount: 1000, startDate: '2026-08', endDate: '2018-01' }).success).toBe(false);
    // Negatif tutar
    expect(schema.safeParse({ startAmount: -5, startDate: '2018-01', endDate: '2026-08' }).success).toBe(false);
    // Başarılı
    expect(schema.safeParse({ startAmount: 1000, startDate: '2018-01', endDate: '2026-08' }).success).toBe(true);
  });
});
