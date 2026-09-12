import { describe, it, expect } from 'vitest';
import { calculateIdealKilo } from '../idealKilo';

describe('Ideal Kilo Calculator', () => {
  it('should calculate for average male (180 cm)', () => {
    // 180 cm = 70.866 inches
    // over 5 feet (60 inches) = 10.866 inches
    // ideal = 50 + (2.3 * 10.866) = 50 + 24.99 = 74.99 = 75.0 kg
    const res = calculateIdealKilo({ cinsiyet: 'Erkek', boy: 180 });
    expect(res.primaryResult).toBe('75.0 kg');
    expect(res.secondaryResults['Kullanılan Formül']).toBe('Devine Formülü (1974)');
  });

  it('should calculate for average female (165 cm)', () => {
    // 165 cm = 64.96 inches
    // over 5 feet = 4.96 inches
    // ideal = 45.5 + (2.3 * 4.96) = 45.5 + 11.4 = 56.9 kg
    const res = calculateIdealKilo({ cinsiyet: 'Kadın', boy: 165 });
    expect(res.primaryResult).toBe('56.9 kg');
  });

  it('should calculate for under 5 feet (150 cm)', () => {
    // 150 cm = 59.055 inches
    // under 5 feet = 0.945 inches
    // ideal = 50 - (2.3 * 0.945) = 50 - 2.17 = 47.8 kg
    const res = calculateIdealKilo({ cinsiyet: 'Erkek', boy: 150 });
    expect(res.primaryResult).toBe('47.8 kg');
  });

  it('should throw on out of bounds height', () => {
    expect(() => calculateIdealKilo({ cinsiyet: 'Erkek', boy: 120 })).toThrow();
    expect(() => calculateIdealKilo({ cinsiyet: 'Erkek', boy: 260 })).toThrow();
  });
});
