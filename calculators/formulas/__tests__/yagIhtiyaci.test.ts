import { describe, it, expect } from 'vitest';
import { calculateYagIhtiyaci } from '../yagIhtiyaci';

describe('Yag Ihtiyaci Calculator', () => {
  it('should calculate fat correctly for 2000 kcal 30%', () => {
    // 2000 * 30 / 100 = 600 kcal
    // 600 / 9 = 66.67 => 67g
    const res = calculateYagIhtiyaci({ kaloriHedefi: 2000, yagYuzdesi: 30 });
    expect(res.primaryResult).toBe('67 gram / gün');
    expect(res.secondaryResults['Yağdan Gelen Enerji']).toBe('600 kcal');
  });

  it('should include warning if percentage is > 30', () => {
    const res = calculateYagIhtiyaci({ kaloriHedefi: 2000, yagYuzdesi: 40 });
    expect(res.notes.some(n => n.includes('DİKKAT: Seçtiğiniz oran'))).toBe(true);
  });

  it('should not include warning if percentage is in range', () => {
    const res = calculateYagIhtiyaci({ kaloriHedefi: 2000, yagYuzdesi: 25 });
    expect(res.notes.some(n => n.includes('DİKKAT: Seçtiğiniz oran'))).toBe(false);
  });

  it('should throw on out of bounds', () => {
    expect(() => calculateYagIhtiyaci({ kaloriHedefi: 200, yagYuzdesi: 30 })).toThrow();
    expect(() => calculateYagIhtiyaci({ kaloriHedefi: 2000, yagYuzdesi: 110 })).toThrow();
  });
});
