import { calculateGold } from '../gold';
import { describe, it, expect } from 'vitest';
import { MarketQuote } from '../../../lib/market-data/types';

describe('Gold Calculator (ID20 Live Data Logic)', () => {
  const mockQuote: MarketQuote = {
    symbol: 'GRAM-ALTIN',
    name: 'Gram Altın',
    buyPrice: 3000,
    sellPrice: 3100,
    currency: 'TRY',
    source: 'Truncgil',
    fetchedAt: '2026-09-10T12:00:00Z'
  };

  it('TEST 1: to_cash -> Uses BUY price', () => {
    // 10 adet * 3000 (buyPrice) = 30000 TL
    const res = calculateGold('to_cash', 'Gram Altın', 10, 0, mockQuote);
    const val = parseFloat(res.primaryResult.replace(/[^0-9,-]/g, '').replace(',', '.'));
    expect(val).toBeCloseTo(30000, 2);
    expect(res.secondaryResults?.['Kullanılan Kur (Alış)']?.includes('3.000')).toBe(true);
    expect(res.infoReference?.description).toContain('Truncgil');
  });
  
  it('TEST 2: to_gold -> Uses SELL price', () => {
    // 62000 TL / 3100 (sellPrice) = 20 adet
    const res = calculateGold('to_gold', 'Gram Altın', 0, 62000, mockQuote);
    const val = parseFloat(res.primaryResult.replace(/[^0-9,-]/g, '').replace(',', '.'));
    expect(val).toBeCloseTo(20, 2);
    expect(res.secondaryResults?.['Kullanılan Kur (Satış)']?.includes('3.100')).toBe(true);
  });

  it('TEST 3: Ondalıklı miktar (to_cash)', () => {
    // 1.5 miktar * 3000 = 4500 TL
    const res = calculateGold('to_cash', 'Gram Altın', 1.5, 0, mockQuote);
    const val = parseFloat(res.primaryResult.replace(/[^0-9,-]/g, '').replace(',', '.'));
    expect(val).toBeCloseTo(4500, 2);
  });

  it('TEST 4: NaN Handling (Hatalı Fiyat)', () => {
    const invalidQuote = { ...mockQuote, buyPrice: NaN, sellPrice: NaN };
    expect(() => calculateGold('to_cash', 'Gram Altın', 10, 0, invalidQuote)).toThrow(/al.nam.yor/);
  });
});
