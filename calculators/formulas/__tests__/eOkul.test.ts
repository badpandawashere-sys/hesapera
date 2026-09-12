import { calculateEOkul } from '../eOkul';
import { describe, it, expect } from 'vitest';

describe('E-Okul Not Calculator', () => {
  it('should calculate term average with simple arithmetic means per course', () => {
    // Math: 4 hours. Notes: 80, 90, 100 -> avg 90
    // Physics: 2 hours. Notes: 50, 60 -> avg 55
    // Total weighted: (90*4 + 55*2) / 6 = (360 + 110) / 6 = 470 / 6 = 78.3333
    const dersler = [
      { haftalikSaat: 4, sinav1: 80, sinav2: 90, performans1: 100 },
      { haftalikSaat: 2, sinav1: 50, sinav2: 60 }
    ];
    
    const res = calculateEOkul(dersler, 'ortaogretim');
    expect(res.primaryResult).toBe('78.3333');
    expect(res.secondaryResults['Toplam Ders Saati']).toBe('6');
    expect(res.secondaryResults['Tahmini Belge Durumu']).toContain('Tesekkur');
  });

  it('should ignore empty courses or courses without notes', () => {
    const dersler = [
      { haftalikSaat: 4, sinav1: 100 },
      { haftalikSaat: 2 } // no notes
    ];
    
    const res = calculateEOkul(dersler, 'ortaogretim');
    expect(res.primaryResult).toBe('100.0000');
    expect(res.secondaryResults['Toplam Ders Saati']).toBe('4');
  });

  it('should grant Takdir Belgesi if > 85', () => {
    const dersler = [{ haftalikSaat: 4, sinav1: 90, sinav2: 100 }];
    const res = calculateEOkul(dersler, 'ortaogretim');
    expect(res.primaryResult).toBe('95.0000');
    expect(res.secondaryResults['Tahmini Belge Durumu']).toContain('Takdir');
  });

  it('should throw on > 100 or no valid courses', () => {
    expect(() => calculateEOkul([], 'ortaogretim')).toThrow();
    expect(() => calculateEOkul([{ haftalikSaat: 2, sinav1: 105 }], 'ortaogretim')).toThrow();
    expect(() => calculateEOkul([{ haftalikSaat: 0, sinav1: 50 }], 'ortaogretim')).toThrow();
  });
});
