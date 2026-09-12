import { describe, it, expect } from 'vitest';
import { calculateBelKalcaOrani } from '../belKalcaOrani';

describe('Bel Kalca Orani Calculator', () => {
  it('should calculate ratio correctly', () => {
    const res = calculateBelKalcaOrani({ cinsiyet: 'Erkek', bel: 90, kalca: 100 });
    expect(res.primaryResult).toBe('0.90');
    expect(res.secondaryResults['Genel Risk Referansı']).toContain('Abdominal obezite riski');
  });

  it('should evaluate low risk correctly for female', () => {
    // Oran: 70 / 100 = 0.70 < 0.85
    const res = calculateBelKalcaOrani({ cinsiyet: 'Kadın', bel: 70, kalca: 100 });
    expect(res.primaryResult).toBe('0.70');
    expect(res.secondaryResults['Genel Risk Referansı']).toBe('Düşük/Normal risk');
  });

  it('should throw on out of bounds', () => {
    expect(() => calculateBelKalcaOrani({ cinsiyet: 'Erkek', bel: 0, kalca: 100 })).toThrow();
    expect(() => calculateBelKalcaOrani({ cinsiyet: 'Kadın', bel: 90, kalca: -10 })).toThrow();
  });
});
