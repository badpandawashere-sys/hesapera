import { calculateEhliyetSinavi } from '../ehliyetSinavi';
import { describe, it, expect } from 'vitest';

describe('Ehliyet Sınavı Calculator', () => {
  it('should give 100 for all 50 correct', () => {
    const res = calculateEhliyetSinavi(50);
    expect(res.primaryResult).toBe('100.00');
    expect(res.secondaryResults['Değerlendirme']).toContain('Başarılı');
  });

  it('should give 70 for 35 correct and pass', () => {
    const res = calculateEhliyetSinavi(35);
    expect(res.primaryResult).toBe('70.00');
    expect(res.secondaryResults['Değerlendirme']).toContain('Başarılı');
  });

  it('should fail for 34 correct', () => {
    const res = calculateEhliyetSinavi(34);
    expect(res.primaryResult).toBe('68.00');
    expect(res.secondaryResults['Değerlendirme']).toContain('Başarısız');
  });

  it('should throw for invalid input', () => {
    expect(() => calculateEhliyetSinavi(-1)).toThrow();
    expect(() => calculateEhliyetSinavi(51)).toThrow();
  });
});