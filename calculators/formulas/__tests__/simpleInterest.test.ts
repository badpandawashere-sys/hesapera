import { calculateSimpleInterest } from '../simpleInterest';
import { describe, it, expect } from 'vitest';

describe('Simple Interest Calculator', () => {
  it('should calculate correctly for standard inputs', () => {
    const result = calculateSimpleInterest(1000, 10, 2);
    // 1000 * 10% * 2 = 200 interest. Total 1200
    expect(result.primaryResult).toContain('1.200');
    expect(result.secondaryResults['Faiz Tutarı']).toContain('200');
  });

  it('should calculate zero interest', () => {
    const result = calculateSimpleInterest(1000, 0, 2);
    expect(result.primaryResult).toContain('1.000');
    expect(result.secondaryResults['Faiz Tutarı']).toContain('0');
  });

  it('should calculate decimal rates and durations', () => {
    const result = calculateSimpleInterest(1000, 5.5, 2.5);
    // 1000 * 5.5% * 2.5 = 137.5
    expect(result.primaryResult).toContain('1.137,5');
  });

  it('should calculate large values securely', () => {
    const result = calculateSimpleInterest(1000000000, 10, 1);
    expect(result.primaryResult).toContain('1.100.000.000');
  });
});