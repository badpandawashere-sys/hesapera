import { calculateCapitalDividend } from '../capitalDividend';
import { describe, it, expect } from 'vitest';

describe('Capital & Dividend Calculator', () => {
  it('should calculate by rate correctly', () => {
    // capital 100000, 1000 shares, 10% rate
    // nominal = 100
    // total div = 10000
    // div per share = 10
    const res = calculateCapitalDividend(100000, 1000, 'by_rate', 10, 0);
    expect(res.primaryResult.includes('10')).toBe(true);
    expect(res.secondaryResults['Hisse Başına Nominal Değer'].includes('100')).toBe(true);
  });
  
  it('should calculate by amount correctly', () => {
    // capital 100000, 1000 shares, 15000 amount -> rate 15%
    const res = calculateCapitalDividend(100000, 1000, 'by_amount', 0, 15000);
    expect(res.secondaryResults['Temettü Oranı'].includes('15.0000')).toBe(true);
    expect(res.primaryResult.includes('15')).toBe(true);
  });
});