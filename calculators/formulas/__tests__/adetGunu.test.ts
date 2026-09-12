import { describe, it, expect } from 'vitest';
import { calculateAdetGunu } from '../adetGunu';

describe('Adet Gunu Calculator', () => {
  it('should calculate next period and ovulation correctly for 28 days', () => {
    const res = calculateAdetGunu({ sonAdetTarihi: '2026-05-01', donguUzunlugu: 28 });
    expect(res.primaryResult).toBe('2026-05-29');
    expect(res.secondaryResults['Tahmini Yumurtlama Günü']).toBe('2026-05-15');
    expect(res.secondaryResults['Ondan Sonraki Beklenen Adet']).toBe('2026-06-26');
  });

  it('should calculate next period correctly across leap years (Feb 2024)', () => {
    const res = calculateAdetGunu({ sonAdetTarihi: '2024-02-15', donguUzunlugu: 28 });
    // 2024 is leap year, so Feb has 29 days.
    // 15 + 28 = 43. 43 - 29 = 14 March.
    expect(res.primaryResult).toBe('2024-03-14');
  });

  it('should throw on invalid dates or extreme cycles', () => {
    expect(() => calculateAdetGunu({ sonAdetTarihi: 'invalid-date', donguUzunlugu: 28 })).toThrow();
    expect(() => calculateAdetGunu({ sonAdetTarihi: '2026-05-01', donguUzunlugu: 10 })).toThrow(); // < 20
    expect(() => calculateAdetGunu({ sonAdetTarihi: '2026-05-01', donguUzunlugu: 50 })).toThrow(); // > 45
  });
});
