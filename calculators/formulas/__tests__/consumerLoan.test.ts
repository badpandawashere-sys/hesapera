import { calculateConsumerLoan } from '../consumerLoan';
import { describe, it, expect } from 'vitest';

describe('İhtiyaç Kredisi Hesaplama', () => {
  it('should calculate mathematically correct results for standard inputs', () => {
    // 100,000 TL, 3% aylık faiz, 12 ay vade
    const res = calculateConsumerLoan(100000, 3, 12);
    
    // Check main labels
    expect(res.primaryLabel).toBe('Aylık Taksit Tutarı');
    expect(res.infoReference).toBeDefined();

    // Parse the formatted strings back to numbers for math tolerance checking
    // e.g. "10.046,21 ₺" -> 10046.21
    const parseFormattedMoney = (str: string) => {
      // Remove all non-numeric characters except comma
      const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.');
      return parseFloat(cleaned);
    };

    const monthlyPayment = parseFormattedMoney(res.primaryResult);
    const totalInterest = parseFormattedMoney(res.secondaryResults!['Toplam Faiz'] as string);
    const totalPayment = parseFormattedMoney(res.secondaryResults!['Toplam Ödeme'] as string);

    // Assert with a tolerance of 0.1 for rounding
    expect(monthlyPayment).toBeCloseTo(10046.21, 1);
    expect(totalPayment).toBeCloseTo(120554.52, 1);
    expect(totalInterest).toBeCloseTo(20554.52, 1);

    expect(res.table).toBeDefined();
    expect(res.table?.length).toBe(12);
  });

  it('should handle 0% interest safely without NaN', () => {
    // 100,000 TL, 0% faiz, 10 ay vade
    const res = calculateConsumerLoan(100000, 0, 10);
    
    const parseFormattedMoney = (str: string) => parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.'));
    
    const monthlyPayment = parseFormattedMoney(res.primaryResult);
    const totalInterest = parseFormattedMoney(res.secondaryResults!['Toplam Faiz'] as string);
    
    expect(monthlyPayment).toBeCloseTo(10000, 1);
    expect(totalInterest).toBeCloseTo(0, 1);
  });

  it('should handle 1 month term', () => {
    // 100,000 TL, 2% faiz, 1 ay
    const res = calculateConsumerLoan(100000, 2, 1);
    
    const parseFormattedMoney = (str: string) => parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.'));
    
    const monthlyPayment = parseFormattedMoney(res.primaryResult);
    const totalInterest = parseFormattedMoney(res.secondaryResults!['Toplam Faiz'] as string);
    const totalPayment = parseFormattedMoney(res.secondaryResults!['Toplam Ödeme'] as string);
    
    expect(monthlyPayment).toBeCloseTo(102000, 1);
    expect(totalInterest).toBeCloseTo(2000, 1);
    expect(totalPayment).toBeCloseTo(102000, 1);
  });
});