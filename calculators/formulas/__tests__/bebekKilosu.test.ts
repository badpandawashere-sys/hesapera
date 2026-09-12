import { describe, it, expect } from 'vitest';
import { calculateBebekKilosu } from '../bebekKilosu';

describe('Bebek Kilosu Calculator', () => {
  it('should compare with exact median', () => {
    // 6 ay erkek median = 7.9
    const res = calculateBebekKilosu({ cinsiyet: 'Erkek', yasAy: 6, mevcutKilo: 7.9 });
    expect(res.primaryResult).toBe('7.9 kg');
    expect(res.secondaryResults['WHO Referans Medyanı (50. Persentil)']).toBe('7.9 kg');
    expect(res.notes[0]).toBe('WHO medyan değerine çok yakın.');
  });

  it('should show below median text', () => {
    // 12 ay kız median = 8.9
    const res = calculateBebekKilosu({ cinsiyet: 'Kız', yasAy: 12, mevcutKilo: 7.0 });
    expect(res.primaryResult).toBe('7.0 kg');
    expect(res.notes[0]).toBe('WHO medyan değerinin yaklaşık 1.9 kg altında.');
  });

  it('should show above median text', () => {
    // 0 ay erkek median = 3.3
    const res = calculateBebekKilosu({ cinsiyet: 'Erkek', yasAy: 0, mevcutKilo: 4.5 });
    expect(res.notes[0]).toBe('WHO medyan değerinin yaklaşık 1.2 kg üzerinde.');
  });

  it('should throw on out of bounds', () => {
    expect(() => calculateBebekKilosu({ cinsiyet: 'Erkek', yasAy: 25, mevcutKilo: 10 })).toThrow();
    expect(() => calculateBebekKilosu({ cinsiyet: 'Erkek', yasAy: -1, mevcutKilo: 10 })).toThrow();
    expect(() => calculateBebekKilosu({ cinsiyet: 'Erkek', yasAy: 6, mevcutKilo: 0 })).toThrow();
  });
});
