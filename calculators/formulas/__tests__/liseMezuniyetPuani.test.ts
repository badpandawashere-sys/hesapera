import { describe, it, expect } from 'vitest';
import { calculateLiseMezuniyetPuani } from '../liseMezuniyetPuani';

describe('Lise Mezuniyet Puanı Calculator', () => {
  it('should calculate graduation score and OBP correctly', () => {
    const inputs = {
      yillar: [
        { yil: '9. Sınıf', puan: 80 },
        { yil: '10. Sınıf', puan: 90 },
        { yil: '11. Sınıf', puan: 100 }
      ]
    };
    const res = calculateLiseMezuniyetPuani(inputs);
    // (80+90+100) / 3 = 90
    expect(res.primaryResult).toBe('90.0000');
    // OBP = 90 * 5 = 450
    expect(res.secondaryResults['Tahmini OBP (Ortaöğretim Başarı Puanı)']).toBe('450.00');
  });

  it('should handle single year input', () => {
    const inputs = {
      yillar: [
        { yil: '12. Sınıf', puan: 70 }
      ]
    };
    const res = calculateLiseMezuniyetPuani(inputs);
    expect(res.primaryResult).toBe('70.0000');
    expect(res.secondaryResults['Tahmini OBP (Ortaöğretim Başarı Puanı)']).toBe('350.00'); // 70*5
  });

  it('should assign OBP as 250 for failing diploma scores (OSYM minimum)', () => {
    const inputs = {
      yillar: [
        { yil: '9. Sınıf', puan: 40 }
      ]
    };
    const res = calculateLiseMezuniyetPuani(inputs);
    expect(res.primaryResult).toBe('40.0000');
    // Diploma notu 50 altindaysa OSYM OBP'yi 50 diploma notu uzerinden (250) hesaplar.
    expect(res.secondaryResults['Tahmini OBP (Ortaöğretim Başarı Puanı)']).toBe('250.00');
  });

  it('should throw on invalid scores', () => {
    expect(() => calculateLiseMezuniyetPuani({ yillar: [] })).toThrow();
    expect(() => calculateLiseMezuniyetPuani({ yillar: [{ yil: '1', puan: 105 }] })).toThrow();
    expect(() => calculateLiseMezuniyetPuani({ yillar: [{ yil: '1', puan: -5 }] })).toThrow();
  });
});
