export interface MarketQuote {
  symbol: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  currency: string;
  source: string;
  fetchedAt: string;
  error?: string;
}

export interface IMarketDataProvider {
  getQuote(symbol: string): Promise<MarketQuote>;
  getQuotes(symbols: string[]): Promise<Record<string, MarketQuote>>;
}
