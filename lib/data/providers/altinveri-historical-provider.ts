import { HistoricalPreciousMetalProvider } from './historical-precious-metal-provider';
import { MarketPrice } from './precious-metal-provider';
import { historicalGoldPrices } from '../sources/historical-gold-prices';

export class AltinVeriHistoricalProvider implements HistoricalPreciousMetalProvider {
  getPrice(instrumentId: string, requestedDate: string): MarketPrice | null {
    if (instrumentId !== 'gram') return null; // We only support Gram Altın right now

    let currentDate = new Date(requestedDate);
    let attempts = 0;
    
    // We try looking FORWARD up to 10 days to find a valid business day
    // according to AltınVeri's Data Policy
    while (attempts < 10) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const data = historicalGoldPrices[dateStr];
      
      if (data) {
        return {
          buy: data.buy,
          sell: data.sell,
          low: data.low,
          high: data.high,
          fetchedAt: new Date().toISOString(),
          effectiveAt: dateStr, // Returns the actual found date
          source: 'AltınVeri tarihsel gram altın arşivi',
          isMock: false
        };
      }
      
      // Go forward one day
      currentDate.setDate(currentDate.getDate() + 1);
      attempts++;
    }

    return null;
  }

  getPrices(instrumentId: string, startDate: string, endDate: string): MarketPrice[] {
    return []; // Not implemented for this use case
  }

  getAvailableDates(): string[] {
    return Object.keys(historicalGoldPrices);
  }

  getSource(): string {
    return 'AltınVeri tarihsel gram altın arşivi';
  }

  getLastUpdated(): string {
    return new Date().toISOString();
  }
}

export const altinveriProvider = new AltinVeriHistoricalProvider();
