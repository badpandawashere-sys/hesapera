import { HistoricalCurrencyRateProvider } from '../providers/historical-currency-rate-provider';
import { CurrencyRate } from '../providers/currency-rate-provider';

// Base is USD to TRY
const mockRatesToTry: Record<string, Record<string, number>> = {
  'USD': {
    '2024-01-01': 29.5,
    '2024-06-01': 32.2,
    '2025-01-01': 35.4
  },
  'EUR': {
    '2024-01-01': 32.4,
    '2024-06-01': 34.9,
    '2025-01-01': 36.7
  }
};

export class MockHistoricalCurrencyRateProvider implements HistoricalCurrencyRateProvider {
  getRate(base: string, quote: string, date: string): CurrencyRate | null {
    if (base === quote) {
      return { baseCurrency: base, quoteCurrency: quote, rate: 1.0, source: 'Mock Historical Provider', fetchedAt: new Date().toISOString(), isMock: true };
    }
    
    // For simplicity, we only support USD->TRY and EUR->TRY in this mock
    if (quote === 'TRY' && mockRatesToTry[base]) {
      const rate = mockRatesToTry[base][date];
      if (rate) {
        return { baseCurrency: base, quoteCurrency: quote, rate, source: 'Mock Historical Provider', fetchedAt: new Date().toISOString(), isMock: true };
      }
    }
    
    // Reverse TRY->USD
    if (base === 'TRY' && mockRatesToTry[quote]) {
      const rate = mockRatesToTry[quote][date];
      if (rate) {
        return { baseCurrency: base, quoteCurrency: quote, rate: 1 / rate, source: 'Mock Historical Provider', fetchedAt: new Date().toISOString(), isMock: true };
      }
    }

    return null;
  }

  getRates(date: string): CurrencyRate[] {
    return [];
  }

  getAvailableDates(): string[] {
    return ['2024-01-01', '2024-06-01', '2025-01-01'];
  }

  getSource(): string {
    return 'Mock Historical Provider';
  }

  getLastUpdated(): string {
    return new Date().toISOString();
  }
}

export const historicalCurrencyRateProvider = new MockHistoricalCurrencyRateProvider();