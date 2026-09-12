import { describe, it, expect } from 'vitest';
import { calculateAlan } from '../alan';

describe('Alan Calculator', () => {
  it('should calculate Kare correctly', () => {
    const res = calculateAlan({ sekil: 'Kare', birim: 'cm', kenarA: 5 });
    expect(res.primaryResult).toBe('25 cm²');
  });

  it('should calculate Dikdörtgen correctly', () => {
    const res = calculateAlan({ sekil: 'Dikdörtgen', birim: 'm', kenarA: 4, kenarB: 5 });
    expect(res.primaryResult).toBe('20 m²');
  });

  it('should calculate Üçgen correctly', () => {
    const res = calculateAlan({ sekil: 'Üçgen', birim: 'mm', taban: 10, yukseklik: 5 });
    expect(res.primaryResult).toBe('25 mm²');
  });

  it('should calculate Daire correctly', () => {
    const res = calculateAlan({ sekil: 'Daire', birim: 'cm', yaricap: 10 });
    // PI * 100 = 314.1593
    expect(res.primaryResult).toBe('314.1593 cm²');
  });

  it('should throw if missing dimension', () => {
    expect(() => calculateAlan({ sekil: 'Kare', birim: 'cm', kenarA: 0 })).toThrow();
  });
});
