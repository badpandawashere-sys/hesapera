import { IMarketDataProvider } from './types';
import { TruncgilProvider } from './providers/truncgil-provider';

class MarketDataService {
  private goldProvider: IMarketDataProvider;
  private currencyProvider: IMarketDataProvider;

  constructor() {
    // Harem Altın'ın web API'sine standart istekler Cloudflare tarafından engellendiği için
    // resmi bir public JSON endpoint'i tespit edilememiştir. (Sadece dashboard websocket var)
    // Bu sebeple production-ready ve açık/güvenilir olan "Truncgil" veri kaynağı kullanılmaktadır.
    // Provider'ların isimleri ve etiketleri dürüstçe kendi kaynaklarını yansıtır.
    this.goldProvider = new TruncgilProvider();
    this.currencyProvider = new TruncgilProvider();
  }

  async getGoldQuote(symbol: string) {
    return this.goldProvider.getQuote(symbol);
  }

  async getCurrencyQuote(symbol: string) {
    return this.currencyProvider.getQuote(symbol);
  }
}

export const marketDataService = new MarketDataService();
