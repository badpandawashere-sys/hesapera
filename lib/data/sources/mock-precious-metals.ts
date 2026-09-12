import { PreciousMetalProvider, PreciousMetalInstrument, MarketPrice } from '../providers/precious-metal-provider';

export const PRECIOUS_METAL_CONSTANT_TROY_OUNCE_GRAM = 31.1034768;

const instruments: PreciousMetalInstrument[] = [
  { id: 'gram', name: 'Gram Altın', unit: 'Gram', weightGram: 1, purity: 0.995 },
  { id: 'ceyrek', name: 'Çeyrek Altın', unit: 'Adet', weightGram: 1.75, purity: 0.916 },
  { id: 'yarim', name: 'Yarım Altın', unit: 'Adet', weightGram: 3.50, purity: 0.916 },
  { id: 'tam', name: 'Tam / Ziynet Altın', unit: 'Adet', weightGram: 7.00, purity: 0.916 },
  { id: 'ata', name: 'Ata Cumhuriyet Altını', unit: 'Adet', weightGram: 7.216, purity: 0.916 },
  { id: 'ayar14', name: '14 Ayar Altın', unit: 'Gram', weightGram: 1, purity: 0.585 },
  { id: 'ayar18', name: '18 Ayar Altın', unit: 'Gram', weightGram: 1, purity: 0.750 },
  { id: 'bilezik22', name: '22 Ayar Bilezik', unit: 'Gram', weightGram: 1, purity: 0.916 },
  { id: 'gremse', name: 'Gremse Altın', unit: 'Adet', weightGram: 17.5, purity: 0.916 },
  { id: 'resat', name: 'Reşat Altın', unit: 'Adet', weightGram: 7.20, purity: 0.916 },
  { id: 'hamit', name: 'Hamit Altın', unit: 'Adet', weightGram: 7.20, purity: 0.916 },
  { id: 'gumus', name: 'Gümüş', unit: 'Gram', weightGram: 1, purity: 0.999 },
];

const mockPrices: Record<string, { buy: number; sell: number }> = {
  'gram': { buy: 2900, sell: 2950 },
  'ceyrek': { buy: 4750, sell: 4850 },
  'yarim': { buy: 9500, sell: 9700 },
  'tam': { buy: 19000, sell: 19400 },
  'ata': { buy: 19500, sell: 19900 },
  'ayar14': { buy: 1600, sell: 1750 },
  'ayar18': { buy: 2100, sell: 2200 },
  'bilezik22': { buy: 2600, sell: 2750 },
  'gremse': { buy: 47500, sell: 48500 },
  'resat': { buy: 19600, sell: 20000 },
  'hamit': { buy: 19600, sell: 20000 },
  'gumus': { buy: 33.5, sell: 35.0 },
};

export class MockPreciousMetalProvider implements PreciousMetalProvider {
  getInstruments(): PreciousMetalInstrument[] {
    return instruments;
  }
  
  getPrice(instrumentId: string): MarketPrice | null {
    const price = mockPrices[instrumentId];
    if (!price) return null;
    return {
      buy: price.buy,
      sell: price.sell,
      fetchedAt: new Date().toISOString(),
      effectiveAt: new Date().toISOString(),
      source: 'Mock Provider',
      isMock: true
    };
  }
}

export const preciousMetalProvider = new MockPreciousMetalProvider();