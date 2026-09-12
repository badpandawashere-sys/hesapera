import { CurrencyRateProvider, CurrencyInfo, CurrencyRate } from '../providers/currency-rate-provider';

const currencies: CurrencyInfo[] = [
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺' },
  { code: 'USD', name: 'Amerikan Doları', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'İngiliz Sterlini', symbol: '£' },
  { code: 'CHF', name: 'İsviçre Frangı', symbol: 'CHF' },
  { code: 'JPY', name: 'Japon Yeni', symbol: '¥' }
];

// Base is USD for these mock rates to TRY
const mockRatesToTry: Record<string, number> = {
  'USD': 35.0,
  'EUR': 38.5,
  'GBP': 45.0,
  'CHF': 39.5,
  'JPY': 0.23,
  'TRY': 1.0
};

export class MockCurrencyRateProvider implements CurrencyRateProvider {
  getCurrencies(): CurrencyInfo[] {
    return currencies;
  }

  getRate(base: string, quote: string): CurrencyRate | null {
    if (base === quote) {
      return {
        baseCurrency: base,
        quoteCurrency: quote,
        rate: 1.0,
        source: 'Mock Provider',
        fetchedAt: new Date().toISOString(),
        isMock: true
      };
    }

    let rate = 0;
    // Cross rate logic simplified via TRY
    const baseToTry = mockRatesToTry[base];
    const quoteToTry = mockRatesToTry[quote];

    if (!baseToTry || !quoteToTry) return null;
    
    rate = baseToTry / quoteToTry;

    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: rate,
      source: 'Mock Provider',
      fetchedAt: new Date().toISOString(),
      isMock: true
    };
  }

  getRates(base: string = 'TRY'): CurrencyRate[] {
    return currencies.map(c => this.getRate(base, c.code)).filter((r): r is CurrencyRate => r !== null);
  }

  getLastUpdated(): string {
    return new Date().toISOString();
  }

  getSource(): string {
    return 'Mock Provider';
  }
}

export const currencyRateProvider = new MockCurrencyRateProvider();