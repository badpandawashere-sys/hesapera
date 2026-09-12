import { calculateTahvil } from '../tahvil';
import { describe, it, expect } from 'vitest';

describe('Bond Calculator', () => {
  it('should calculate bond price correctly when yield equals coupon', () => {
    // Nominal=1000, Coupon=10%, Freq=1, Vade=3, Yield=10% -> Price=1000
    const res = calculateTahvil(1000, 10, '1', 3, 10);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(Math.round(numValue)).toBe(1000);
    expect(res.secondaryResults['Tahvil Durumu'].includes('Başa Baş')).toBe(true);
  });
  
  it('should calculate premium bond', () => {
    // Yield < Coupon -> Premium
    const res = calculateTahvil(1000, 10, '1', 3, 8);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(numValue).toBeGreaterThan(1000);
    expect(res.secondaryResults['Tahvil Durumu'].includes('Primli')).toBe(true);
  });
  
  it('should calculate discount bond', () => {
    // Yield > Coupon -> Discount
    const res = calculateTahvil(1000, 10, '1', 3, 12);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(numValue).toBeLessThan(1000);
    expect(res.secondaryResults['Tahvil Durumu'].includes('İskontolu')).toBe(true);
  });
  
  it('should support yield = 0', () => {
    const res = calculateTahvil(1000, 10, '1', 3, 0);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(Math.round(numValue)).toBe(1300); // 1000 + 3*100
  });
});