import { calculateCreditCardMinimumPayment } from '../creditCardMinimumPayment';
import { describe, it, expect } from 'vitest';

describe('Credit Card Minimum Payment Calculator', () => {
  const parseFormattedMoney = (str: string) => {
    const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned);
  };

  it('should calculate mathematically correct results for 20% rate', () => {
    // 10,000 TL dönem borcu, %20 asgari ödeme oranı
    const res = calculateCreditCardMinimumPayment(10000, 20);
    
    expect(res.primaryLabel).toBe('Asgari Ödeme Tutarı');
    expect(res.infoReference).toBeDefined();

    const minPayment = parseFormattedMoney(res.primaryResult);
    const statementBalance = parseFormattedMoney(res.secondaryResults!['Dönem Borcu'] as string);

    expect(Number.isNaN(minPayment)).toBe(false);
    expect(Number.isFinite(minPayment)).toBe(true);

    expect(minPayment).toBeCloseTo(2000, 1);
    expect(statementBalance).toBeCloseTo(10000, 1);
    
    // Ensure "Asgari Ödeme Tutarı" is not in secondaryResults
    expect('Asgari Ödeme Tutarı' in res.secondaryResults!).toBe(false);
  });

  it('should calculate mathematically correct results for 40% rate', () => {
    // 10,000 TL dönem borcu, %40 asgari ödeme oranı
    const res = calculateCreditCardMinimumPayment(10000, 40);
    
    const minPayment = parseFormattedMoney(res.primaryResult);
    expect(minPayment).toBeCloseTo(4000, 1);
  });

  it('should handle 0% rate safely', () => {
    // 10,000 TL dönem borcu, %0 asgari ödeme oranı
    const res = calculateCreditCardMinimumPayment(10000, 0);
    
    const minPayment = parseFormattedMoney(res.primaryResult);
    expect(minPayment).toBeCloseTo(0, 1);
  });
});