import { describe, it, expect } from 'vitest';
import { calculateLiseSinifGecme } from '../liseSinifGecme';

describe('Lise Sınıf Geçme Calculator (MEB 2026 Audit)', () => {
  it('should pass directly with 0 failed classes', () => {
    const inputs = {
      ozursuzDevamsizlik: 0,
      toplamDevamsizlik: 0,
      altSinifBasarisizDersSayisi: 0,
      dersler: [
        { puan: 80, saat: 4, isBaraj: false },
        { puan: 90, saat: 4, isBaraj: false }
      ]
    };
    const res = calculateLiseSinifGecme(inputs);
    expect(res.primaryResult).toBe('Doğrudan Geçti');
  });

  it('should pass directly with 1 failed class if YBP >= 50 and not baraj', () => {
    const inputs = {
      ozursuzDevamsizlik: 0,
      toplamDevamsizlik: 0,
      altSinifBasarisizDersSayisi: 0,
      dersler: [
        { puan: 100, saat: 4, isBaraj: false },
        { puan: 30, saat: 2, isBaraj: false } // YBP = (400 + 60) / 6 = 76.6
      ]
    };
    const res = calculateLiseSinifGecme(inputs);
    expect(res.primaryResult).toBe('Doğrudan Geçti');
  });

  it('should pass responsibly (Sorumlu) with 1 failed class if YBP >= 50 but it is a baraj class', () => {
    const inputs = {
      ozursuzDevamsizlik: 0,
      toplamDevamsizlik: 0,
      altSinifBasarisizDersSayisi: 0,
      dersler: [
        { puan: 100, saat: 4, isBaraj: false },
        { puan: 30, saat: 2, isBaraj: true }
      ]
    };
    const res = calculateLiseSinifGecme(inputs);
    expect(res.primaryResult).toBe('Sorumlu Geçti');
    expect(res.secondaryResults['Detaylı Durum']).toContain('baraj dersi olduğu için');
  });

  it('should pass responsibly with 2 failed classes and YBP >= 50', () => {
    const inputs = {
      ozursuzDevamsizlik: 0,
      toplamDevamsizlik: 0,
      altSinifBasarisizDersSayisi: 0,
      dersler: [
        { puan: 100, saat: 4, isBaraj: false },
        { puan: 100, saat: 4, isBaraj: false },
        { puan: 40, saat: 2, isBaraj: false },
        { puan: 40, saat: 2, isBaraj: false } // YBP = (800 + 160) / 12 = 80
      ]
    };
    const res = calculateLiseSinifGecme(inputs);
    expect(res.primaryResult).toBe('Sorumlu Geçti');
    expect(res.secondaryResults['Detaylı Durum']).toContain('birden fazla (2 veya 3) dersten başarısız');
  });

  it('should fail (Sınıf Tekrarı) with 4 failed classes if YBP < 50', () => {
    const inputs = {
      ozursuzDevamsizlik: 0,
      toplamDevamsizlik: 0,
      altSinifBasarisizDersSayisi: 0,
      dersler: [
        { puan: 40, saat: 4, isBaraj: false },
        { puan: 40, saat: 4, isBaraj: false },
        { puan: 40, saat: 4, isBaraj: false },
        { puan: 40, saat: 4, isBaraj: false },
        { puan: 40, saat: 4, isBaraj: false }
      ]
    };
    const res = calculateLiseSinifGecme(inputs);
    expect(res.primaryResult).toBe('Sınıf Tekrarı');
    expect(res.secondaryResults['Detaylı Durum']).toContain('başarısız olduğunuz ders sayısı 3\'ten fazla');
  });

  it('should pass responsibly with 3 failed classes if YBP < 50', () => {
    const inputs = {
      ozursuzDevamsizlik: 0,
      toplamDevamsizlik: 0,
      altSinifBasarisizDersSayisi: 0,
      dersler: [
        { puan: 40, saat: 4, isBaraj: false },
        { puan: 40, saat: 4, isBaraj: false },
        { puan: 40, saat: 4, isBaraj: false }, // 3 fails
        { puan: 50, saat: 4, isBaraj: false }  // YBP < 50
      ]
    };
    const res = calculateLiseSinifGecme(inputs);
    expect(res.primaryResult).toBe('Sorumlu Geçti');
    expect(res.secondaryResults['Bu Yılki Başarısız Ders Sayısı']).toBe('3');
  });

  it('should fail (Sınıf Tekrarı) if total failed classes > 6', () => {
    const inputs = {
      ozursuzDevamsizlik: 0,
      toplamDevamsizlik: 0,
      altSinifBasarisizDersSayisi: 6,
      dersler: [
        { puan: 100, saat: 4, isBaraj: false },
        { puan: 40, saat: 2, isBaraj: false } // 1 active fail + 6 old = 7
      ]
    };
    const res = calculateLiseSinifGecme(inputs);
    expect(res.primaryResult).toBe('Sınıf Tekrarı');
    expect(res.secondaryResults['Toplam Başarısız Ders Sayısı']).toBe('7');
    expect(res.secondaryResults['Detaylı Durum']).toContain('6\'dan fazla olduğu için sınıf tekrarı');
  });

  it('should fail (Sınıf Tekrarı) due to unexcused absences > 10', () => {
    const inputs = {
      ozursuzDevamsizlik: 11,
      toplamDevamsizlik: 15,
      altSinifBasarisizDersSayisi: 0,
      dersler: [{ puan: 100, saat: 4, isBaraj: false }]
    };
    const res = calculateLiseSinifGecme(inputs);
    expect(res.primaryResult).toBe('Sınıf Tekrarı');
    expect(res.secondaryResults['Detaylı Durum']).toContain('Devamsızlık sınırını aştınız');
  });

  it('should throw on invalid inputs', () => {
    expect(() => calculateLiseSinifGecme({ ozursuzDevamsizlik: -1, toplamDevamsizlik: 0, altSinifBasarisizDersSayisi: 0, dersler: [] })).toThrow();
  });
});
