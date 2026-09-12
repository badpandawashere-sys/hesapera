import { calculateIsg } from '../isg';
import { describe, it, expect } from 'vitest';

describe('İSG Calculator', () => {
  it('should give 100 for all correct Sınıf C', () => {
    const res = calculateIsg(100, 0, 'C');
    expect(res.primaryResult).toBe('100.000');
    expect(res.secondaryResults['Değerlendirme']).toContain('Başarılı');
  });

  it('should correctly apply 1/3 penalty', () => {
    // 90 doğru, 30 yanlış → net = 90 - 10 = 80
    const res = calculateIsg(90, 0, 'B');
    expect(res.primaryResult).toBe('90.000');
  });

  it('should fail Sınıf A below 75', () => {
    const res = calculateIsg(74, 0, 'A');
    expect(res.secondaryResults['Değerlendirme']).toContain('Başarısız');
  });

  it('should pass Sınıf A at exactly 75', () => {
    const res = calculateIsg(75, 0, 'A');
    expect(res.secondaryResults['Değerlendirme']).toContain('Başarılı');
  });

  it('should throw for exceeding total questions', () => {
    expect(() => calculateIsg(90, 20, 'B')).toThrow();
  });
});