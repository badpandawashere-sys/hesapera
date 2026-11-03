import { describe, it, expect } from 'vitest';
import { calculateCreditCardLateFee } from '../creditCardLateFee';

describe('calculateCreditCardLateFee', () => {
  it('1. should calculate 10.000 TL / 15 gun / %4.55 correctly with taxes', () => {
    const result = calculateCreditCardLateFee(10000, 4.55, 15);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.secondaryResults['Saf Gecikme Faizi']).toContain('227,50');
    // @ts-ignore
    expect(result.secondaryResults['KKDF (%15)']).toContain('34,13');
    // @ts-ignore
    expect(result.secondaryResults['BSMV (%15)']).toContain('34,13');
    // 227.50 + 34.13 + 34.13 = 295.76 (kuruş-perfect component sum)
    // @ts-ignore
    expect(result.primaryResult).toContain('295,76');
  });

  it('2. should calculate 5.000 TL / 30 gun / %4.55 correctly with taxes', () => {
    const result = calculateCreditCardLateFee(5000, 4.55, 30);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.secondaryResults['Saf Gecikme Faizi']).toContain('227,50');
    // @ts-ignore
    expect(result.primaryResult).toContain('295,76');
  });

  it('2b. should calculate 10.000 TL / 15 gun / %4.25 example with zero kuruş discrepancy', () => {
    const result = calculateCreditCardLateFee(10000, 4.25, 15);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.secondaryResults['Saf Gecikme Faizi']).toContain('212,50');
    // @ts-ignore
    expect(result.secondaryResults['KKDF (%15)']).toContain('31,88');
    // @ts-ignore
    expect(result.secondaryResults['BSMV (%15)']).toContain('31,88');
    // 212.50 + 31.88 + 31.88 = 276.26 TL
    // @ts-ignore
    expect(result.primaryResult).toContain('276,26');
    // @ts-ignore
    expect(result.secondaryResults['Toplam Gecikme Maliyeti']).toContain('276,26');
    // @ts-ignore
    expect(result.secondaryResults['Toplam Ödenecek Tutar']).toContain('10.276,26');
  });

  it('3. should calculate 0 gun correctly', () => {
    const result = calculateCreditCardLateFee(10000, 4.55, 0);
    expect(result.success !== false).toBe(true);
    // @ts-ignore
    expect(result.primaryResult).toContain('0,00');
  });

  it('4. should calculate different principal and rate (20.000 TL / 20 gun / %3.55)', () => {
    const result = calculateCreditCardLateFee(20000, 3.55, 20);
    expect(result.success !== false).toBe(true);
    // Saf Faiz: 20000 * (0.0355/30) * 20 = 473.33
    // Vergili: 473.33 * 1.30 = 615.33
    // @ts-ignore
    expect(result.secondaryResults['Saf Gecikme Faizi']).toContain('473,33');
    // @ts-ignore
    expect(result.primaryResult).toContain('615,33');
  });

  it('5. should handle very high interest rates properly', () => {
    const result = calculateCreditCardLateFee(10000, 50, 30);
    expect(result.success !== false).toBe(true);
    // Saf Faiz: 10000 * 0.50 * 1 = 5000
    // Vergili = 5000 * 1.30 = 6500
    // @ts-ignore
    expect(result.primaryResult).toContain('6.500');
  });

  it('6. should test half-cent boundary rounding (exact 0.005, <0.005, >0.005) accurately', () => {
    // A. Exact half-cent boundary: 10.000 TL / 15 gün / %4,25
    // Net Faiz: 212,50 TL -> Vergi = 212,50 * 0.15 = 31,875 TL. 
    // Virgülden sonra 3. basamak 5 (tam yarım kuruş). Math.round(31.875 * 100) / 100 = 31,88 TL.
    const resA = calculateCreditCardLateFee(10000, 4.25, 15);
    expect(resA.success !== false).toBe(true);
    // @ts-ignore
    expect(resA.secondaryResults['KKDF (%15)']).toContain('31,88');
    // @ts-ignore
    expect(resA.secondaryResults['BSMV (%15)']).toContain('31,88');
    // @ts-ignore
    expect(resA.primaryResult).toContain('276,26');

    // B. Under half-cent boundary: 1.000 TL / 3 gün / %3,00
    // Günlük oran: 0.03 / 30 = 0.001. Faiz: 1000 * 0.001 * 3 = 3,00 TL.
    // Vergi: 3,00 * 0.15 = 0,45 TL (tam kuruş). Toplam vergi: 0,45 + 0,45 = 0,90 TL. Toplam: 3,90 TL.
    const resB = calculateCreditCardLateFee(1000, 3.00, 3);
    // @ts-ignore
    expect(resB.secondaryResults['Saf Gecikme Faizi']).toContain('3,00');
    // @ts-ignore
    expect(resB.secondaryResults['KKDF (%15)']).toContain('0,45');
    // @ts-ignore
    expect(resB.primaryResult).toContain('3,90');

    // C. Slightly below half-cent: 1.000 TL / 1 gün / %2,00
    // Günlük oran: 0.02 / 30 = 0.000666666... Faiz: 1000 * (0.02/30) * 1 = 0,666666...
    // roundedRawInterest = 0,67 TL.
    // Vergi: 0,67 * 0.15 = 0,1005 TL.
    // Math.round(0.1005 * 100) / 100 = 0,10 TL (0,0005 < 0,0050).
    const resC = calculateCreditCardLateFee(1000, 2.00, 1);
    // @ts-ignore
    expect(resC.secondaryResults['Saf Gecikme Faizi']).toContain('0,67');
    // @ts-ignore
    expect(resC.secondaryResults['KKDF (%15)']).toContain('0,10');
    // @ts-ignore
    expect(resC.primaryResult).toContain('0,87'); // 0.67 + 0.10 + 0.10 = 0.87
  });

  it('7. should calculate correctly across the 3 TCMB debt brackets with zero discrepancy', () => {
    // 1. Kademe: 25.000 TL (<= 30.000 TL baremi), %4,25, 10 gün
    // Faiz: 25000 * (0.0425 / 30) * 10 = 354,1666... -> 354,17 TL
    // KKDF: 354,17 * 0.15 = 53,1255 -> 53,13 TL
    // BSMV: 354,17 * 0.15 = 53,13 TL
    // Toplam: 354,17 + 53,13 + 53,13 = 460,43 TL
    const res1 = calculateCreditCardLateFee(25000, 4.25, 10);
    // @ts-ignore
    expect(res1.secondaryResults['Saf Gecikme Faizi']).toContain('354,17');
    // @ts-ignore
    expect(res1.secondaryResults['KKDF (%15)']).toContain('53,13');
    // @ts-ignore
    expect(res1.secondaryResults['BSMV (%15)']).toContain('53,13');
    // @ts-ignore
    expect(res1.primaryResult).toContain('460,43');

    // 2. Kademe: 100.000 TL (30.000 - 180.000 TL baremi), %4,75, 15 gün
    // Faiz: 100000 * (0.0475 / 30) * 15 = 2375,00 TL
    // KKDF: 2375 * 0.15 = 356,25 TL
    // BSMV: 2375 * 0.15 = 356,25 TL
    // Toplam: 2375 + 356.25 + 356.25 = 3087,50 TL
    const res2 = calculateCreditCardLateFee(100000, 4.75, 15);
    // @ts-ignore
    expect(res2.secondaryResults['Saf Gecikme Faizi']).toContain('2.375,00');
    // @ts-ignore
    expect(res2.secondaryResults['KKDF (%15)']).toContain('356,25');
    // @ts-ignore
    expect(res2.secondaryResults['BSMV (%15)']).toContain('356,25');
    // @ts-ignore
    expect(res2.primaryResult).toContain('3.087,50');

    // 3. Kademe: 250.000 TL (> 180.000 TL baremi), %5,25, 30 gün
    // Faiz: 250000 * (0.0525 / 30) * 30 = 13125,00 TL
    // KKDF: 13125 * 0.15 = 1968,75 TL
    // BSMV: 13125 * 0.15 = 1968,75 TL
    // Toplam: 13125 + 1968.75 + 1968.75 = 17062,50 TL
    const res3 = calculateCreditCardLateFee(250000, 5.25, 30);
    // @ts-ignore
    expect(res3.secondaryResults['Saf Gecikme Faizi']).toContain('13.125,00');
    // @ts-ignore
    expect(res3.secondaryResults['KKDF (%15)']).toContain('1.968,75');
    // @ts-ignore
    expect(res3.secondaryResults['BSMV (%15)']).toContain('1.968,75');
    // @ts-ignore
    expect(res3.primaryResult).toContain('17.062,50');
  });

  it('8. should return error on negative amount', () => {
    const result = calculateCreditCardLateFee(-10000, 4.25, 30);
    expect(result.success).toBe(false);
  });

  it('9. should return error on negative days', () => {
    const result = calculateCreditCardLateFee(10000, 4.25, -5);
    expect(result.success).toBe(false);
  });

  it('10. should return error on negative rate', () => {
    const result = calculateCreditCardLateFee(10000, -4.25, 30);
    expect(result.success).toBe(false);
  });
});
