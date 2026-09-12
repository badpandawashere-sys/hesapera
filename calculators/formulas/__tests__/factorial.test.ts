import { calculateFactorial } from '../factorial';
import { describe, it, expect } from 'vitest';
import { factorialCalculatorDef } from '../../definitions/factorial';

describe('ID30 Faktöriyel Hesaplama Formülü', () => {

  it('TEST 1: 0!', () => {
    const res = calculateFactorial(0);
    expect(res.primaryResult).toBe('1');
  });

  it('TEST 2: 1!', () => {
    const res = calculateFactorial(1);
    expect(res.primaryResult).toBe('1');
  });

  it('TEST 3: 5!', () => {
    const res = calculateFactorial(5);
    expect(res.primaryResult).toBe('120');
  });

  it('TEST 4: 10!', () => {
    const res = calculateFactorial(10);
    expect(res.primaryResult).toBe('3.628.800');
  });

  it('TEST 5: 20!', () => {
    const res = calculateFactorial(20);
    expect(res.primaryResult).toBe('2.432.902.008.176.640.000');
  });

  it('TEST 6: Ondalıklı sayı -> throw/reject', () => {
    expect(() => calculateFactorial(5.5)).toThrow();
  });

  it('TEST 7: Negatif sayı -> throw/reject', () => {
    expect(() => calculateFactorial(-5)).toThrow();
  });

  it('TEST 8: NaN -> throw/reject', () => {
    expect(() => calculateFactorial(NaN)).toThrow();
  });

  it('TEST 9: Infinity -> throw/reject', () => {
    expect(() => calculateFactorial(Infinity)).toThrow();
  });

  it('TEST 10: Eksik input / Undefined (TypeScript ile zorlansa da)', () => {
    // calculateFactorial beklenen değer number, ama logic olarak NaN dönebilir
    expect(() => calculateFactorial(undefined as any)).toThrow();
  });

  it('TEST 11: Büyük Sayı / Precision (21!)', () => {
    // 21! = 20! * 21 = 51.090.942.171.709.440.000
    const res = calculateFactorial(21);
    expect(res.primaryResult).toBe('51.090.942.171.709.440.000');
  });

  it('TEST 12: Zod Schema Validation', () => {
    const schema = factorialCalculatorDef.schema;
    expect(schema.safeParse({ n: 5 }).success).toBe(true);
    expect(schema.safeParse({ n: 0 }).success).toBe(true);
    
    // Geçersiz değerler
    expect(schema.safeParse({ n: -1 }).success).toBe(false);
    expect(schema.safeParse({ n: 5.5 }).success).toBe(false);
    expect(schema.safeParse({ n: NaN }).success).toBe(false);
    expect(schema.safeParse({ n: Infinity }).success).toBe(false);
    expect(schema.safeParse({ n: 2001 }).success).toBe(false);
    expect(schema.safeParse({ }).success).toBe(false);
  });
});
