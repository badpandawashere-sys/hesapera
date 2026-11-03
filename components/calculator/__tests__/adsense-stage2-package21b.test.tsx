import { describe, it, expect } from 'vitest';
import { calculateConsumerLoan } from '@/calculators/formulas/consumerLoan';
import { calculateVehicleLoan } from '@/calculators/formulas/vehicleLoan';
import { consumerLoanCalculatorDef } from '@/calculators/definitions/consumerLoan';
import { vehicleLoanCalculatorDef } from '@/calculators/definitions/vehicleLoan';
import { calculateMortgageLoan } from '@/calculators/formulas/mortgageLoan';
import { calculateCommercialLoan } from '@/calculators/formulas/commercialLoan';

describe('AdSense Aşama 2 - Paket 2.1B (İhtiyaç & Taşıt Kredisi Doğrulaması)', () => {
  const parseMoney = (str: string) => {
    const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned);
  };

  describe('İhtiyaç Kredisi: Matematik ve Kuruş Mutabakatı', () => {
    it('100.000 TL / %3,5 / 12 ay senaryosu kuruşu kuruşuna doğrulanmalı', () => {
      const res = calculateConsumerLoan(100000, 3.5, 12);
      
      const monthlyPayment = parseMoney(res.primaryResult);
      const totalInterest = parseMoney(res.secondaryResults['Toplam Faiz'] as string);
      const totalKKDF = parseMoney(res.secondaryResults['KKDF (%15)'] as string);
      const totalBSMV = parseMoney(res.secondaryResults['BSMV (%15)'] as string);
      const totalTax = parseMoney(res.secondaryResults['Toplam Vergi'] as string);
      const totalPayment = parseMoney(res.secondaryResults['Toplam Ödeme'] as string);

      expect(monthlyPayment).toBe(10998.01);
      expect(totalInterest).toBe(24596.99);
      expect(totalKKDF).toBe(3689.55);
      expect(totalBSMV).toBe(3689.55);
      expect(totalTax).toBe(7379.10);
      expect(totalPayment).toBe(131976.09);

      // Kuruş mutabakatı: Anapara + Saf Faiz + KKDF + BSMV === Toplam Ödeme
      expect(100000 + totalInterest + totalKKDF + totalBSMV).toBe(131976.09);

      // Amortisman tablosu dönem toplamları
      expect(res.table).toBeDefined();
      expect(res.table?.length).toBe(12);

      let sumPayment = 0;
      let sumPrincipal = 0;
      let sumInterest = 0;
      let sumKKDF = 0;
      let sumBSMV = 0;

      res.table?.forEach(row => {
        sumPayment += parseMoney(row['Taksit Tutarı']);
        sumPrincipal += parseMoney(row['Anapara']);
        sumInterest += parseMoney(row['Faiz']);
        sumKKDF += parseMoney(row['KKDF']);
        sumBSMV += parseMoney(row['BSMV']);
      });

      expect(Math.round(sumPayment * 100) / 100).toBe(131976.09);
      expect(Math.round(sumPrincipal * 100) / 100).toBe(100000.00);
      expect(Math.round(sumInterest * 100) / 100).toBe(24596.99);
      expect(Math.round(sumKKDF * 100) / 100).toBe(3689.55);
      expect(Math.round(sumBSMV * 100) / 100).toBe(3689.55);

      // Son taksit kapanış düzeltmesi
      const lastRow = res.table![11];
      expect(parseMoney(lastRow['Taksit Tutarı'])).toBe(10997.98);
      expect(parseMoney(lastRow['Kalan Bakiye'])).toBe(0.00);
    });

    it('BDDK 13.02.2025 / 11152 sayılı karar metinleri ve eşikleri doğrulanmalı', () => {
      const def = consumerLoanCalculatorDef;
      const allText = JSON.stringify(def.metadata);
      
      expect(allText).toContain('11152');
      expect(allText).toContain('125.000');
      expect(allText).toContain('250.000');
      expect(allText).toContain('36 ay');
      expect(allText).toContain('24 ay');
      expect(allText).toContain('12 ay');
      expect(allText).not.toMatch(/(?<![0-9])50\.000\s*TL/); // Eski 2022 eşiği (50.000 TL) bulunmamalı
      expect(allText).toContain('https://www.bddk.org.tr/');
    });

    it('Zod şeması ve geçersiz girdiler test edilmeli', () => {
      const def = consumerLoanCalculatorDef;
      expect(() => def.schema.parse({ loanAmount: 0, monthlyInterestRate: 3.5, termMonths: 12 })).toThrow();
      expect(() => def.schema.parse({ loanAmount: 100000, monthlyInterestRate: -1, termMonths: 12 })).toThrow();
      expect(() => def.schema.parse({ loanAmount: 100000, monthlyInterestRate: 3.5, termMonths: 0 })).toThrow();
      expect(() => def.schema.parse({ loanAmount: 100000, monthlyInterestRate: 3.5, termMonths: 12.5 })).toThrow();
      
      const valid = def.schema.safeParse({ loanAmount: 100000, monthlyInterestRate: 3.5, termMonths: 12 });
      expect(valid.success).toBe(true);
    });
  });

  describe('Taşıt Kredisi: Matematik ve Kuruş Mutabakatı', () => {
    it('500.000 TL / %3,5 / 36 ay senaryosu kuruşu kuruşuna doğrulanmalı', () => {
      const res = calculateVehicleLoan(500000, 3.5, 36);
      
      const monthlyPayment = parseMoney(res.primaryResult);
      const totalInterest = parseMoney(res.secondaryResults['Toplam Faiz'] as string);
      const totalKKDF = parseMoney(res.secondaryResults['KKDF (%15)'] as string);
      const totalBSMV = parseMoney(res.secondaryResults['BSMV (%15)'] as string);
      const totalTax = parseMoney(res.secondaryResults['Toplam Vergi'] as string);
      const totalPayment = parseMoney(res.secondaryResults['Toplam Ödeme'] as string);

      expect(monthlyPayment).toBe(28491.91);
      expect(totalInterest).toBe(404391.16);
      expect(totalKKDF).toBe(60658.68);
      expect(totalBSMV).toBe(60658.68);
      expect(totalTax).toBe(121317.36);
      expect(totalPayment).toBe(1025708.52);

      // Kuruş mutabakatı: Anapara + Saf Faiz + KKDF + BSMV === Toplam Ödeme
      expect(500000 + totalInterest + totalKKDF + totalBSMV).toBe(1025708.52);

      // Amortisman tablosu dönem toplamları
      expect(res.table).toBeDefined();
      expect(res.table?.length).toBe(36);

      let sumPayment = 0;
      let sumPrincipal = 0;
      let sumInterest = 0;
      let sumKKDF = 0;
      let sumBSMV = 0;

      res.table?.forEach(row => {
        sumPayment += parseMoney(row['Taksit Tutarı']);
        sumPrincipal += parseMoney(row['Anapara']);
        sumInterest += parseMoney(row['Faiz']);
        sumKKDF += parseMoney(row['KKDF']);
        sumBSMV += parseMoney(row['BSMV']);
      });

      expect(Math.round(sumPayment * 100) / 100).toBe(1025708.52);
      expect(Math.round(sumPrincipal * 100) / 100).toBe(500000.00);
      expect(Math.round(sumInterest * 100) / 100).toBe(404391.16);
      expect(Math.round(sumKKDF * 100) / 100).toBe(60658.68);
      expect(Math.round(sumBSMV * 100) / 100).toBe(60658.68);

      // Son taksit kapanış düzeltmesi
      const lastRow = res.table![35];
      expect(parseMoney(lastRow['Taksit Tutarı'])).toBe(28491.67);
      expect(parseMoney(lastRow['Kalan Bakiye'])).toBe(0.00);
    });

    it('BDDK 10099, 10586, 10880, 11158 kararları doğru referanslanmalı, 10656 bulunmamalı', () => {
      const def = vehicleLoanCalculatorDef;
      const allText = JSON.stringify(def.metadata);
      
      expect(allText).toContain('10099');
      expect(allText).toContain('10586');
      expect(allText).toContain('10880');
      expect(allText).toContain('11158');
      expect(allText).not.toContain('10656'); // 10656 konut kararıdır, bulunmamalı

      // İthal elektrikli araç ve yerli elektrikli ayrımı
      expect(allText).toContain('İthal Elektrikli');
      expect(allText).toContain('Türkiye\'de üretilen elektrik motorlu');
      expect(allText).toContain('simülasyon');
      expect(allText).toContain('https://www.bddk.org.tr/');
    });

    it('Zod şeması ve geçersiz girdiler test edilmeli', () => {
      const def = vehicleLoanCalculatorDef;
      expect(() => def.schema.parse({ loanAmount: -500, monthlyInterestRate: 3.5, termMonths: 36 })).toThrow();
      expect(() => def.schema.parse({ loanAmount: 500000, monthlyInterestRate: -0.1, termMonths: 36 })).toThrow();
      expect(() => def.schema.parse({ loanAmount: 500000, monthlyInterestRate: 3.5, termMonths: 0 })).toThrow();
      
      const valid = def.schema.safeParse({ loanAmount: 500000, monthlyInterestRate: 3.5, termMonths: 36 });
      expect(valid.success).toBe(true);
    });
  });

  describe('Ortak Amortisman Tüketicilerinin Korunması (Regresyon Denetimi)', () => {
    it('Konut Kredisi (Mortgage) vergiden etkilenmemeli ve doğru çalışmalı', () => {
      // 1.000.000 TL, %2.5 faiz, 120 ay konut kredisi (KKDF %0, BSMV %0)
      const res = calculateMortgageLoan(1000000, 2.5, 120);
      const monthlyPayment = parseMoney(res.primaryResult);
      expect(monthlyPayment).toBeGreaterThan(0);
      expect(res.table?.length).toBe(120);
    });

    it('Ticari Kredi (Commercial Loan) bağımsız çalışmaya devam etmeli', () => {
      // 500.000 TL, %3.0 faiz, 24 ay
      const res = calculateCommercialLoan(500000, 3.0, 24);
      const monthlyPayment = parseMoney(res.primaryResult);
      expect(monthlyPayment).toBeGreaterThan(0);
      expect(res.table?.length).toBe(24);
    });
  });
});
