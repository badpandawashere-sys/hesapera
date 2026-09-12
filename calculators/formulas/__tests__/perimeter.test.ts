import { describe, it, expect } from 'vitest';
import { calculatePerimeter } from '../perimeter';

describe('Çevre (Perimeter) Calculator', () => {
  it('should calculate Kare correctly (5 -> 20)', () => {
    const res = calculatePerimeter({ sekil: 'Kare', birim: 'cm', kenarA: 5 });
    expect(res.primaryResult).toBe('20 cm');
  });

  it('should calculate Dikdörtgen correctly (10x4 -> 28)', () => {
    const res = calculatePerimeter({ sekil: 'Dikdörtgen', birim: 'm', kenarA: 10, kenarB: 4 });
    expect(res.primaryResult).toBe('28 m');
  });

  it('should calculate Üçgen correctly (3,4,5 -> 12)', () => {
    const res = calculatePerimeter({ sekil: 'Üçgen', birim: 'cm', kenarA: 3, kenarB: 4, kenarC: 5 });
    expect(res.primaryResult).toBe('12 cm');
  });

  it('should calculate Paralelkenar correctly (8,5 -> 26)', () => {
    const res = calculatePerimeter({ sekil: 'Paralelkenar', birim: 'cm', kenarA: 8, kenarB: 5 });
    expect(res.primaryResult).toBe('26 cm');
  });

  it('should calculate Yamuk correctly (10,6,4,5 -> 25)', () => {
    const res = calculatePerimeter({ sekil: 'Yamuk', birim: 'm', kenarA: 10, kenarB: 6, kenarC: 4, kenarD: 5 });
    expect(res.primaryResult).toBe('25 m');
  });

  it('should calculate Daire correctly (r=5 -> ~31,4159)', () => {
    const res = calculatePerimeter({ sekil: 'Daire', birim: 'cm', yaricap: 5 });
    // 2 * PI * 5 = 31.4159265...
    expect(res.primaryResult).toContain('31,4159');
  });

  it('should format decimal correctly', () => {
    const res2 = calculatePerimeter({ sekil: 'Kare', birim: 'm', kenarA: 1.11111 });
    expect(res2.primaryResult).toContain('4,4444 m');
  });

  it('should throw on Kare kenar 0', () => {
    expect(() => calculatePerimeter({ sekil: 'Kare', birim: 'cm', kenarA: 0 })).toThrow();
  });

  it('should throw on Kare negatif kenar', () => {
    expect(() => calculatePerimeter({ sekil: 'Kare', birim: 'cm', kenarA: -5 })).toThrow();
  });

  it('should throw on Dikdörtgen eksik kenar', () => {
    expect(() => calculatePerimeter({ sekil: 'Dikdörtgen', birim: 'm', kenarA: 10 })).toThrow();
  });

  it('should throw on Üçgen eksik kenar', () => {
    expect(() => calculatePerimeter({ sekil: 'Üçgen', birim: 'cm', kenarA: 3, kenarB: 4 })).toThrow();
  });

  it('should throw on Geçersiz Üçgen (1, 2, 5)', () => {
    expect(() => calculatePerimeter({ sekil: 'Üçgen', birim: 'cm', kenarA: 1, kenarB: 2, kenarC: 5 })).toThrow();
  });

  it('should throw on Geçersiz Üçgen (2, 3, 6)', () => {
    expect(() => calculatePerimeter({ sekil: 'Üçgen', birim: 'cm', kenarA: 2, kenarB: 3, kenarC: 6 })).toThrow();
  });
});
