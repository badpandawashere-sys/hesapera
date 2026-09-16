import { describe, expect, it } from 'vitest';
import { calcModA, calcModB, calcModC, YAKIT_TUKETIMI_LIMITS } from '../yakitTuketimi';
import { yakitTuketimiCalculatorDef as definition } from '../../definitions/yakitTuketimi';
import { CalculatorEngine } from '../../core/calculator-engine';
import { CalculatorRegistry } from '../../core/calculator-registry';
import '../../core/init';
import sitemap from '@/app/sitemap';

describe('Yakıt tüketimi pure formulas', () => {
  it('A: calculates TL/km and TL/100 km without requiring a litre price', () => {
    const result = calcModA(543, 142);
    expect(result.tlPerKm).toBeCloseTo(3.82394366, 8);
    expect(result.tlPer100Km).toBeCloseTo(382.394366, 6);
    expect(result.primaryResult).toBe('3,82 TL / km');
    expect(result.secondaryResults['100 km Maliyeti']).toBe('382,39 TL / 100 km');
    expect(result.liters).toBeUndefined();
    expect(result.litersPer100Km).toBeUndefined();
  });

  it('A: adds optional litre results without changing cost results', () => {
    const result = calcModA(543, 142, 45.5);
    expect(result.liters).toBeCloseTo(11.934065934, 8);
    expect(result.litersPer100Km).toBeCloseTo(8.404271784, 8);
    expect(result.tlPerKm).toBeCloseTo(3.82394366, 8);
    expect(result.secondaryResults['100 km Yakıt Tüketimi']).toBe('8,40 L / 100 km');
  });

  it('B: divides budget by TL/km', () => {
    const result = calcModB(1200, 3.2);
    expect(result.distance).toBe(375);
    expect(result.primaryResult).toBe('375,00 km');
  });

  it('C: multiplies distance by TL/km, retaining fractional kilometres', () => {
    const result = calcModC(142.5, 3.2);
    expect(result.totalCost).toBe(456);
    expect(result.primaryResult).toBe('456,00 TL');
  });

  it.each([0, -1, NaN, Infinity, -Infinity])('rejects %s in every numeric position', invalid => {
    expect(() => calcModA(invalid, 142)).toThrow();
    expect(() => calcModA(543, invalid)).toThrow();
    expect(() => calcModA(543, 142, invalid)).toThrow();
    expect(() => calcModB(invalid, 3.2)).toThrow();
    expect(() => calcModB(1200, invalid)).toThrow();
    expect(() => calcModC(invalid, 3.2)).toThrow();
    expect(() => calcModC(142, invalid)).toThrow();
  });

  it('rejects arithmetic overflow and underflow even with finite positive inputs', () => {
    expect(() => calcModA(543, Number.MIN_VALUE)).toThrow();
    expect(() => calcModA(543, 142, Number.MIN_VALUE)).toThrow();
    expect(() => calcModB(1200, Number.MIN_VALUE)).toThrow();
    expect(() => calcModC(Number.MIN_VALUE, Number.MIN_VALUE)).toThrow();
  });
});

const cases = [
  { mod: 'A', paidAmount: 543, distance: 142, fuelPrice: 45.5 },
  { mod: 'B', budget: 1200, costPerKm: 3.2 },
  { mod: 'C', distance: 142.5, costPerKm: 3.2 },
] as const;

describe('Yakıt tüketimi definition and engine', () => {
  it.each(cases)('executes mode $mod through the existing engine', async input => {
    const result = await CalculatorEngine.runBySlug(definition.slug, input);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ mod: input.mod });
    expect(result.data?.primaryResult).toBe(
      input.mod === 'A' ? '3,82 TL / km' : input.mod === 'B' ? '375,00 km' : '456,00 TL',
    );
  });

  it.each(cases)('validates every active field and exact upper bounds in mode $mod', async input => {
    for (const field of Object.keys(input).filter(key => key !== 'mod')) {
      const max = YAKIT_TUKETIMI_LIMITS[field as keyof typeof YAKIT_TUKETIMI_LIMITS];
      expect(definition.fields.find(item => item.id === field)?.max).toBe(max);
      expect(definition.schema.safeParse({ ...input, [field]: max }).success).toBe(true);
      expect(definition.schema.safeParse({ ...input, [field]: 0.01 }).success).toBe(true);
      for (const value of [0, -1, NaN, Infinity, -Infinity, max + 0.01, '12', null]) {
        const result = await CalculatorEngine.runBySlug(definition.slug, { ...input, [field]: value });
        expect(result.success).toBe(false);
        expect(result.errors?.some(error => error.startsWith(`${field}:`))).toBe(true);
        expect(result.data).toBeUndefined();
      }
      expect(() => definition.calculate({ ...input, [field]: max + 1 })).toThrow();
    }
  });

  it('accepts absent optional fuel price, but rejects missing required fields and invalid modes', async () => {
    expect((await CalculatorEngine.runBySlug(definition.slug, { mod: 'A', paidAmount: 543, distance: 142 })).success).toBe(true);
    for (const input of [{}, { mod: 'D' }, { mod: 'A', paidAmount: 543 }, { mod: 'B', budget: 1200 }, { mod: 'C', distance: 142 }]) {
      expect((await CalculatorEngine.runBySlug(definition.slug, input)).success).toBe(false);
    }
  });

  it('returns a controlled engine error for arithmetic overflow', async () => {
    const result = await CalculatorEngine.runBySlug(definition.slug, { mod: 'B', budget: 1200, costPerKm: Number.MIN_VALUE });
    expect(result.success).toBe(false);
    expect(result.errors).toEqual(['Değerler hesaplanabilir sayı aralığının dışında.']);
  });

  it('is published in the registry, otomotiv category and sitemap', () => {
    expect(CalculatorRegistry.getBySlug(definition.slug)?.status).toBe('published');
    expect(CalculatorRegistry.getUiCategory(definition.slug, definition.category)).toBe('otomotiv');
    expect(CalculatorRegistry.getPublishedAll().map(item => item.slug)).toContain(definition.slug);
    expect(CalculatorRegistry.getPublishedByCategory('otomotiv').map(item => item.slug)).toContain(definition.slug);
    expect(sitemap().map(item => item.url)).toContain(definition.metadata.canonical);
  });
});
