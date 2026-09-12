import { describe, it, expect } from 'vitest';
import { calculateProteinIhtiyaci } from '../proteinIhtiyaci';

describe('Protein Ihtiyaci Calculator', () => {
  it('should calculate sedanter range correctly', () => {
    // 70 kg, 0.83 to 1.0 => 58.1 -> 58 to 70
    const res = calculateProteinIhtiyaci({ kilo: 70, aktiviteSeviyesi: 'Sedanter (Hareketsiz)' });
    expect(res.primaryResult).toBe('58 - 70 gram/gün');
    expect(res.secondaryResults['Kullanılan Katsayı']).toBe('0.83 - 1 g/kg');
  });

  it('should calculate sporcu range correctly', () => {
    // 80 kg, 1.7 to 2.0 => 136 to 160
    const res = calculateProteinIhtiyaci({ kilo: 80, aktiviteSeviyesi: 'Sporcu (Güç/Dayanıklılık)' });
    expect(res.primaryResult).toBe('136 - 160 gram/gün');
  });

  it('should throw on out of bounds weight', () => {
    expect(() => calculateProteinIhtiyaci({ kilo: 10, aktiviteSeviyesi: 'Sedanter (Hareketsiz)' })).toThrow();
  });
});
