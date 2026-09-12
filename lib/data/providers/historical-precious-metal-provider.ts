import { MarketPrice } from './precious-metal-provider';

export interface HistoricalPreciousMetalProvider {
  getPrice(instrumentId: string, date: string): MarketPrice | null;
  getPrices(instrumentId: string, startDate: string, endDate: string): MarketPrice[];
  getAvailableDates(): string[];
  getSource(): string;
  getLastUpdated(): string;
}