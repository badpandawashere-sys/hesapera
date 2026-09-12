import { calculateHakimSavciYardimciligi } from '../hakimSavcıYardımcılığı';
import { describe, it, expect } from 'vitest';

describe('Hakim Savcı Yardımcılığı Calculator', () => {
  it('should calculate max score for all correct (40 GY + 60 Hukuk)', () => {
    const res = calculateHakimSavciYardimciligi(40, 0, 60, 0);
    expect(res.primaryResult).toBe('100.000');
    expect(res.secondaryResults['Toplam Net']).toBe('100.00');
  });

  it('should give base 50 for all blank', () => {
    const res = calculateHakimSavciYardimciligi(0, 0, 0, 0);
    expect(res.primaryResult).toBe('50.000');
  });

  it('should throw for exceeding GY limit', () => {
    expect(() => calculateHakimSavciYardimciligi(41, 0, 0, 0)).toThrow();
  });

  it('should throw for exceeding hukuk limit', () => {
    expect(() => calculateHakimSavciYardimciligi(0, 0, 61, 0)).toThrow();
  });

  it('should correctly apply 0.25 penalty', () => {
    // 20 doğru, 4 yanlış → net = 20 - 1 = 19
    const res = calculateHakimSavciYardimciligi(20, 4, 0, 0);
    expect(res.secondaryResults['Genel Yetenek Net']).toBe('19.00');
  });
});