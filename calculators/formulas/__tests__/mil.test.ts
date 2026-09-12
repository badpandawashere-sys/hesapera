import { calculateMil } from '../mil';
import { describe, it, expect } from 'vitest';
import { milCalculatorDef } from '../../definitions/mil';

describe('ID29 Mil Hesaplama Formülü', () => {

  it('TEST 1: 1 mil -> 1.609344 km', () => {
    const res = calculateMil(1, 'mil');
    expect(res.primaryResult.includes('1,609344')).toBe(true);
  });

  it('TEST 2: 10 mil -> 16.09344 km', () => {
    const res = calculateMil(10, 'mil');
    expect(res.primaryResult.includes('16,09344')).toBe(true);
  });

  it('TEST 3: 1 km -> ~0.6213711922 mil', () => {
    const res = calculateMil(1, 'km');
    expect(res.primaryResult.includes('0,621371')).toBe(true);
  });

  it('TEST 4: 1 metre -> ~0.0006213711922 mil', () => {
    const res = calculateMil(1, 'm');
    expect(res.primaryResult.includes('0,000621')).toBe(true);
  });

  it('TEST 5: 0 değer', () => {
    const res = calculateMil(0, 'mil');
    expect(res.primaryResult.includes('0 mi = 0 km')).toBe(true);
    expect(res.secondaryResults['Kilometre (km)'].includes('0')).toBe(true);
  });

  it('TEST 6: ondalıklı değer (1.5 mil)', () => {
    const res = calculateMil(1.5, 'mil');
    expect(res.primaryResult.includes('2,414016')).toBe(true); // 1.5 * 1.609344 = 2.414016
  });

  it('TEST 7: negatif değer -> throw/reject', () => {
    expect(() => calculateMil(-10, 'mil')).toThrow();
    expect(() => calculateMil(-1, 'km')).toThrow();
  });

  it('TEST 8: NaN -> throw/reject', () => {
    expect(() => calculateMil(NaN, 'mil')).toThrow();
  });

  it('TEST 9: Infinity -> throw/reject', () => {
    expect(() => calculateMil(Infinity, 'mil')).toThrow();
  });

  it('TEST 10: Zod Schema Validation', () => {
    const schema = milCalculatorDef.schema;
    expect(schema.safeParse({ miktar: 10, birim: 'mil' }).success).toBe(true);
    expect(schema.safeParse({ miktar: 10, birim: 'km' }).success).toBe(true);
    expect(schema.safeParse({ miktar: 10, birim: 'm' }).success).toBe(true);
    expect(schema.safeParse({ miktar: -5, birim: 'mil' }).success).toBe(false);
    expect(schema.safeParse({ miktar: NaN, birim: 'mil' }).success).toBe(false);
    expect(schema.safeParse({ miktar: 10, birim: 'invalid' }).success).toBe(false);
  });
});
