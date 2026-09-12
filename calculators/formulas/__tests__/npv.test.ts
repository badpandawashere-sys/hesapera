import { calculateNpv } from '../npv';
import { describe, it, expect } from 'vitest';

describe('NPV Calculator', () => {
  it('should calculate NPV correctly', () => {
    const cfs = [
      { period: 0, amount: -1000 },
      { period: 1, amount: 600 },
      { period: 2, amount: 600 }
    ];
    // NPV = -1000 + 600/1.1 + 600/1.21 = -1000 + 545.45 + 495.86 = 41.32...
    const res = calculateNpv(10, cfs);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,-]/g, '').replace(',', '.'));
    expect(numValue).toBeCloseTo(41.32, 1);
  });
});