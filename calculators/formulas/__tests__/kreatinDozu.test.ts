import { describe, it, expect } from 'vitest';
import { calculateKreatinDozu } from '../kreatinDozu';

describe('Kreatin Dozu Calculator', () => {
  it('should calculate loading phase correctly', () => {
    // 80 kg * 0.3 = 24g
    const res = calculateKreatinDozu({ kilo: 80, yasGrup: 'Yetişkin', protokol: 'Yükleme (Loading)' });
    expect(res.primaryResult).toBe('24.0 gram/gün');
    expect(res.secondaryResults['Protokol Tipi']).toBe('5-7 gün boyunca yükleme');
  });

  it('should calculate maintenance phase correctly', () => {
    // Standard adult maintenance is usually 3-5g. We just output "3 - 5 gram/gün" for normal weights.
    const res = calculateKreatinDozu({ kilo: 80, yasGrup: 'Yetişkin', protokol: 'Koruma (Maintenance)' });
    expect(res.primaryResult).toBe('3 - 5 gram/gün');
  });

  it('should add warning for under 18', () => {
    const res = calculateKreatinDozu({ kilo: 60, yasGrup: '18 Yaş Altı', protokol: 'Koruma (Maintenance)' });
    expect(res.notes.some(n => n.includes('18 yaş altı'))).toBe(true);
  });

  it('should adjust maintenance for heavy individuals', () => {
    const res = calculateKreatinDozu({ kilo: 110, yasGrup: 'Yetişkin', protokol: 'Koruma (Maintenance)' });
    expect(res.primaryResult).toBe('5 - 8 gram/gün');
  });

  it('should throw on out of bounds weight', () => {
    expect(() => calculateKreatinDozu({ kilo: 10, yasGrup: 'Yetişkin', protokol: 'Yükleme (Loading)' })).toThrow();
  });
});
