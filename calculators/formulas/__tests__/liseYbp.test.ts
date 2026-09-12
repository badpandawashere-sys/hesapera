import { describe, it, expect } from 'vitest';
import { calculateLiseYbp } from '../liseYbp';

describe('Lise YBP Calculator', () => {
  it('should calculate weighted YBP correctly', () => {
    const res = calculateLiseYbp({
      dersler: [
        { puan: 80, saat: 4 }, // 320
        { puan: 90, saat: 2 }  // 180
      ] // 500 / 6 = 83.3333
    });
    expect(res.primaryResult).toBe('83.3333');
    expect(res.secondaryResults['Toplam Ders Saati']).toBe('6');
  });

  it('should throw on negative points or zero hours', () => {
    expect(() => calculateLiseYbp({ dersler: [{ puan: 50, saat: 0 }] })).toThrow();
    expect(() => calculateLiseYbp({ dersler: [{ puan: -10, saat: 2 }] })).toThrow();
    expect(() => calculateLiseYbp({ dersler: [{ puan: 105, saat: 2 }] })).toThrow();
  });

  it('should throw on empty array', () => {
    expect(() => calculateLiseYbp({ dersler: [] })).toThrow();
  });
});
