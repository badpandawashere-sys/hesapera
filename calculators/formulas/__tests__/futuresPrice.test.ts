import { calculateFuturesPrice } from '../futuresPrice';
import { describe, it, expect } from 'vitest';

describe('Futures Price Calculator', () => {
  it('should calculate without dividend correctly', () => {
    // Spot 1000, 20%, 90 days
    // Carry = 1000 * 0.20 * (90/365) = 49.315...
    // Futures = 1049.315...
    const res = calculateFuturesPrice(1000, 20, 90, 'none', 0, 0);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(numValue).toBeCloseTo(1049.315, 2);
  });
  
  it('should calculate with dividend rate', () => {
    // Carry = 49.315, DivRate 5% -> 1000 * 0.05 * (90/365) = 12.328...
    // Futures = 1000 + 49.315 - 12.328 = 1036.98...
    const res = calculateFuturesPrice(1000, 20, 90, 'rate', 5, 0);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(numValue).toBeCloseTo(1036.98, 1);
  });
  
  it('should calculate with dividend amount', () => {
    // Spot 100, faiz 0, divAmt 5 -> Futures = 95
    const res = calculateFuturesPrice(100, 0, 30, 'amount', 0, 5);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(Math.round(numValue)).toBe(95);
  });
});