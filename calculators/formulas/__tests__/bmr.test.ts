import { describe, it, expect } from 'vitest';
import { calculateBmr } from '../bmr';

describe('BMR Calculator', () => {
  it('should calculate BMR for male correctly (Mifflin-St Jeor)', () => {
    // 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780
    const res = calculateBmr({ cinsiyet: 'Erkek', yas: 30, boy: 180, kilo: 80 });
    expect(res.primaryResult).toBe('1780 kcal/gün');
  });

  it('should calculate BMR for female correctly', () => {
    // 10 * 60 + 6.25 * 160 - 5 * 25 - 161 = 600 + 1000 - 125 - 161 = 1314
    const res = calculateBmr({ cinsiyet: 'Kadın', yas: 25, boy: 160, kilo: 60 });
    expect(res.primaryResult).toBe('1314 kcal/gün');
  });

  it('should throw on out of bounds', () => {
    expect(() => calculateBmr({ cinsiyet: 'Erkek', yas: 0, boy: 180, kilo: 80 })).toThrow();
    expect(() => calculateBmr({ cinsiyet: 'Erkek', yas: 30, boy: 40, kilo: 80 })).toThrow();
    expect(() => calculateBmr({ cinsiyet: 'Erkek', yas: 30, boy: 180, kilo: 10 })).toThrow();
  });
});
