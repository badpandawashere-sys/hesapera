import { calculateFinancialDiscount } from '../financialDiscount';
import { describe, it, expect } from 'vitest';
import { financialDiscountCalculatorDef } from '../../definitions/financialDiscount';

describe('ID31 İç ve Dış İskonto Hesaplama Formülü', () => {

  it('TEST 1: Normal İç İskonto Hesabı (10000 TL, %12, 365 gün)', () => {
    // Peşin Değer = 10000 / (1 + 0.12 * (365/365)) = 10000 / 1.12 ≈ 8928.57
    const res = calculateFinancialDiscount({ discountType: 'inner', nominalValue: 10000, annualRate: 12, remainingDays: 365 });
    // Parse result and check
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,-]+/g, '').replace(',', '.'));
    expect(numValue).toBeCloseTo(8928.57, 1);
    expect(res.secondaryResults['Hesaplama Türü']).toBe('İç İskonto');
  });

  it('TEST 2: Normal Dış İskonto Hesabı (10000 TL, %12, 365 gün)', () => {
    // İskonto Tutarı = 10000 * 0.12 * 1 = 1200
    // Peşin Değer = 10000 - 1200 = 8800
    const res = calculateFinancialDiscount({ discountType: 'outer', nominalValue: 10000, annualRate: 12, remainingDays: 365 });
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,-]+/g, '').replace(',', '.'));
    expect(numValue).toBeCloseTo(8800, 1);
    expect(res.secondaryResults['Hesaplama Türü']).toBe('Dış İskonto');
  });

  it('TEST 3: Farklı vade/oran senaryosu (İç İskonto, 50000 TL, %20, 180 gün)', () => {
    const res = calculateFinancialDiscount({ discountType: 'inner', nominalValue: 50000, annualRate: 20, remainingDays: 180 });
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,-]+/g, '').replace(',', '.'));
    const expected = 50000 / (1 + 0.20 * (180 / 365));
    expect(numValue).toBeCloseTo(expected, 1);
  });

  it('TEST 4: Matematiksel olarak geçersiz kombinasyon (Dış İskonto - İskonto tutarı Nominali aşamaz)', () => {
    // %200 faiz, 365 gün
    // İskonto tutarı = 10000 * 2.0 * 1 = 20000
    // Peşin Değer = 10000 - 20000 = -10000
    expect(() => calculateFinancialDiscount({ discountType: 'outer', nominalValue: 10000, annualRate: 200, remainingDays: 365 })).toThrow();
  });

  it('TEST 5: Sınır değerler ve sıfır -> reject', () => {
    expect(() => calculateFinancialDiscount({ discountType: 'inner', nominalValue: 0, annualRate: 10, remainingDays: 90 })).toThrow();
    expect(() => calculateFinancialDiscount({ discountType: 'outer', nominalValue: 10000, annualRate: 0, remainingDays: 90 })).toThrow();
    expect(() => calculateFinancialDiscount({ discountType: 'inner', nominalValue: 10000, annualRate: 10, remainingDays: 0 })).toThrow();
  });

  it('TEST 6: Negatif değerler -> reject', () => {
    expect(() => calculateFinancialDiscount({ discountType: 'inner', nominalValue: -1000, annualRate: 10, remainingDays: 90 })).toThrow();
    expect(() => calculateFinancialDiscount({ discountType: 'outer', nominalValue: 10000, annualRate: -5, remainingDays: 90 })).toThrow();
  });

  it('TEST 7: NaN -> reject', () => {
    expect(() => calculateFinancialDiscount({ discountType: 'inner', nominalValue: NaN, annualRate: 10, remainingDays: 90 })).toThrow();
  });

  it('TEST 8: Infinity -> reject', () => {
    expect(() => calculateFinancialDiscount({ discountType: 'inner', nominalValue: 10000, annualRate: 10, remainingDays: Infinity })).toThrow();
  });

  it('TEST 9: Eksik input (Zod Schema) -> reject', () => {
    const schema = financialDiscountCalculatorDef.schema;
    // Missing fields
    expect(schema.safeParse({ discountType: 'inner', nominalValue: 10000 }).success).toBe(false);
  });

  it('TEST 10: Zod schema validasyon (Doğru ve hatalı type)', () => {
    const schema = financialDiscountCalculatorDef.schema;
    expect(schema.safeParse({ discountType: 'inner', nominalValue: 10000, annualRate: 15, remainingDays: 90 }).success).toBe(true);
    // Invalid type (wrong enum)
    expect(schema.safeParse({ discountType: 'invalid_type', nominalValue: 10000, annualRate: 15, remainingDays: 90 }).success).toBe(false);
  });
});
