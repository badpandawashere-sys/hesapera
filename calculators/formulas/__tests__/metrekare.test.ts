import { calculateMetrekare } from '../metrekare';
import { describe, it, expect } from 'vitest';
import { metrekareCalculatorDef } from '../../definitions/metrekare';

describe('ID28 Metrekare Hesaplama Formülü', () => {
  it('TEST 1: Normal değer (5m x 4m)', () => {
    const res = calculateMetrekare(5, 4, 'm');
    expect(res.primaryResult).toBe('20 m²');
    expect(res.secondaryResults['Uzunluk']).toBe('5 m');
    expect(res.secondaryResults['Genişlik']).toBe('4 m');
  });

  it('TEST 2: Kare alan (5m x 5m)', () => {
    const res = calculateMetrekare(5, 5, 'm');
    expect(res.primaryResult).toBe('25 m²');
  });

  it('TEST 3: Ondalıklı değer (5.5m x 4.2m)', () => {
    const res = calculateMetrekare(5.5, 4.2, 'm');
    // 5.5 * 4.2 = 23.1
    expect(res.primaryResult).toBe('23,1 m²');
  });

  it('TEST 4: Çok küçük değer (0.05m x 0.05m)', () => {
    const res = calculateMetrekare(0.05, 0.05, 'm');
    // 0.05 * 0.05 = 0.0025
    expect(res.primaryResult).toBe('0,0025 m²');
  });

  it('TEST 5: Santimetre cinsinden değerler (500cm x 400cm)', () => {
    const res = calculateMetrekare(500, 400, 'cm');
    // 5m * 4m = 20
    expect(res.primaryResult).toBe('20 m²');
    expect(res.secondaryResults['Uzunluk']).toBe('5 m');
  });

  it('TEST 6: Validation (0)', () => {
    expect(() => calculateMetrekare(0, 4, 'm')).toThrow();
    expect(() => calculateMetrekare(5, 0, 'm')).toThrow();
  });

  it('TEST 7: Validation (Negatif)', () => {
    expect(() => calculateMetrekare(-5, 4, 'm')).toThrow();
    expect(() => calculateMetrekare(5, -4, 'm')).toThrow();
  });

  it('TEST 8: Validation (NaN)', () => {
    expect(() => calculateMetrekare(NaN, 4, 'm')).toThrow();
    expect(() => calculateMetrekare(5, NaN, 'm')).toThrow();
  });

  it('TEST 9: Validation (Infinity)', () => {
    expect(() => calculateMetrekare(Infinity, 4, 'm')).toThrow();
    expect(() => calculateMetrekare(5, Infinity, 'm')).toThrow();
  });

  it('TEST 10: Zod Schema Validation', () => {
    const schema = metrekareCalculatorDef.schema;
    expect(schema.safeParse({ uzunluk: 5, genislik: 4, birim: 'm' }).success).toBe(true);
    expect(schema.safeParse({ uzunluk: -5, genislik: 4, birim: 'm' }).success).toBe(false);
    expect(schema.safeParse({ uzunluk: 0, genislik: 4, birim: 'm' }).success).toBe(false);
    expect(schema.safeParse({ uzunluk: 5, genislik: NaN, birim: 'm' }).success).toBe(false);
  });
});
