import { describe, it, expect } from 'vitest';
import { calculateLiseOrtalama } from '../liseOrtalama';

describe('Lise Ortalama Calculator', () => {
  it('should calculate weighted average correctly', () => {
    const inputs = {
      dersler: [
        { puan: 80, saat: 4 }, // 320
        { puan: 90, saat: 2 }  // 180
      ] // total 500 / 6 = 83.3333
    };
    const res = calculateLiseOrtalama(inputs);
    expect(res.primaryResult).toBe('83.3333');
    expect(res.secondaryResults['Tahmini Belge Durumu']).toContain('Teşekkür');
  });

  it('should grant Takdir for >= 85', () => {
    const inputs = {
      dersler: [
        { puan: 100, saat: 4 },
        { puan: 90, saat: 2 }
      ]
    };
    const res = calculateLiseOrtalama(inputs);
    expect(res.secondaryResults['Tahmini Belge Durumu']).toContain('Takdir');
  });

  it('should handle zero hours (ignore them)', () => {
    const inputs = {
      dersler: [
        { puan: 100, saat: 4 },
        { puan: 50, saat: 0 }
      ]
    };
    const res = calculateLiseOrtalama(inputs);
    expect(res.primaryResult).toBe('100.0000'); // only 100*4 is counted
  });

  it('should throw on all zero hours', () => {
    expect(() => calculateLiseOrtalama({ dersler: [{ puan: 100, saat: 0 }] })).toThrow();
  });

  it('should throw on invalid points', () => {
    expect(() => calculateLiseOrtalama({ dersler: [{ puan: 105, saat: 2 }] })).toThrow();
    expect(() => calculateLiseOrtalama({ dersler: [{ puan: -5, saat: 2 }] })).toThrow();
  });
});
