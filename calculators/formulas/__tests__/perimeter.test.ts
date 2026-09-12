import { calculatePerimeter } from '../perimeter';
import { describe, it, expect } from 'vitest';

describe('Cevre Calculator', () => {
  it('should calculate Kare correctly', () => {
    const res = calculatePerimeter({ sekil: 'Kare', birim: 'cm', kenarA: 5 });
    expect(res.primaryResult).toBe('20 cm');
  });

  it('should calculate Dikdörtgen correctly', () => {
    const res = calculatePerimeter({ sekil: 'Dikdörtgen', birim: 'm', kenarA: 4, kenarB: 5 });
    expect(res.primaryResult).toBe('18 m');
  });

  it('should calculate Üçgen correctly', () => {
    const res = calculatePerimeter({ sekil: 'Üçgen', birim: 'mm', kenarA: 3, kenarB: 4, kenarC: 5 });
    expect(res.primaryResult).toBe('12 mm');
  });

  it('should calculate Daire correctly', () => {
    const res = calculatePerimeter({ sekil: 'Daire', birim: 'cm', yaricap: 10 });
    // 2 * Math.PI * 10 = 62.83185...
    expect(res.primaryResult).toContain('62.8319 cm');
  });

  it('should calculate Paralelkenar correctly', () => {
    const res = calculatePerimeter({ sekil: 'Paralelkenar', birim: 'm', kenarA: 5, kenarB: 10 });
    expect(res.primaryResult).toBe('30 m');
  });

  it('should calculate Yamuk correctly', () => {
    const res = calculatePerimeter({ sekil: 'Yamuk', birim: 'cm', kenarA: 3, kenarB: 4, kenarC: 5, kenarD: 6 });
    expect(res.primaryResult).toBe('18 cm');
  });
});