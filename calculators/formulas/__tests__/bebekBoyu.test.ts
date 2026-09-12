import { describe, it, expect } from 'vitest';
import { calculateBebekBoyu } from '../bebekBoyu';

describe('Bebek Boyu Calculator', () => {
  it('should calculate boy for male', () => {
    // (165 + 180 + 13) / 2 = 358 / 2 = 179
    const res = calculateBebekBoyu({ cinsiyet: 'Erkek', anneBoyu: 165, babaBoyu: 180 });
    expect(res.primaryResult).toBe('179.0 cm');
    expect(res.secondaryResults['Beklenen Hedef Boy Aralığı']).toBe('174.0 cm - 184.0 cm');
  });

  it('should calculate boy for female', () => {
    // (165 + 180 - 13) / 2 = 332 / 2 = 166
    const res = calculateBebekBoyu({ cinsiyet: 'Kız', anneBoyu: 165, babaBoyu: 180 });
    expect(res.primaryResult).toBe('166.0 cm');
    expect(res.secondaryResults['Beklenen Hedef Boy Aralığı']).toBe('161.0 cm - 171.0 cm');
  });

  it('should throw on out of bounds', () => {
    expect(() => calculateBebekBoyu({ cinsiyet: 'Erkek', anneBoyu: 80, babaBoyu: 180 })).toThrow();
    expect(() => calculateBebekBoyu({ cinsiyet: 'Erkek', anneBoyu: 165, babaBoyu: 250 })).toThrow();
  });
});
