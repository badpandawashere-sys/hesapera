import { describe, it, expect } from 'vitest';
import { calculateInc } from '../inc';

describe('İnç Hesaplama Calculator', () => {
  it('should convert 1 inch to 2.54 cm', () => {
    const res = calculateInc({ miktar: 1, kaynakBirim: 'inch', hedefBirim: 'cm' });
    expect(res.primaryResult).toBe('2.54 cm');
  });

  it('should convert 10 inches to 25.4 cm', () => {
    const res = calculateInc({ miktar: 10, kaynakBirim: 'inch', hedefBirim: 'cm' });
    expect(res.primaryResult).toBe('25.4 cm');
  });

  it('should convert 2.54 cm to 1 inch', () => {
    const res = calculateInc({ miktar: 2.54, kaynakBirim: 'cm', hedefBirim: 'inch' });
    expect(res.primaryResult).toBe('1 inch');
  });

  it('should convert 25.4 cm to 10 inches', () => {
    const res = calculateInc({ miktar: 25.4, kaynakBirim: 'cm', hedefBirim: 'inch' });
    expect(res.primaryResult).toBe('10 inch');
  });

  it('should handle 0 correctly', () => {
    const res = calculateInc({ miktar: 0, kaynakBirim: 'inch', hedefBirim: 'cm' });
    expect(res.primaryResult).toBe('0 cm');
  });

  it('should throw on negative values', () => {
    expect(() => calculateInc({ miktar: -5, kaynakBirim: 'inch', hedefBirim: 'cm' })).toThrow();
  });

  it('should handle decimal input correctly', () => {
    const res = calculateInc({ miktar: 5.5, kaynakBirim: 'inch', hedefBirim: 'cm' });
    expect(res.primaryResult).toContain('13.97');
  });

  it('round-trip: inch → cm → inch should give original value', () => {
    const toCm = calculateInc({ miktar: 7, kaynakBirim: 'inch', hedefBirim: 'cm' });
    const cmVal = parseFloat(toCm.primaryResult);
    const backToInch = calculateInc({ miktar: cmVal, kaynakBirim: 'cm', hedefBirim: 'inch' });
    expect(parseFloat(backToInch.primaryResult)).toBeCloseTo(7, 5);
  });

  it('should return same value when source and target birim are equal', () => {
    const res = calculateInc({ miktar: 15, kaynakBirim: 'cm', hedefBirim: 'cm' });
    expect(res.primaryResult).toBe('15 cm');
  });
});
