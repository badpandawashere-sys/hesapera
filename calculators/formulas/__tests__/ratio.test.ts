import { calculateRatio } from '../ratio';
import { describe, it, expect } from 'vitest';

describe('Ratio Formula', () => {
  it('should calculate ratio correctly', () => {
    const result = calculateRatio(20, 100);
    expect(result.primaryResult).toBe(0.2);
    expect(result.secondaryResults['Yüzde Karşılığı']).toBe('%20');
  });
});