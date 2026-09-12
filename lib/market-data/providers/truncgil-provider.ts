import { IMarketDataProvider, MarketQuote } from '../types';

let cache: Record<string, MarketQuote> | null = null;
let lastFetchTime: number = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// Altın türlerini UI value'dan Truncgil key'e eşleştirme (toUpperCase haliyle)
const symbolMap: Record<string, string> = {
  'GRAM ALTIN': 'GRAM-ALTIN',
  'ÇEYREK ALTIN': 'CEYREK-ALTIN',
  'YARIM ALTIN': 'YARIM-ALTIN',
  'TAM ALTIN': 'TAM-ALTIN',
  'ATA ALTIN': 'ATA-ALTIN',
  'GREMSE ALTIN': 'GREMSE-ALTIN',
  'GÜMÜŞ': 'GUMUS'
};

export class TruncgilProvider implements IMarketDataProvider {
  private async fetchAll(): Promise<Record<string, MarketQuote>> {
    const now = Date.now();
    if (cache && (now - lastFetchTime) < CACHE_TTL_MS) {
      return cache;
    }

    try {
      const response = await fetch('https://finans.truncgil.com/today.json', { next: { revalidate: 60 } });
      if (!response.ok) {
        throw new Error(`Truncgil API error: ${response.status}`);
      }
      
      const data = await response.json();
      const quotes: Record<string, MarketQuote> = {};
      const fetchedAt = new Date().toISOString();

      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null && 'Alış' in value && 'Satış' in value) {
          const buyStr = (value as any)['Alış'].replace(/\./g, '').replace(',', '.');
          const sellStr = (value as any)['Satış'].replace(/\./g, '').replace(',', '.');
          
          let buyPrice = parseFloat(buyStr);
          let sellPrice = parseFloat(sellStr);
          
          if (buyStr.includes('$')) buyPrice = parseFloat(buyStr.replace(/[^0-9.]/g, ''));
          if (sellStr.includes('$')) sellPrice = parseFloat(sellStr.replace(/[^0-9.]/g, ''));

          if (!isNaN(buyPrice) && !isNaN(sellPrice)) {
            quotes[key.toUpperCase()] = {
              symbol: key.toUpperCase(),
              name: key,
              buyPrice,
              sellPrice,
              currency: 'TRY',
              source: 'Truncgil',
              fetchedAt
            };
          }
        }
      }

      cache = quotes;
      lastFetchTime = now;
      return quotes;
    } catch (error) {
      console.error('Market data fetch error:', error);
      if (cache) return cache;
      throw new Error('Canlı piyasa verisi şu anda alınamıyor.');
    }
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    const all = await this.fetchAll();
    const mappedSymbol = symbolMap[symbol.toUpperCase()] || symbol.toUpperCase();
    const quote = all[mappedSymbol];
    if (!quote) {
      throw new Error(`Canlı piyasa verisi şu anda alınamıyor. (${symbol})`);
    }
    return quote;
  }

  async getQuotes(symbols: string[]): Promise<Record<string, MarketQuote>> {
    const all = await this.fetchAll();
    const result: Record<string, MarketQuote> = {};
    for (const sym of symbols) {
      const mappedSymbol = symbolMap[sym.toUpperCase()] || sym.toUpperCase();
      if (all[mappedSymbol]) {
        result[sym] = all[mappedSymbol];
      }
    }
    return result;
  }
}
