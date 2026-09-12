import { calculateAverageCost } from '../averageCost';
import { describe, it, expect } from 'vitest';

describe('Average Cost Formula', () => {
  it('should calculate average cost correctly', () => {
    const items = [
      { quantity: 100, unitPrice: 20 },
      { quantity: 200, unitPrice: 25 }
    ];
    const result = calculateAverageCost(items);
    // 2000 + 5000 = 7000 / 300 = 23.333...
    expect(result.primaryResult).toBeCloseTo(23.333, 3);
    expect(result.secondaryResults['Toplam Miktar']).toBe(300);
    expect(result.secondaryResults['Toplam Maliyet']).toBe(7000);
  });
});