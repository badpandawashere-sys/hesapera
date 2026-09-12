export interface CurrencyInfo {
  code: string;
  name: string;
  symbol?: string;
}

export interface CurrencyRate {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  source: string;
  fetchedAt: string;
  isMock: boolean;
}

export interface CurrencyRateProvider {
  getCurrencies(): CurrencyInfo[];
  getRate(base: string, quote: string): CurrencyRate | null;
  getRates(base?: string): CurrencyRate[];
  getLastUpdated(): string;
  getSource(): string;
}