import { calculateInterest } from '../interest';
import { describe, it, expect } from 'vitest';
import { interestCalculatorDef } from '../../definitions/interest';

describe('ID27 Faiz Hesaplama Formülü', () => {

  it('TEST 1: Basit Faiz (100.000 TL, %20, 12 ay)', () => {
    const res = calculateInterest('simple', 100000, 20, 12, 'month');
    expect(res.primaryResult.includes('120.000,00')).toBe(true);
    expect(res.secondaryResults['Faiz Tutarı'].includes('20.000,00')).toBe(true);
    expect(res.secondaryResults['Faiz Türü']).toBe('Basit Faiz');
  });

  it('TEST 2: Basit Faiz (50.000 TL, %12, 6 ay)', () => {
    const res = calculateInterest('simple', 50000, 12, 6, 'month');
    expect(res.primaryResult.includes('53.000,00')).toBe(true);
    expect(res.secondaryResults['Faiz Tutarı'].includes('3.000,00')).toBe(true);
  });

  it('TEST 3: Bileşik Faiz (100.000 TL, %12, 12 ay, aylık bileşik)', () => {
    const res = calculateInterest('compound', 100000, 12, 12, 'month', '12');
    // 100000 * (1 + 0.12/12)^(12*1) = 100000 * (1.01)^12 ≈ 112682.50
    expect(res.primaryResult.includes('112.682,50')).toBe(true);
    expect(res.secondaryResults['Bileşikleşme Sıklığı']).toBe('Aylık');
  });

  it('TEST 4: Bileşik Faiz (100.000 TL, %12, 24 ay, yıllık bileşik)', () => {
    const res = calculateInterest('compound', 100000, 12, 24, 'month', '1');
    // 100000 * (1 + 0.12/1)^(1*2) = 100000 * 1.12^2 = 125440
    expect(res.primaryResult.includes('125.440,00')).toBe(true);
    expect(res.secondaryResults['Bileşikleşme Sıklığı']).toBe('Yıllık');
  });

  it('TEST 5: %0 faiz', () => {
    const res = calculateInterest('simple', 100000, 0, 12, 'month');
    expect(res.primaryResult.includes('100.000,00')).toBe(true);
    expect(res.secondaryResults['Faiz Tutarı'].includes('0,00')).toBe(true);
  });

  it('TEST 6: NaN', () => {
    expect(() => calculateInterest('simple', NaN, 20, 12, 'month')).toThrow();
  });

  it('TEST 7: Infinity', () => {
    expect(() => calculateInterest('simple', 100000, Infinity, 12, 'month')).toThrow();
  });

  it('TEST 8: Zod Schema Validation Negatif Değerler', () => {
    const schema = interestCalculatorDef.schema;
    expect(schema.safeParse({ calculationType: 'simple', principal: -100, annualRate: 10, term: 12, termUnit: 'month' }).success).toBe(false);
    expect(schema.safeParse({ calculationType: 'simple', principal: 100, annualRate: -10, term: 12, termUnit: 'month' }).success).toBe(false);
    expect(schema.safeParse({ calculationType: 'simple', principal: 100, annualRate: 10, term: -12, termUnit: 'month' }).success).toBe(false);
  });

  it('TEST 9: Bileşikleşme Sıklığı Validation', () => {
    const schema = interestCalculatorDef.schema;
    expect(schema.safeParse({ calculationType: 'compound', principal: 100, annualRate: 10, term: 12, termUnit: 'month' }).success).toBe(false); // Eksik
    expect(schema.safeParse({ calculationType: 'compound', principal: 100, annualRate: 10, term: 12, termUnit: 'month', compoundingFrequency: '99' }).success).toBe(false); // Geçersiz
    expect(schema.safeParse({ calculationType: 'compound', principal: 100, annualRate: 10, term: 12, termUnit: 'month', compoundingFrequency: '12' }).success).toBe(true); // Geçerli
  });
});
