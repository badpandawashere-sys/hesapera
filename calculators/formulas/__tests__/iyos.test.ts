import { calculateIyos } from '../iyos';
import { describe, it, expect } from 'vitest';

describe('İYÖS Calculator', () => {
  it('should give 100 for all correct', () => {
    const res = calculateIyos(50, 0, 50, 0);
    expect(res.primaryResult).toBe('100.000');
  });

  it('should give base 50 for all blank', () => {
    const res = calculateIyos(0, 0, 0, 0);
    expect(res.primaryResult).toBe('50.000');
  });

  it('should throw for exceeding GY limit', () => {
    expect(() => calculateIyos(51, 0, 0, 0)).toThrow();
  });

  it('should correctly compute nets', () => {
    // GY: 40D 4Y → net 40-1=39; Hukuk: 20D 0Y → net 20
    const res = calculateIyos(40, 4, 20, 0);
    expect(res.secondaryResults['Genel Yetenek Net']).toBe('39.00');
    expect(res.secondaryResults['Hukuk Net']).toBe('20.00');
  });
});