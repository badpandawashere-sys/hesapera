import { describe, it, expect } from 'vitest';
import { calculateLiseDersPuani } from '../liseDersPuani';

describe('Lise Ders Puanı Calculator', () => {
  it('should calculate arithmetic mean correctly', () => {
    const inputs = {
      notlar: [
        { tur: 'Yazılı 1', not: 40 },
        { tur: 'Yazılı 2', not: 60 },
        { tur: 'Performans', not: 80 }
      ]
    };
    const res = calculateLiseDersPuani(inputs);
    expect(res.primaryResult).toBe('60.00'); // (40+60+80) / 3 = 60
    expect(res.secondaryResults['Ders Başarı Durumu']).toBe('Başarılı');
  });

  it('should filter out empty notes and calculate correctly', () => {
    const inputs = {
      notlar: [
        { tur: 'Yazılı 1', not: 100 },
        { tur: 'Yazılı 2', not: -1 }, // Should be ignored if we handle it or throw. Wait, formula throws on negative if it is parsed, actually filter handles it: `filter(n => n >= 0 && n <= 100)`. So -1 is filtered out.
        { tur: 'Performans', not: 50 }
      ]
    };
    const res = calculateLiseDersPuani(inputs);
    expect(res.primaryResult).toBe('75.00'); // (100+50) / 2 = 75
    expect(res.secondaryResults['Hesaba Katılan Not Sayısı']).toBe('2');
  });

  it('should determine failing grade correctly', () => {
    const inputs = {
      notlar: [
        { tur: 'Yazılı', not: 40 },
        { tur: 'Performans', not: 40 }
      ]
    };
    const res = calculateLiseDersPuani(inputs);
    expect(res.primaryResult).toBe('40.00');
    expect(res.secondaryResults['Ders Başarı Durumu']).toBe('Başarısız');
  });

  it('should throw error when no valid notes provided', () => {
    expect(() => calculateLiseDersPuani({ notlar: [] })).toThrow();
    expect(() => calculateLiseDersPuani({ notlar: [{ tur: 'Yazılı', not: 105 }] })).toThrow(); // 105 filtered, empty remaining
  });
});
