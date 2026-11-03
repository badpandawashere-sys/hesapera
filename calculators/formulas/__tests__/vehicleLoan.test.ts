import { calculateVehicleLoan } from '../vehicleLoan';
import { describe, it, expect } from 'vitest';

describe('vehicleLoan Calculator', () => {
  const parseFormattedMoney = (str: string) => {
    const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned);
  };

  it('should calculate mathematically correct results with 15% KKDF and 15% BSMV for 500.000 TL / 3.5% / 36 ay', () => {
    // 500,000 TL, 3.5% aylık faiz, 36 ay vade
    const res = calculateVehicleLoan(500000, 3.5, 36);
    
    expect(res.primaryLabel).toBe('Aylık Taksit Tutarı');
    expect(res.infoReference).toBeDefined();

    const monthlyPayment = parseFormattedMoney(res.primaryResult);
    const totalInterest = parseFormattedMoney(res.secondaryResults!['Toplam Faiz'] as string);
    const totalKKDF = parseFormattedMoney(res.secondaryResults!['KKDF (%15)'] as string);
    const totalBSMV = parseFormattedMoney(res.secondaryResults!['BSMV (%15)'] as string);
    const totalTax = parseFormattedMoney(res.secondaryResults!['Toplam Vergi'] as string);
    const totalPayment = parseFormattedMoney(res.secondaryResults!['Toplam Ödeme'] as string);

    // Assert exact kuruş values
    expect(monthlyPayment).toBe(28491.91);
    expect(totalInterest).toBe(404391.16);
    expect(totalKKDF).toBe(60658.68);
    expect(totalBSMV).toBe(60658.68);
    expect(totalTax).toBe(121317.36);
    expect(totalPayment).toBe(1025708.52);

    expect(res.table).toBeDefined();
    expect(res.table?.length).toBe(36);

    // Verify amortization table sums exactly match totals
    let sumPayment = 0;
    let sumPrincipal = 0;
    let sumInterest = 0;
    let sumKKDF = 0;
    let sumBSMV = 0;

    res.table?.forEach((row: any) => {
      sumPayment += parseFormattedMoney(row['Taksit Tutarı']);
      sumPrincipal += parseFormattedMoney(row['Anapara']);
      sumInterest += parseFormattedMoney(row['Faiz']);
      sumKKDF += parseFormattedMoney(row['KKDF']);
      sumBSMV += parseFormattedMoney(row['BSMV']);
    });

    expect(Math.round(sumPayment * 100) / 100).toBe(1025708.52);
    expect(Math.round(sumPrincipal * 100) / 100).toBe(500000.00);
    expect(Math.round(sumInterest * 100) / 100).toBe(404391.16);
    expect(Math.round(sumKKDF * 100) / 100).toBe(60658.68);
    expect(Math.round(sumBSMV * 100) / 100).toBe(60658.68);

    // Verify last installment rounding adjustment
    const lastRow = res.table![35];
    expect(parseFormattedMoney(lastRow['Taksit Tutarı'])).toBe(28491.67);
    expect(parseFormattedMoney(lastRow['Kalan Bakiye'])).toBe(0.00);
  });

  it('should handle 0% interest safely', () => {
    // 500,000 TL, 0% faiz, 12 ay vade
    const res = calculateVehicleLoan(500000, 0, 12);
    
    const monthlyPayment = parseFormattedMoney(res.primaryResult);
    const totalPayment = parseFormattedMoney(res.secondaryResults!['Toplam Ödeme'] as string);
    const totalInterest = parseFormattedMoney(res.secondaryResults!['Toplam Faiz'] as string);
    const totalTax = parseFormattedMoney(res.secondaryResults!['Toplam Vergi'] as string);
    
    expect(monthlyPayment).toBe(41666.67);
    expect(totalPayment).toBe(500000);
    expect(totalInterest).toBe(0);
    expect(totalTax).toBe(0);
  });

  it('should handle 1 month term with 15% KKDF and 15% BSMV', () => {
    // 100,000 TL, 3% faiz, 1 ay -> saf faiz 3.000 TL, KKDF 450 TL, BSMV 450 TL -> 103.900 TL
    const res = calculateVehicleLoan(100000, 3, 1);
    
    const monthlyPayment = parseFormattedMoney(res.primaryResult);
    const totalInterest = parseFormattedMoney(res.secondaryResults!['Toplam Faiz'] as string);
    const totalKKDF = parseFormattedMoney(res.secondaryResults!['KKDF (%15)'] as string);
    const totalBSMV = parseFormattedMoney(res.secondaryResults!['BSMV (%15)'] as string);
    const totalPayment = parseFormattedMoney(res.secondaryResults!['Toplam Ödeme'] as string);
    
    expect(monthlyPayment).toBe(103900);
    expect(totalInterest).toBe(3000);
    expect(totalKKDF).toBe(450);
    expect(totalBSMV).toBe(450);
    expect(totalPayment).toBe(103900);
  });
});