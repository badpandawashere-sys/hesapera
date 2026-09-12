import { describe, it, expect } from 'vitest';
import { calculateAlan } from '../alan';

describe('Alan Calculator', () => {
  it('should calculate Kare correctly (5 -> 25)', () => {
    const res = calculateAlan({ sekil: 'Kare', birim: 'cm', kenarA: 5 });
    expect(res.primaryResult).toBe('25 cm²');
  });

  it('should calculate Dikdörtgen correctly (10x4 -> 40)', () => {
    const res = calculateAlan({ sekil: 'Dikdörtgen', birim: 'm', kenarA: 10, kenarB: 4 });
    expect(res.primaryResult).toBe('40 m²');
  });

  it('should calculate Üçgen correctly (10x6 -> 30)', () => {
    const res = calculateAlan({ sekil: 'Üçgen', birim: 'mm', taban: 10, yukseklik: 6 });
    expect(res.primaryResult).toBe('30 mm²');
  });

  it('should calculate Paralelkenar correctly (8x5 -> 40)', () => {
    const res = calculateAlan({ sekil: 'Paralelkenar', birim: 'cm', taban: 8, yukseklik: 5 });
    expect(res.primaryResult).toBe('40 cm²');
  });

  it('should calculate Yamuk correctly (10, 6, 4 -> 32)', () => {
    const res = calculateAlan({ sekil: 'Yamuk', birim: 'm', taban: 10, ustTaban: 6, yukseklik: 4 });
    expect(res.primaryResult).toBe('32 m²');
  });

  it('should calculate Daire correctly (r=5 -> 78,5398)', () => {
    const res = calculateAlan({ sekil: 'Daire', birim: 'cm', yaricap: 5 });
    // PI * 25 = 78.539816...
    expect(res.primaryResult).toContain('78,5398');
  });

  it('should calculate Elips correctly (a=5, b=3 -> 47,1239)', () => {
    const res = calculateAlan({ sekil: 'Elips', birim: 'cm', buyukYaricap: 5, kucukYaricap: 3 });
    // PI * 15 = 47.123889...
    expect(res.primaryResult).toContain('47,1239');
  });

  it('should throw if missing dimension', () => {
    expect(() => calculateAlan({ sekil: 'Dikdörtgen', birim: 'cm', kenarA: 5 })).toThrow();
  });

  it('should throw on negative or zero dimensions', () => {
    expect(() => calculateAlan({ sekil: 'Kare', birim: 'cm', kenarA: 0 })).toThrow();
    expect(() => calculateAlan({ sekil: 'Kare', birim: 'cm', kenarA: -5 })).toThrow();
  });
});
