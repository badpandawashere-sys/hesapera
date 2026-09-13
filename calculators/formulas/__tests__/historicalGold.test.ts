import { calculateHistoricalGold } from '../historicalGold';
import { describe, it, expect } from 'vitest';

describe('Historical Gold Calculator', () => {
  it('to_cash: should calculate buy/sell values correctly for exact date', () => {
    // 26.01.2023 buy=1167.64, sell=1167.64
    // 100 gram -> 116764
    const res = calculateHistoricalGold('to_cash', 'gram', '2023-01-26', 100, 0);
    expect(res.secondaryResults['Kullanılan Tarih']).toBe('26.01.2023');
    expect(res.secondaryResults['Alış Fiyatı'].includes('1.167,64')).toBe(true);
    expect(res.secondaryResults['Alışa Göre Değer'].includes('116.764')).toBe(true);
    expect(res.primaryResult.includes('116.764')).toBe(true);
  });

  it('to_gold: should calculate buy/sell quantity correctly', () => {
    // 26.01.2023 buy=1167.64, sell=1167.64
    // 115796 cash -> 115796 / 1167.64 = ~99.1710
    const res = calculateHistoricalGold('to_gold', 'gram', '2023-01-26', 0, 115796);
    expect(res.secondaryResults['Alışa Göre Miktar'].includes('99,171')).toBe(true);
    expect(res.primaryResult.includes('99,171')).toBe(true);
  });

  it('should fallback forward to next available market record', () => {
    // 2024-01-06 is missing (weekend). Next is 2024-01-08 with sell = 1953.95.
    const res = calculateHistoricalGold('to_cash', 'gram', '2024-01-06', 10, 0);
    expect(res.primaryResult.includes('19.539,50')).toBe(true);
    expect(res.secondaryResults['Kullanılan Tarih']).toContain('İstenen tarih: 06.01.2024 — Bu tarihte veri yok. Sonraki ilk piyasa kaydı: 08.01.2024 kullanıldı.');
  });
  
  it('should correctly format breakdown archives', () => {
    // 2023-01-26 gram: low=1160.38, high=1178.63
    const res = calculateHistoricalGold('to_cash', 'gram', '2023-01-26', 10, 0);
    expect(res.breakdown[2].value.includes('1.160,38')).toBe(true); // low
    expect(res.breakdown[3].value.includes('1.178,63')).toBe(true); // high
  });
});