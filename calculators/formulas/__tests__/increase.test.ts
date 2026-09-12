import { calculateIncrease } from '../increase';
import { describe, it, expect } from 'vitest';

describe('Increase Formula', () => {
  it('should calculate increase correctly', () => {
    const result = calculateIncrease(1000, 20);
    expect(result.primaryResult).toBe(1200);
    expect(result.secondaryResults['Zam Tutarı']).toBe(200);
  });
});