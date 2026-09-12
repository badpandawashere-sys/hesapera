import { describe, it, expect } from 'vitest';
import { calculateSigaraMaliyeti } from '../sigaraMaliyeti';

describe('Sigara Maliyeti Calculator', () => {
  it('should calculate cost correctly', () => {
    // 10 a day, 50 try per pack of 20
    // packs per day = 0.5
    // daily = 25
    // monthly = 750
    // yearly = 9125
    const res = calculateSigaraMaliyeti({ gunlukAdet: 10, paketFiyati: 50, pakettekiAdet: 20 });
    // "₺750,00" (Depends on locale, so let's match the number inside)
    expect(res.primaryResult).toContain('750');
    expect(res.secondaryResults['Günlük Maliyet']).toContain('25');
    expect(res.secondaryResults['Yıllık Maliyet']).toContain('9.125');
  });

  it('should throw on negative/zero inputs', () => {
    expect(() => calculateSigaraMaliyeti({ gunlukAdet: 0, paketFiyati: 50 })).toThrow();
    expect(() => calculateSigaraMaliyeti({ gunlukAdet: 10, paketFiyati: -10 })).toThrow();
  });
});
