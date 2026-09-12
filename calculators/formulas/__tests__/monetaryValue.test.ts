import { calculateMonetaryValue } from '../monetaryValue';
import { describe, it, expect } from 'vitest';

describe('Monetary Value Calculator', () => {
  it('should calculate compound value correctly', () => {
    // 1000, 10%, 2 periods => 1210
    const res = calculateMonetaryValue(1000, 10, 2);
    expect(res.primaryResult.includes('1.210')).toBe(true);
  });
  
  it('should handle zero periods', () => {
    const res = calculateMonetaryValue(1000, 50, 0);
    expect(res.primaryResult.includes('1.000')).toBe(true);
  });
});