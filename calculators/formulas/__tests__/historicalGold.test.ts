import { calculateHistoricalGold } from '../historicalGold';
import { describe, it, expect } from 'vitest';

describe('Historical Gold Calculator', () => {
  it('should calculate historical gold to cash correctly', () => {
    // 2024-01-01 gram buy = 1950. 10 gram -> 19500
    const res = calculateHistoricalGold('to_cash', 'gram', '2024-01-01', 10, 0);
    expect(res.primaryResult.includes('19.500')).toBe(true);
  });
  
  it('should throw error for unsupported date', () => {
    expect(() => calculateHistoricalGold('to_cash', 'gram', '2023-01-01', 10, 0)).toThrow('Bu tarih için veri bulunamadı.');
  });
});