import { calculateHistoricalCurrency } from '../historicalCurrency';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tcmbHistoricalProvider } from '../../../lib/data/sources/tcmb-historical-currency';

describe('Geçmiş Döviz Kurları (ID36)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the TCMB provider to avoid network requests during tests
    vi.spyOn(tcmbHistoricalProvider, 'getRateForDate').mockImplementation(async (currency: string, date: string) => {
      // Simulate normal business day
      if (date === '2024-09-06') { 
        if (currency === 'USD') return { forexBuying: 34.0, forexSelling: 34.1, banknoteBuying: 33.9, banknoteSelling: 34.2 };
        if (currency === 'EUR') return { forexBuying: 37.0, forexSelling: 37.1, banknoteBuying: 36.9, banknoteSelling: 37.2 };
        if (currency === 'GBP') return { forexBuying: 44.0, forexSelling: 44.2, banknoteBuying: 43.9, banknoteSelling: 44.3 };
      }
      // Weekend simulation: 2024-09-08 is Sunday, no data
      if (date === '2024-09-08' || date === '2024-09-07') {
        return null;
      }
      // Invalid / far past
      if (date === '2000-01-01') return null;
      
      return null;
    });
  });

  it('İş gününde USD Döviz Alış hesaplaması', async () => {
    const res = await calculateHistoricalCurrency(100, 'USD', 'forexBuying', '2024-09-06');
    // 100 * 34.0 = 3400
    expect(res.primaryResult.replace(/\\s/g, '')).toContain('3.400');
    expect(res.secondaryResults['Kur Tipi']).toBe('Döviz Alış');
  });

  it('İş gününde EUR Efektif Satış hesaplaması', async () => {
    const res = await calculateHistoricalCurrency(100, 'EUR', 'banknoteSelling', '2024-09-06');
    // 100 * 37.2 = 3720
    expect(res.primaryResult.replace(/\\s/g, '')).toContain('3.720');
  });

  it('Hafta sonu seçildiğinde (Pazar), Cuma gününün kurunu almalı', async () => {
    const res = await calculateHistoricalCurrency(100, 'GBP', 'forexSelling', '2024-09-08');
    // It should fallback to 2024-09-06 and use GBP forexSelling = 44.2 -> 4420
    expect(res.primaryResult.replace(/\\s/g, '')).toContain('4.420');
    expect(res.notes.some(n => n.includes('en yakın önceki iş günü'))).toBe(true);
  });

  it('Geçersiz veya bulunamayan tarihte hata fırlatmalı', async () => {
    await expect(calculateHistoricalCurrency(100, 'USD', 'forexBuying', '2000-01-01')).rejects.toThrow('Geçerli TCMB verisi bulunamadı.');
  });
});
