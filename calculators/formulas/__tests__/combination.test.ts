import { calculateCombination } from '../combination';
import { describe, it, expect } from 'vitest';

describe('Kombinasyon (BigInt) Calculator', () => {
  it('should compute C(0,0) = 1', () => {
    expect(calculateCombination(0, 0).primaryResult).toBe('1');
  });

  it('should compute C(5,0) = 1', () => {
    expect(calculateCombination(5, 0).primaryResult).toBe('1');
  });

  it('should compute C(5,1) = 5', () => {
    expect(calculateCombination(5, 1).primaryResult).toBe('5');
  });

  it('should compute C(5,2) = 10', () => {
    expect(calculateCombination(5, 2).primaryResult).toBe('10');
  });

  it('should compute C(5,5) = 1', () => {
    expect(calculateCombination(5, 5).primaryResult).toBe('1');
  });

  it('should compute C(10,3) = 120', () => {
    expect(calculateCombination(10, 3).primaryResult).toBe('120');
  });

  it('should compute C(52,5) = 2598960 (large value)', () => {
    expect(calculateCombination(52, 5).primaryResult).toBe('2598960');
  });

  it('should be symmetric: C(n,r) == C(n,n-r)', () => {
    expect(calculateCombination(10, 3).primaryResult).toBe(calculateCombination(10, 7).primaryResult);
  });

  it('should throw when r > n', () => {
    expect(() => calculateCombination(3, 5)).toThrow();
  });

  it('should throw on negative inputs', () => {
    expect(() => calculateCombination(-1, 0)).toThrow();
    expect(() => calculateCombination(5, -1)).toThrow();
  });

  it('should throw on decimal inputs', () => {
    expect(() => calculateCombination(5.5, 2)).toThrow();
    expect(() => calculateCombination(5, 1.5)).toThrow();
  });
});