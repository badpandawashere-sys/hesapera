import { describe, it, expect } from 'vitest';
import { calculateMakroBesin } from '../makroBesin';

describe('Makro Besin Calculator', () => {
  it('should calculate macros correctly for 2000 kcal 40/40/20', () => {
    // 2000 kcal
    // Pro: 40% = 800 kcal / 4 = 200g
    // Carb: 40% = 800 kcal / 4 = 200g
    // Fat: 20% = 400 kcal / 9 = 44.4g => 44g
    const res = calculateMakroBesin({
      kaloriHedefi: 2000,
      proteinYuzdesi: 40,
      karbonhidratYuzdesi: 40,
      yagYuzdesi: 20
    });

    expect(res.primaryResult).toBe('2000 kcal/gün');
    expect(res.secondaryResults['Protein (g)']).toBe('200 g (%40)');
    expect(res.secondaryResults['Karbonhidrat (g)']).toBe('200 g (%40)');
    expect(res.secondaryResults['Yağ (g)']).toBe('44 g (%20)');
  });

  it('should throw if percentages do not sum to 100', () => {
    expect(() => calculateMakroBesin({
      kaloriHedefi: 2000,
      proteinYuzdesi: 30,
      karbonhidratYuzdesi: 30,
      yagYuzdesi: 30
    })).toThrow('Makro yüzdelerinin toplamı tam 100 olmalıdır');
  });

  it('should throw on extreme calories', () => {
    expect(() => calculateMakroBesin({
      kaloriHedefi: 100,
      proteinYuzdesi: 40,
      karbonhidratYuzdesi: 40,
      yagYuzdesi: 20
    })).toThrow();
  });
});
