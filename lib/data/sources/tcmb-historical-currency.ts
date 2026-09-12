import { HistoricalCurrencyRateProvider } from '../providers/historical-currency-rate-provider';
import { CurrencyRate } from '../providers/currency-rate-provider';

interface TcmbRateResult {
  forexBuying: number;
  forexSelling: number;
  banknoteBuying: number;
  banknoteSelling: number;
}

export class TcmbHistoricalCurrencyProvider {
  // Returns rate data for a specific date (DD-MM-YYYY format expected by API, but we accept YYYY-MM-DD standard)
  async getRateForDate(currencyCode: string, dateYYYYMMDD: string): Promise<TcmbRateResult | null> {
    const evdsKey = process.env.TCMB_EVDS_API_KEY;
    
    // Convert YYYY-MM-DD to DD-MM-YYYY
    const parts = dateYYYYMMDD.split('-');
    if (parts.length !== 3) return null;
    const dateDDMMYYYY = parts[2] + '-' + parts[1] + '-' + parts[0];
    
    if (evdsKey) {
      try {
        const evdsRes = await this.fetchEvds(currencyCode, dateDDMMYYYY, evdsKey);
        if (evdsRes) return evdsRes;
      } catch (e) {
        console.error("EVDS error:", e);
        // Fallback to XML
      }
    }
    
    // Fallback to XML
    try {
      return await this.fetchXml(currencyCode, dateYYYYMMDD);
    } catch (e) {
      console.error("XML error:", e);
      return null;
    }
  }
  
  private async fetchEvds(currencyCode: string, dateDDMMYYYY: string, apiKey: string): Promise<TcmbRateResult | null> {
    const series = [
      'TP.DK.' + currencyCode + '.A',
      'TP.DK.' + currencyCode + '.S',
      'TP.DK.' + currencyCode + '.A.EF',
      'TP.DK.' + currencyCode + '.S.EF'
    ].join('-');
    
    const url = 'https://evds2.tcmb.gov.tr/service/evds/series=' + series + '&startDate=' + dateDDMMYYYY + '&endDate=' + dateDDMMYYYY + '&type=json&key=' + apiKey;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("EVDS fetch failed");
    
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;
    
    const item = data.items[0];
    const fa = parseFloat(item['TP_DK_' + currencyCode + '_A']);
    
    if (isNaN(fa)) return null;
    
    return {
      forexBuying: fa,
      forexSelling: parseFloat(item['TP_DK_' + currencyCode + '_S']),
      banknoteBuying: parseFloat(item['TP_DK_' + currencyCode + '_A_EF']),
      banknoteSelling: parseFloat(item['TP_DK_' + currencyCode + '_S_EF'])
    };
  }
  
  private async fetchXml(currencyCode: string, dateYYYYMMDD: string): Promise<TcmbRateResult | null> {
    const parts = dateYYYYMMDD.split('-');
    const yyyy = parts[0];
    const mm = parts[1];
    const dd = parts[2];
    
    const url = 'https://www.tcmb.gov.tr/kurlar/' + yyyy + mm + '/' + dd + mm + yyyy + '.xml';
    const res = await fetch(url);
    if (!res.ok) throw new Error("XML fetch failed");
    
    const xmlText = await res.text();
    
    const regex = new RegExp('<Currency[^>]+CurrencyCode="' + currencyCode + '"[^>]*>[\\s\\S]*?</Currency>', 'i');
    const match = xmlText.match(regex);
    if (!match) return null;
    
    const currencyBlock = match[0];
    const fa = this.extractXmlValue(currencyBlock, 'ForexBuying');
    if (fa === null) return null;
    
    return {
      forexBuying: fa,
      forexSelling: this.extractXmlValue(currencyBlock, 'ForexSelling') || fa,
      banknoteBuying: this.extractXmlValue(currencyBlock, 'BanknoteBuying') || fa,
      banknoteSelling: this.extractXmlValue(currencyBlock, 'BanknoteSelling') || fa
    };
  }
  
  private extractXmlValue(block: string, tag: string): number | null {
    const regex = new RegExp('<' + tag + '>([0-9.]+)</' + tag + '>', 'i');
    const match = block.match(regex);
    if (match && match[1]) return parseFloat(match[1]);
    return null;
  }
}

export const tcmbHistoricalProvider = new TcmbHistoricalCurrencyProvider();
