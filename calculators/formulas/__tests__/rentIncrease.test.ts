import { calculateRentIncrease } from '../rentIncrease';
import { describe, it, expect } from 'vitest';

describe('Rent Increase Calculator', () => {
  it('should calculate new rent correctly', () => {
    // 10000, 25% -> 12500
    const res = calculateRentIncrease(10000, 25);
    expect(res.primaryResult.includes('12.500')).toBe(true);
    expect(res.secondaryResults['Artış Tutarı'].includes('2.500')).toBe(true);
  });
});