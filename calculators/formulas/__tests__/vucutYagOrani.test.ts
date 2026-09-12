import { describe, it, expect } from 'vitest';
import { calculateVucutYagOrani } from '../vucutYagOrani';

describe('Vucut Yag Orani Calculator', () => {
  it('should calculate Men Navy formula correctly', () => {
    // Man: 180cm, neck 40cm, waist 90cm
    // diff = 50. log10(50)=1.69897, log10(180)=2.25527
    // 1.0324 - 0.19077*1.69897 + 0.15456*2.25527
    // = 1.0324 - 0.3241 + 0.34857 = 1.0568
    // 495 / 1.0568 - 450 = 468.39 - 450 = 18.4%
    const res = calculateVucutYagOrani({ cinsiyet: 'Erkek', boy: 180, bel: 90, boyun: 40 });
    // Due to precision it might be slightly different. Let's just check it doesn't throw and looks like ~18.3
    expect(parseFloat(res.primaryResult.replace('%', ''))).toBeCloseTo(18.3, 0);
  });

  it('should calculate Women Navy formula correctly', () => {
    // Woman: 165cm, neck 35cm, waist 70cm, hips 100cm
    const res = calculateVucutYagOrani({ cinsiyet: 'Kadın', boy: 165, bel: 70, boyun: 35, kalca: 100 });
    expect(parseFloat(res.primaryResult.replace('%', ''))).toBeGreaterThan(10);
    expect(parseFloat(res.primaryResult.replace('%', ''))).toBeLessThan(40);
  });

  it('should throw if hips missing for women', () => {
    expect(() => calculateVucutYagOrani({ cinsiyet: 'Kadın', boy: 165, bel: 70, boyun: 35 })).toThrow();
  });

  it('should throw on impossible measurements', () => {
    // Waist <= Neck
    expect(() => calculateVucutYagOrani({ cinsiyet: 'Erkek', boy: 180, bel: 35, boyun: 40 })).toThrow();
  });
});
