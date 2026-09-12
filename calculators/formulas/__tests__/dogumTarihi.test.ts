import { describe, it, expect } from 'vitest';
import { calculateDogumTarihi } from '../dogumTarihi';

describe('Dogum Tarihi Calculator', () => {
  it('should calculate age from birth date correctly (TarihtenYas)', () => {
    // 2020-05-15 to 2026-06-20 => 6 years, 1 month, 5 days
    const res = calculateDogumTarihi({
      hesaplamaYonu: 'TarihtenYas',
      dogumTarihi: '2020-05-15',
      referansTarihi: '2026-06-20'
    });
    expect(res.primaryResult).toBe('6 Yaşında');
    expect(res.secondaryResults['Detaylı Yaş']).toBe('6 yıl, 1 ay, 5 gün');
  });

  it('should handle leap years correctly (TarihtenYas)', () => {
    // Leap year birth 2020-02-29 to 2024-02-29
    const res = calculateDogumTarihi({
      hesaplamaYonu: 'TarihtenYas',
      dogumTarihi: '2020-02-29',
      referansTarihi: '2024-02-29'
    });
    expect(res.primaryResult).toBe('4 Yaşında');
    expect(res.secondaryResults['Detaylı Yaş']).toBe('4 yıl, 0 ay, 0 gün');
  });

  it('should calculate birth date from age correctly (YastanTarih)', () => {
    // 2026-06-20 minus 6 years, 1 month, 5 days
    const res = calculateDogumTarihi({
      hesaplamaYonu: 'YastanTarih',
      yil: 6,
      ay: 1,
      gun: 5,
      referansTarihi: '2026-06-20'
    });
    expect(res.primaryResult).toBe('2020-05-15');
  });

  it('should throw on future birth date', () => {
    expect(() => calculateDogumTarihi({
      hesaplamaYonu: 'TarihtenYas',
      dogumTarihi: '2027-01-01',
      referansTarihi: '2026-01-01'
    })).toThrow();
  });
});
