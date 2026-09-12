import { describe, it, expect } from 'vitest';
import { calculateOran } from '../oran';

describe('Oran Calculator', () => {
  it('should simplify 20:30 to 2:3', () => {
    const res = calculateOran({ a: 20, b: 30 });
    expect(res.primaryResult).toBe('2:3');
    expect(res.secondaryResults['Ortak Bölen (EBOB)']).toBe('10');
  });

  it('should simplify 2:4 to 1:2', () => {
    const res = calculateOran({ a: 2, b: 4 });
    expect(res.primaryResult).toBe('1:2');
  });

  it('should simplify 10:5 to 2:1', () => {
    const res = calculateOran({ a: 10, b: 5 });
    expect(res.primaryResult).toBe('2:1');
    expect(res.secondaryResults['Ondalık Değer (A/B)']).toBe('2');
  });

  it('should simplify 1:1 to 1:1', () => {
    const res = calculateOran({ a: 1, b: 1 });
    expect(res.primaryResult).toBe('1:1');
  });

  it('should handle large numbers safely', () => {
    const res = calculateOran({ a: 1000000, b: 500000 });
    expect(res.primaryResult).toBe('2:1');
  });

  it('should format decimal correctly for A/B', () => {
    const res = calculateOran({ a: 1, b: 3 });
    expect(res.secondaryResults['Ondalık Değer (A/B)']).toBe('0.3333');
  });

  it('should throw on zero or negative', () => {
    expect(() => calculateOran({ a: 0, b: 5 })).toThrow();
    expect(() => calculateOran({ a: 5, b: 0 })).toThrow();
    expect(() => calculateOran({ a: -2, b: 5 })).toThrow();
  });

  it('should throw on decimal inputs', () => {
    expect(() => calculateOran({ a: 2.5, b: 5 })).toThrow();
  });
});
