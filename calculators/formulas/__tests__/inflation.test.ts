import { calculateInflation } from '../inflation';
import { describe, it, expect } from 'vitest';
import { inflationCalculatorDef } from '../../definitions/inflation';

describe('ID25 Enflasyon Hesaplama Formülü', () => {

  it('TEST 1: 1000 TL, 100 -> 120', () => {
    const res = calculateInflation(1000, 100, 120);
    expect(res.primaryResult.includes('1.200,00')).toBe(true);
    expect(res.secondaryResults['Enflasyon Oranı']).toBe('%20');
    expect(res.secondaryResults['Fiyat Artışı'].includes('200,00')).toBe(true);
  });

  it('TEST 2: 5000 TL, 100 -> 150', () => {
    const res = calculateInflation(5000, 100, 150);
    expect(res.primaryResult.includes('7.500,00')).toBe(true);
    expect(res.secondaryResults['Enflasyon Oranı']).toBe('%50');
    expect(res.secondaryResults['Fiyat Artışı'].includes('2.500,00')).toBe(true);
  });

  it('TEST 3: Negatif Enflasyon (1000 TL, 120 -> 100)', () => {
    const res = calculateInflation(1000, 120, 100);
    // 1000 * (100/120) = 833.333
    expect(res.primaryResult.includes('833,33')).toBe(true);
    expect(res.secondaryResults['Enflasyon Oranı'].includes('-16,67')).toBe(true);
    expect(res.secondaryResults['Fiyat Artışı'].includes('166,67')).toBe(true);
  });

  it('TEST 4: Aynı endeks, tutar değişmemeli (100 -> 100)', () => {
    const res = calculateInflation(1000, 100, 100);
    expect(res.primaryResult.includes('1.000,00')).toBe(true);
    expect(res.secondaryResults['Enflasyon Oranı']).toBe('%0');
    expect(res.secondaryResults['Fiyat Artışı'].includes('0,00')).toBe(true);
  });

  it('TEST 5: NaN Handling', () => {
    expect(() => calculateInflation(1000, NaN, 120)).toThrow();
    expect(() => calculateInflation(NaN, 100, 120)).toThrow();
    expect(() => calculateInflation(1000, 100, NaN)).toThrow();
  });

  it('TEST 6: Infinity Handling', () => {
    expect(() => calculateInflation(1000, Infinity, 120)).toThrow();
    expect(() => calculateInflation(1000, 100, Infinity)).toThrow();
  });

  it('TEST 7: 0 Başlangıç Endeksi', () => {
    expect(() => calculateInflation(1000, 0, 120)).toThrow();
  });

  it('TEST 8: Zod Schema Negatif Değer', () => {
    const schema = inflationCalculatorDef.schema;
    expect(schema.safeParse({ startAmount: -100, startIndex: 100, endIndex: 120 }).success).toBe(false);
    expect(schema.safeParse({ startAmount: 1000, startIndex: -10, endIndex: 120 }).success).toBe(false);
    expect(schema.safeParse({ startAmount: 1000, startIndex: 100, endIndex: -5 }).success).toBe(false);
    expect(schema.safeParse({ startAmount: 1000, startIndex: 100, endIndex: 120 }).success).toBe(true);
  });
});
