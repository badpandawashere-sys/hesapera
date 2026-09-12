import { describe, it, expect } from 'vitest';
import { calculateTakdirTesekkur } from '../takdirTesekkur';

describe('Takdir Tesekkur Calculator', () => {
  it('should grant Takdir for Lise with >=85 and no issues', () => {
    const res = calculateTakdirTesekkur({
      egitimSeviyesi: 'Lise',
      donemOrtalamasi: 85.5,
      basarisizDersVarMi: false,
      ozursuzDevamsizlik: 3,
      disiplinCezasiVarMi: false
    });
    expect(res.primaryResult).toBe('Takdir Belgesi');
  });

  it('should grant Tesekkur for Lise with 70-84.99 and no issues', () => {
    const res = calculateTakdirTesekkur({
      egitimSeviyesi: 'Lise',
      donemOrtalamasi: 70.0,
      basarisizDersVarMi: false,
      ozursuzDevamsizlik: 5,
      disiplinCezasiVarMi: false
    });
    expect(res.primaryResult).toBe('Teşekkür Belgesi');
  });

  it('should reject Lise if devamsizlik > 5', () => {
    const res = calculateTakdirTesekkur({
      egitimSeviyesi: 'Lise',
      donemOrtalamasi: 95,
      basarisizDersVarMi: false,
      ozursuzDevamsizlik: 6,
      disiplinCezasiVarMi: false
    });
    expect(res.primaryResult).toBe('Belge Alamaz');
    expect(res.secondaryResults['Değerlendirme Nedeni']).toContain('5 günü aştığı için');
  });

  it('should reject Ortaokul if Turkce < 55', () => {
    const res = calculateTakdirTesekkur({
      egitimSeviyesi: 'Ortaokul',
      donemOrtalamasi: 85,
      basarisizDersVarMi: false, // Wait, if Turkce < 55 but they consider it passed (e.g. passing is 45 but doc needs 55)
      ozursuzDevamsizlik: 0,
      disiplinCezasiVarMi: false,
      turkceDersiNotu: 50
    });
    expect(res.primaryResult).toBe('Belge Alamaz');
    expect(res.secondaryResults['Değerlendirme Nedeni']).toContain('55.00\'in altında olan');
  });

  it('should reject if basarisiz ders exists or disiplin exists', () => {
    expect(calculateTakdirTesekkur({
      egitimSeviyesi: 'Lise', donemOrtalamasi: 90, basarisizDersVarMi: true, ozursuzDevamsizlik: 0, disiplinCezasiVarMi: false
    }).primaryResult).toBe('Belge Alamaz');

    expect(calculateTakdirTesekkur({
      egitimSeviyesi: 'Ortaokul', donemOrtalamasi: 90, basarisizDersVarMi: false, ozursuzDevamsizlik: 0, disiplinCezasiVarMi: true
    }).primaryResult).toBe('Belge Alamaz');
  });

  it('should throw on invalid inputs', () => {
    expect(() => calculateTakdirTesekkur({ egitimSeviyesi: 'Lise', donemOrtalamasi: 105, basarisizDersVarMi: false, ozursuzDevamsizlik: 0, disiplinCezasiVarMi: false })).toThrow();
  });
});
