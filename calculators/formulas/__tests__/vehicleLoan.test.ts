import { calculateVehicleLoan } from '../vehicleLoan';
import { describe, it, expect } from 'vitest';

describe('vehicleLoan Calculator', () => {
  it('should calculate mathematically correct results for standard inputs', () => {
    // 100,000 TL, 3% aylık faiz, 12 ay vade
    const res = calculateVehicleLoan(100000, 3, 12);
    
    // Check main labels
    expect(res.primaryLabel).toBe('Aylık Taksit Tutarı');
    expect(res.infoReference).toBeDefined();

    const parseFormattedMoney = (str: string) => {
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

  it('should handle 0% interest safely', () => {
    // 100,000 TL, 0% faiz, 12 ay vade
    const res = calculateVehicleLoan(100000, 0, 12);
    
    const parseFormattedMoney = (str: string) => parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.'));
    
    const monthlyPayment = parseFormattedMoney(res.primaryResult);
    const totalPayment = parseFormattedMoney(res.secondaryResults!['Toplam Ödeme'] as string);
    const totalInterest = parseFormattedMoney(res.secondaryResults!['Toplam Faiz'] as string);
    
    expect(monthlyPayment).toBeCloseTo(8333.33, 1);
    expect(totalPayment).toBeCloseTo(100000, 1);
    expect(totalInterest).toBeCloseTo(0, 1);
  });

  it('should handle 1 month term', () => {
    // 100,000 TL, 3% faiz, 1 ay
    const res = calculateVehicleLoan(100000, 3, 1);
    
    const parseFormattedMoney = (str: string) => parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.'));
    
    const monthlyPayment = parseFormattedMoney(res.primaryResult);
    const totalInterest = parseFormattedMoney(res.secondaryResults!['Toplam Faiz'] as string);
    const totalPayment = parseFormattedMoney(res.secondaryResults!['Toplam Ödeme'] as string);
    
    expect(Number.isNaN(monthlyPayment)).toBe(false);
    expect(Number.isFinite(monthlyPayment)).toBe(true);
    
    expect(monthlyPayment).toBeCloseTo(103000, 1);
    expect(totalInterest).toBeCloseTo(3000, 1);
    expect(totalPayment).toBeCloseTo(103000, 1);
  });
});