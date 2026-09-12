import { calculateCurrency } from '../currency';
import { currencyCalculatorDef } from '../../definitions/currency';
import { describe, it, expect } from 'vitest';
import { MarketQuote } from '../../../lib/market-data/types';

describe('Currency Calculator (ID24 Live Data Logic)', () => {
  const mockQuote: MarketQuote = {
    symbol: 'USD',
    name: 'USD',
    buyPrice: 40,
    sellPrice: 41,
    currency: 'TRY',
    source: 'Truncgil',
    fetchedAt: '2026-09-10T12:00:00Z'
  };

  it('TEST 1: to_try -> Uses BUY price', () => {
    // 100 USD * 40 (buyPrice) = 4000 TL
    const res = calculateCurrency('to_try', 'USD', 100, 0, mockQuote);
    const val = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(val).toBeCloseTo(4000, 2);
    expect(res.secondaryResults?.['Piyasa Kuru (Alış)']?.includes('40,0000')).toBe(true);
  });
  
  it('TEST 2: to_currency -> Uses SELL price', () => {
    // 8200 TL / 41 (sellPrice) = 200 USD
    const res = calculateCurrency('to_currency', 'USD', 0, 8200, mockQuote);
    const val = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(val).toBeCloseTo(200, 2);
    expect(res.secondaryResults?.['Piyasa Kuru (Satış)']?.includes('41,0000')).toBe(true);
  });

  it('TEST 3: Zod Schema Validation', () => {
    const schema = currencyCalculatorDef.schema;
    expect(schema.parse({ transactionType: 'to_try', currencyCode: 'USD', quantity: 100 }).quantity).toBe(100);
  });

  it('TEST 4: NaN Handling', () => {
    const invalidQuote = { ...mockQuote, buyPrice: NaN, sellPrice: NaN };
    expect(() => calculateCurrency('to_try', 'USD', 100, 0, invalidQuote)).toThrow(/alınamıyor/);
  });
});
