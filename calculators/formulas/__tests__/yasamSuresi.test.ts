import { describe, it, expect } from 'vitest';
import { calculateYasamSuresi } from '../yasamSuresi';

describe('Yasam Suresi Calculator (TUİK 2023-2025 Aggregate Lookup)', () => {
  it('should evaluate men correctly', () => {
    // 15 yaş erkek
    expect(calculateYasamSuresi({ cinsiyet: 'Erkek', yas: '15' }).primaryResult).toBe('62.1 Yıl');
    // 30 yaş erkek
    expect(calculateYasamSuresi({ cinsiyet: 'Erkek', yas: '30' }).primaryResult).toBe('47.8 Yıl');
    // 50 yaş erkek
    expect(calculateYasamSuresi({ cinsiyet: 'Erkek', yas: '50' }).primaryResult).toBe('29.0 Yıl');
    // 65 yaş erkek
    expect(calculateYasamSuresi({ cinsiyet: 'Erkek', yas: '65' }).primaryResult).toBe('16.7 Yıl');
  });

  it('should evaluate women correctly', () => {
    // 15 yaş kadın
    expect(calculateYasamSuresi({ cinsiyet: 'Kadın', yas: '15' }).primaryResult).toBe('67.3 Yıl');
    // 30 yaş kadın
    expect(calculateYasamSuresi({ cinsiyet: 'Kadın', yas: '30' }).primaryResult).toBe('52.7 Yıl');
    // 50 yaş kadın
    expect(calculateYasamSuresi({ cinsiyet: 'Kadın', yas: '50' }).primaryResult).toBe('33.4 Yıl');
    // 65 yaş kadın
    expect(calculateYasamSuresi({ cinsiyet: 'Kadın', yas: '65' }).primaryResult).toBe('20.0 Yıl');
  });

  it('should handle zero age', () => {
    expect(calculateYasamSuresi({ cinsiyet: 'Erkek', yas: '0' }).primaryResult).toBe('75.9 Yıl');
    expect(calculateYasamSuresi({ cinsiyet: 'Kadın', yas: '0' }).primaryResult).toBe('81.1 Yıl');
  });

  it('should throw on invalid age', () => {
    // @ts-expect-error invalid age testing
    expect(() => calculateYasamSuresi({ cinsiyet: 'Erkek', yas: '115' })).toThrow();
  });
});
