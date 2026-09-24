import { describe, it, expect } from 'vitest';
import { calculateLastikEbat } from '../lastikEbat';

describe('Lastik Ebat Calculator', () => {
  it('TEST 1 & 2 & 3: 205/55 R16 vs 225/45 R17', () => {
    const result = calculateLastikEbat({
      oldTire: { width: 205, aspectRatio: 55, rimInch: 16 },
      newTire: { width: 225, aspectRatio: 45, rimInch: 17 },
      indicatedSpeed: 100
    });

    // Test 1: Old tire stats
    expect(result.oldTireCalc.sidewallHeight).toBeCloseTo(112.75, 2);
    expect(result.oldTireCalc.rimDiameterMm).toBeCloseTo(406.4, 2);
    expect(result.oldTireCalc.overallDiameter).toBeCloseTo(631.9, 1);
    expect(result.oldTireCalc.circumference).toBeCloseTo(1985.17, 1);

    // Test 2: New tire stats
    expect(result.newTireCalc.sidewallHeight).toBeCloseTo(101.25, 2);
    expect(result.newTireCalc.rimDiameterMm).toBeCloseTo(431.8, 2);
    expect(result.newTireCalc.overallDiameter).toBeCloseTo(634.3, 1);
    
    // Test 3: Differences
    expect(result.diameterDifferencePercent).toBeCloseTo(0.38, 2);
    expect(result.rideHeightDifference).toBeCloseTo(1.2, 1);
    expect(result.actualSpeed).toBeCloseTo(100.38, 2);
  });

  it('TEST 4: Same size yields 0 diff and same speed', () => {
    const result = calculateLastikEbat({
      oldTire: { width: 205, aspectRatio: 55, rimInch: 16 },
      newTire: { width: 205, aspectRatio: 55, rimInch: 16 },
      indicatedSpeed: 100
    });

    expect(result.diameterDifferencePercent).toBeCloseTo(0, 2);
    expect(result.rideHeightDifference).toBeCloseTo(0, 2);
    expect(result.actualSpeed).toBeCloseTo(100, 2);
  });

  it('TEST 5: Larger tire yields higher actual speed', () => {
    const result = calculateLastikEbat({
      oldTire: { width: 205, aspectRatio: 55, rimInch: 16 },
      newTire: { width: 205, aspectRatio: 60, rimInch: 16 }, // larger sidewall
      indicatedSpeed: 100
    });
    
    expect(result.actualSpeed).toBeGreaterThan(100);
    expect(result.diameterDifferencePercent).toBeGreaterThan(0);
  });

  it('TEST 6: Smaller tire yields lower actual speed', () => {
    const result = calculateLastikEbat({
      oldTire: { width: 205, aspectRatio: 55, rimInch: 16 },
      newTire: { width: 205, aspectRatio: 50, rimInch: 16 }, // smaller sidewall
      indicatedSpeed: 100
    });
    
    expect(result.actualSpeed).toBeLessThan(100);
    expect(result.diameterDifferencePercent).toBeLessThan(0);
  });

  it('handles empty inputs gracefully', () => {
    const result = calculateLastikEbat({
      oldTire: { width: 0, aspectRatio: 0, rimInch: 0 },
      newTire: { width: 205, aspectRatio: 55, rimInch: 16 },
      indicatedSpeed: 100
    });
    expect(result.diameterDifferencePercent).toBe(0);
  });
});
