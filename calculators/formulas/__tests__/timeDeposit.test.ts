import { calculateTimeDeposit } from '../timeDeposit';
import { describe, it, expect } from 'vitest';

describe('Time Deposit Calculator', () => {
  it('should calculate gross, tax, and net correctly for days', () => {
    // 100000, 36.5% interest, 30 days, 10% tax
    // Gross = 100000 * 0.365 * 30 / 365 = 3000
    // Tax = 3000 * 0.10 = 300
    // Net = 2700
    const res = calculateTimeDeposit(100000, 36.5, 'days', 30, 10);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(Math.round(numValue)).toBe(2700);
    expect(res.secondaryResults['Brüt Faiz Getirisi'].includes('3.000')).toBe(true);
    expect(res.secondaryResults['Hesaplamaya Esas Gün'].includes('30 Gün')).toBe(true);
  });
  
  it('should handle months conversion correctly', () => {
    // 1 month -> 30 days
    const res = calculateTimeDeposit(100000, 36.5, 'months', 1, 10);
    expect(res.secondaryResults['Hesaplamaya Esas Gün'].includes('30 Gün')).toBe(true);
  });
  
  it('should calculate with zero tax', () => {
    const res = calculateTimeDeposit(1000, 10, 'days', 365, 0);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(Math.round(numValue)).toBe(100);
  });
});