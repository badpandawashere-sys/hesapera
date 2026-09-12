import { CurrencyRate } from './currency-rate-provider';

export interface HistoricalCurrencyRateProvider {
  getRate(base: string, quote: string, date: string): CurrencyRate | null;
  getRates(date: string): CurrencyRate[];
  getAvailableDates(): string[];
  getSource(): string;
  getLastUpdated(): string;
}