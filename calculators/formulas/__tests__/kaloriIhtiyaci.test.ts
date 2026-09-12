import { describe, it, expect } from 'vitest';
import { calculateKaloriIhtiyaci } from '../kaloriIhtiyaci';
import { calculateRawBmr } from '../bmr';

describe('Kalori Ihtiyaci (TDEE) Calculator', () => {
  it('should calculate TDEE correctly based on BMR', () => {
    // Male, 30 age, 180 cm, 80 kg. BMR = 1780. Activity: 1.2 => 2136
    const expectedBmr = calculateRawBmr('Erkek', 30, 180, 80);
    expect(expectedBmr).toBe(1780);

    const res = calculateKaloriIhtiyaci({
      cinsiyet: 'Erkek',
      yas: 30,
      boy: 180,
      kilo: 80,
      aktiviteFaktoru: 1.2
    });

    expect(res.primaryResult).toBe('2136 kcal/gün');
    expect(res.secondaryResults['Bazal Metabolizma (BMR)']).toBe('1780 kcal');
  });

  it('should identify activity levels correctly', () => {
    const res = calculateKaloriIhtiyaci({
      cinsiyet: 'Kadın',
      yas: 25,
      boy: 160,
      kilo: 60,
      aktiviteFaktoru: 1.55
    });
    expect(res.secondaryResults['Aktivite Seviyesi']).toBe('Orta Aktif');
  });

  it('should throw on invalid inputs', () => {
    expect(() => calculateKaloriIhtiyaci({ cinsiyet: 'Erkek', yas: -5, boy: 180, kilo: 80, aktiviteFaktoru: 1.2 })).toThrow();
  });
});
