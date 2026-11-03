import { calculateConsumerLoan } from '../consumerLoan';
import { describe, it, expect } from 'vitest';

describe('İhtiyaç Kredisi Hesaplama', () => {
  const parseFormattedMoney = (str: string) => {
    const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned);
  };

  it('should calculate mathematically correct results with 15% KKDF and 15% BSMV for 100.000 TL / 3.5% / 12 ay', () => {
    // 100,000 TL, 3.5% aylık faiz, 12 ay vade
    const res = calculateConsumerLoan(100000, 3.5, 12);
    
    expect(res.primaryLabel).toBe('Aylık Taksit Tutarı');
    expect(res.infoReference).toBeDefined();

    const monthlyPayment = parseFormattedMoney(res.primaryResult);
    const totalInterest = parseFormattedMoney(res.secondaryResults!['Toplam Faiz'] as string);
    const totalKKDF = parseFormattedMoney(res.secondaryResults!['KKDF (%15)'] as string);
    const totalBSMV = parseFormattedMoney(res.secondaryResults!['BSMV (%15)'] as string);
    const totalTax = parseFormattedMoney(res.secondaryResults!['Toplam Vergi'] as string);
    const totalPayment = parseFormattedMoney(res.secondaryResults!['Toplam Ödeme'] as string);

    // Exact kuruş match
    expect(monthlyPayment).toBe(10998.01);
    expect(totalInterest).toBe(24596.99);
    expect(totalKKDF).toBe(3689.55);
    expect(totalBSMV).toBe(3689.55);
    expect(totalTax).toBe(7379.10);
    expect(totalPayment).toBe(131976.09);

    expect(res.table).toBeDefined();
    expect(res.table?.length).toBe(12);

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

    expect(Math.round(sumPayment * 100) / 100).toBe(131976.09);
    expect(Math.round(sumPrincipal * 100) / 100).toBe(100000.00);
    expect(Math.round(sumInterest * 100) / 100).toBe(24596.99);
    expect(Math.round(sumKKDF * 100) / 100).toBe(3689.55);
    expect(Math.round(sumBSMV * 100) / 100).toBe(3689.55);

    // Verify last installment rounding adjustment
    const lastRow = res.table![11];
    expect(parseFormattedMoney(lastRow['Taksit Tutarı'])).toBe(10997.98);
    expect(parseFormattedMoney(lastRow['Kalan Bakiye'])).toBe(0.00);
  });

  it('should handle 0% interest safely without NaN', () => {
    // 100,000 TL, 0% faiz, 10 ay vade
    const res = calculateConsumerLoan(100000, 0, 10);
    
    const monthlyPayment = parseFormattedMoney(res.primaryResult);
    const totalInterest = parseFormattedMoney(res.secondaryResults!['Toplam Faiz'] as string);
    const totalTax = parseFormattedMoney(res.secondaryResults!['Toplam Vergi'] as string);
    
    expect(monthlyPayment).toBe(10000);
    expect(totalInterest).toBe(0);
    expect(totalTax).toBe(0);
  });

  it('should handle 1 month term with 15% KKDF and 15% BSMV', () => {
    // 100,000 TL, 2% faiz, 1 ay -> saf faiz 2.000 TL, KKDF 300 TL, BSMV 300 TL -> 102.600 TL
    const res = calculateConsumerLoan(100000, 2, 1);
    
    const monthlyPayment = parseFormattedMoney(res.primaryResult);
    const totalInterest = parseFormattedMoney(res.secondaryResults!['Toplam Faiz'] as string);
    const totalKKDF = parseFormattedMoney(res.secondaryResults!['KKDF (%15)'] as string);
    const totalBSMV = parseFormattedMoney(res.secondaryResults!['BSMV (%15)'] as string);
    const totalPayment = parseFormattedMoney(res.secondaryResults!['Toplam Ödeme'] as string);
    
    expect(monthlyPayment).toBe(102600);
    expect(totalInterest).toBe(2000);
    expect(totalKKDF).toBe(300);
    expect(totalBSMV).toBe(300);
    expect(totalPayment).toBe(102600);
  });
});