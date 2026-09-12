export interface PreciousMetalInstrument {
  id: string;
  name: string;
  unit: string;
  weightGram?: number;
  purity?: number;
}

export interface MarketPrice {
  buy: number;
  sell: number;
  fetchedAt: string;
  effectiveAt: string;
  source: string;
  isMock: boolean;
}

export interface PreciousMetalProvider {
  getInstruments(): PreciousMetalInstrument[];
  getPrice(instrumentId: string): MarketPrice | null;
}