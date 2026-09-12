import { calculateDus } from '../dus';
import { describe, it, expect } from 'vitest';

describe('DUS Calculator', () => {
  it('should calculate max score for all correct', () => {
    const res = calculateDus(80, 0, 120, 0);
    expect(res.primaryResult).toBe('100.000');
  });

  it('should throw error if temel exceeds max', () => {
    expect(() => calculateDus(81, 0, 0, 0)).toThrow();
  });

  it('should calculate correct weighted nets', () => {
    // Temel: 40 net, Klinik: 60 net
    const res = calculateDus(40, 0, 60, 0);
    // Weighted net = 40*0.4 + 60*0.6 = 16 + 36 = 52
    expect(res.secondaryResults['Ağırlıklı Net']).toBe('52.00');
  });
});