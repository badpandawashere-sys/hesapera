import { HistoricalPreciousMetalProvider } from '../providers/historical-precious-metal-provider';
import { MarketPrice } from '../providers/precious-metal-provider';

const mockData: Record<string, Record<string, { buy: number; sell: number }>> = {
  'gram': {
    '2024-01-01': { buy: 1950, sell: 1970 },
    '2024-06-01': { buy: 2350, sell: 2375 },
    '2025-01-01': { buy: 2980, sell: 3010 }
  }
};

export class MockHistoricalPreciousMetalProvider implements HistoricalPreciousMetalProvider {
  getPrice(instrumentId: string, date: string): MarketPrice | null {
    const dates = mockData[instrumentId];
    if (!dates) return null;
    const price = dates[date];
    if (!price) return null;
    
    return {
      buy: price.buy,
      sell: price.sell,
      fetchedAt: new Date().toISOString(),
      effectiveAt: date,
      source: 'Mock Historical Provider',
      isMock: true
    };
  }

  getPrices(instrumentId: string, startDate: string, endDate: string): MarketPrice[] {
    return []; // Optional for now
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

export const historicalPreciousMetalProvider = new MockHistoricalPreciousMetalProvider();