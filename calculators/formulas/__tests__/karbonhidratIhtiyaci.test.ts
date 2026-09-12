import { describe, it, expect } from 'vitest';
import { calculateKarbonhidratIhtiyaci } from '../karbonhidratIhtiyaci';

describe('Karbonhidrat Ihtiyaci Calculator', () => {
  it('should calculate ranges for low activity', () => {
    // 60 kg, Low -> 3-5 g/kg -> 180-300g
    const res = calculateKarbonhidratIhtiyaci({ kilo: 60, aktiviteSeviyesi: 'Düşük' });
    expect(res.primaryResult).toBe('180 - 300 gram/gün');
    expect(res.secondaryResults['Kullanılan Katsayı (g/kg)']).toBe('3 - 5 g/kg');
    expect(res.secondaryResults['Kalori Karşılığı']).toBe('720 - 1200 kcal/gün');
  });

  it('should calculate ranges for very high activity', () => {
    // 70 kg, Very High -> 8-12 g/kg -> 560-840g
    const res = calculateKarbonhidratIhtiyaci({ kilo: 70, aktiviteSeviyesi: 'Çok Yüksek (Dayanıklılık Sporcusu)' });
    expect(res.primaryResult).toBe('560 - 840 gram/gün');
  });

  it('should throw on out of bounds weight', () => {
    expect(() => calculateKarbonhidratIhtiyaci({ kilo: 10, aktiviteSeviyesi: 'Düşük' })).toThrow();
  });
});
