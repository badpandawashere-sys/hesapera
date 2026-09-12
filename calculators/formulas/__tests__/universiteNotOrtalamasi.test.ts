import { describe, it, expect } from 'vitest';
import { calculateUniversiteNotOrtalamasi } from '../universiteNotOrtalamasi';

describe('Universite Not Ortalamasi Calculator', () => {
  it('should calculate Harf Sistemi correctly', () => {
    const res = calculateUniversiteNotOrtalamasi({
      hesaplamaSistemi: 'Harf Sistemi',
      dersler: [
        { kredi: 3, harfNotu: 'AA' }, // 4.0 * 3 = 12
        { kredi: 2, harfNotu: 'BB' }  // 3.0 * 2 = 6
      ] // total 18 / 5 = 3.60
    });
    expect(res.primaryResult).toBe('3.60');
    expect(res.secondaryResults['Değerlendirme Sistemi']).toContain('4 üzerinden');
  });

  it('should calculate 4 luk sistem correctly', () => {
    const res = calculateUniversiteNotOrtalamasi({
      hesaplamaSistemi: '4\'lük Sistem',
      dersler: [
        { kredi: 4, sayisalNot: 3.5 }, // 14
        { kredi: 1, sayisalNot: 2.0 }  // 2
      ] // total 16 / 5 = 3.20
    });
    expect(res.primaryResult).toBe('3.20');
  });

  it('should calculate 100 luk sistem correctly', () => {
    const res = calculateUniversiteNotOrtalamasi({
      hesaplamaSistemi: '100\'lük Sistem',
      dersler: [
        { kredi: 3, sayisalNot: 90 }, // 270
        { kredi: 3, sayisalNot: 80 }  // 240
      ] // 510 / 6 = 85.00
    });
    expect(res.primaryResult).toBe('85.00');
    expect(res.secondaryResults['Değerlendirme Sistemi']).toContain('100 üzerinden');
  });

  it('should ignore 0 credit classes in calculation but still count them if requested, actually 0 credit is skipped', () => {
    const res = calculateUniversiteNotOrtalamasi({
      hesaplamaSistemi: '4\'lük Sistem',
      dersler: [
        { kredi: 3, sayisalNot: 4.0 },
        { kredi: 0, sayisalNot: 1.0 } // ignored
      ]
    });
    expect(res.primaryResult).toBe('4.00');
    expect(res.secondaryResults['Hesaba Katılan Ders']).toBe('1');
  });

  it('should throw on invalid credits or inputs', () => {
    expect(() => calculateUniversiteNotOrtalamasi({ hesaplamaSistemi: 'Harf Sistemi', dersler: [] })).toThrow();
    // Invalid letter
    expect(() => calculateUniversiteNotOrtalamasi({ hesaplamaSistemi: 'Harf Sistemi', dersler: [{ kredi: 3, harfNotu: 'ZZ' }] })).toThrow();
    // Invalid numbers
    expect(() => calculateUniversiteNotOrtalamasi({ hesaplamaSistemi: '4\'lük Sistem', dersler: [{ kredi: 3, sayisalNot: 5 }] })).toThrow();
    expect(() => calculateUniversiteNotOrtalamasi({ hesaplamaSistemi: '100\'lük Sistem', dersler: [{ kredi: 3, sayisalNot: 105 }] })).toThrow();
    // No valid credits
    expect(() => calculateUniversiteNotOrtalamasi({ hesaplamaSistemi: '4\'lük Sistem', dersler: [{ kredi: 0, sayisalNot: 3 }] })).toThrow();
  });
});
