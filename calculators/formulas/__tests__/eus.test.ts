import { calculateEus } from '../eus';
import { describe, it, expect } from 'vitest';

describe('EUS Calculator', () => {
  it('should calculate max score', () => {
    const res = calculateEus(60, 0, 60, 0);
    expect(res.primaryResult).toBe('100.000');
  });

  it('should calculate base 50 for zero nets', () => {
    const res = calculateEus(0, 0, 0, 0);
    expect(res.primaryResult).toBe('50.000');
  });

  it('should throw when exceeding max', () => {
    expect(() => calculateEus(61, 0, 0, 0)).toThrow();
  });
});