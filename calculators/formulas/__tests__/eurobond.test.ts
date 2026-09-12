import { calculateEurobond } from '../eurobond';
import { describe, it, expect } from 'vitest';

describe('Eurobond Calculator', () => {
  it('should calculate eurobond correctly and detect discount', () => {
    // 1000, 950, 10%, 2 freq, 2 years
    // periodic = 100/2 = 50. periods = 4. income = 200. total = 1200.
    const res = calculateEurobond(1000, 950, 10, '2', 2);
    expect(res.primaryResult.includes('1.200')).toBe(true);
    expect(res.secondaryResults['Fiyat Durumu']).toBe('İskontolu (Discount)');
  });
});