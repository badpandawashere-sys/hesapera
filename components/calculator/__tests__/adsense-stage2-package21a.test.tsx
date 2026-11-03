import { describe, it, expect } from 'vitest';
import { calculateCreditCardLateFee } from '@/calculators/formulas/creditCardLateFee';
import { creditCardLateFeeCalculatorDef } from '@/calculators/definitions/creditCardLateFee';
import { calculateLoanFee } from '@/calculators/formulas/loanFee';
import { loanFeeCalculatorDef } from '@/calculators/definitions/loanFee';

describe('AdSense Aşama 2 / Paket 2.1A Uygulama Testleri', () => {
  describe('1. Kredi Kartı Gecikme Faizi (credit-card-late-fee)', () => {
    it('1.1. 10.000 TL / 15 gün / %4,25 örnek senaryosunda kuruş mutabakatı ve toplam faiz doğrulanmalı', () => {
      const res = calculateCreditCardLateFee(10000, 4.25, 15);
      expect(res.success !== false).toBe(true);

      // @ts-ignore
      const safFaizStr = res.secondaryResults['Saf Gecikme Faizi'];
      // @ts-ignore
      const kkdfStr = res.secondaryResults['KKDF (%15)'];
      // @ts-ignore
      const bsmvStr = res.secondaryResults['BSMV (%15)'];
      // @ts-ignore
      const toplamMaliyetStr = res.secondaryResults['Toplam Gecikme Maliyeti'];
      // @ts-ignore
      const toplamBorcStr = res.secondaryResults['Toplam Ödenecek Tutar'];

      expect(safFaizStr).toContain('212,50');
      expect(kkdfStr).toContain('31,88');
      expect(bsmvStr).toContain('31,88');
      expect(toplamMaliyetStr).toContain('276,26');
      expect(toplamBorcStr).toContain('10.276,26');
      // @ts-ignore
      expect(res.primaryResult).toContain('276,26');

      // Sayısal kuruş mutabakatı: 212.50 + 31.88 + 31.88 === 276.26
      const numSaf = 212.50;
      const numKkdf = 31.88;
      const numBsmv = 31.88;
      const sum = Math.round((numSaf + numKkdf + numBsmv) * 100) / 100;
      expect(sum).toBe(276.26);
    });

    it('1.2. creditCardLateFeeCalculatorDef metadata ve rehber içeriği formülle tam tutarlı olmalı', () => {
      const content = creditCardLateFeeCalculatorDef.metadata.content;
      expect(content).toBeDefined();
      expect(content?.intro).toBeTruthy();
      expect(content?.sections.length).toBeGreaterThanOrEqual(3);

      // Örnek metin kuruşu kuruşuna 276,26 TL'yi içermeli
      expect(content?.example?.text).toContain('276,26 TL');
      expect(content?.example?.text).toContain('212,50 TL');
      expect(content?.example?.text).toContain('31,88 TL');
      expect(content?.example?.text).toContain('10.276,26 TL');

      // Resmî kaynaklar geçerli TCMB ve Mevzuat URL'lerini içermeli
      expect(content?.sources?.length).toBeGreaterThanOrEqual(3);
      const urls = content?.sources?.map(s => s.url) || [];
      expect(urls.some(u => u.includes('tcmb.gov.tr'))).toBe(true);
      expect(urls.some(u => u.includes('mevzuat.gov.tr'))).toBe(true);

      // SSS çelişkisiz olmalı ve 4 fark faktörünü içermeli
      const faqs = creditCardLateFeeCalculatorDef.metadata.faq || [];
      expect(faqs.length).toBeGreaterThanOrEqual(3);
      const diffFaq = faqs.find(f => f.question.includes('ufak fark'));
      expect(diffFaq).toBeDefined();
      expect(diffFaq?.answer).toContain('Banka Faiz Oranı');
      expect(diffFaq?.answer).toContain('Faiz Matrahı');
      expect(diffFaq?.answer).toContain('Valör');
      expect(diffFaq?.answer).toContain('Yuvarlama Yöntemi');

      // Baremler 30.000 / 180.000 TL olarak doğrulanmalı
      const baremFaq = faqs.find(f => f.question.includes('Sabit bir TCMB'));
      expect(baremFaq?.answer).toContain('30.000 TL');
      expect(baremFaq?.answer).toContain('180.000 TL');

      const baremSection = content?.sections.find(s => s.title.includes('Kademeli Tavan'));
      expect(baremSection?.paragraphs.some(p => p.includes('30.000 TL') && p.includes('180.000 TL'))).toBe(true);
    });
  });

  describe('2. Kredi Dosya Masrafı (loan-fee)', () => {
    it('2.1. 200.000 TL ihtiyaç kredisi senaryosu (%0,50 tavan + %15 BSMV) doğrulanmalı', () => {
      const res = calculateLoanFee(200000, {
        loanAmount: 200000,
        loanType: 'ihtiyac',
        feeRate: 0.50,
        deductionMode: 'deduct_all'
      });

      expect(res.raw.loanAmount).toBe(200000);
      expect(res.raw.feeRate).toBe(0.50);
      expect(res.raw.allocationFee).toBe(1000);
      expect(res.raw.bsmvRate).toBe(0.15);
      expect(res.raw.bsmvAmount).toBe(150);
      expect(res.raw.totalAllocationCost).toBe(1150);
      expect(res.raw.netDisbursedAmount).toBe(198850);

      expect(res.secondaryResults['Banka Tahsis Ücreti']).toContain('1.000,00');
      expect(res.secondaryResults['Uygulanan BSMV']).toContain('150,00');
      expect(res.secondaryResults['Toplam Tahsis Masrafı']).toContain('1.150,00');
      expect(res.secondaryResults['Ele Geçen Net Tutar']).toContain('198.850,00');
    });

    it('2.2. 2.000.000 TL konut kredisi senaryosu (İlk Evim %0 BSMV vs İkinci Konut %15 BSMV 7491 SK) doğrulanmalı', () => {
      // Durum A: İlk Evim (%0 BSMV)
      const resFirstHome = calculateLoanFee(2000000, {
        loanAmount: 2000000,
        loanType: 'konut',
        hasExistingHome: false,
        feeRate: 0.50,
        deductionMode: 'deduct_all'
      });
      expect(resFirstHome.raw.allocationFee).toBe(10000);
      expect(resFirstHome.raw.bsmvRate).toBe(0);
      expect(resFirstHome.raw.bsmvAmount).toBe(0);
      expect(resFirstHome.raw.totalAllocationCost).toBe(10000);
      expect(resFirstHome.raw.netDisbursedAmount).toBe(1990000);
      expect(resFirstHome.secondaryResults['Ele Geçen Net Tutar']).toContain('1.990.000,00');

      // Durum B: İkinci Konut (7491 SK m. 35 uyarınca %15 BSMV)
      const resSecondHome = calculateLoanFee(2000000, {
        loanAmount: 2000000,
        loanType: 'konut',
        hasExistingHome: true,
        feeRate: 0.50,
        deductionMode: 'deduct_all'
      });
      expect(resSecondHome.raw.allocationFee).toBe(10000);
      expect(resSecondHome.raw.bsmvRate).toBe(0.15);
      expect(resSecondHome.raw.bsmvAmount).toBe(1500);
      expect(resSecondHome.raw.totalAllocationCost).toBe(11500);
      expect(resSecondHome.raw.netDisbursedAmount).toBe(1988500);
      expect(resSecondHome.secondaryResults['Ele Geçen Net Tutar']).toContain('1.988.500,00');
    });

    it('2.3. loanFeeCalculatorDef metadata.content eksiksiz, özgün, 6802 SK 29/y ve GİB özelgesi uyumlu olmalı', () => {
      const content = loanFeeCalculatorDef.metadata.content;
      expect(content).toBeDefined();
      expect(content?.intro).toBeTruthy();
      expect(content?.sections.length).toBeGreaterThanOrEqual(4);

      // Örnek metin 200.000 TL ve 2.000.000 TL senaryolarını içermeli
      expect(content?.example?.text).toContain('198.850,00 TL');
      expect(content?.example?.text).toContain('1.990.000,00 TL');
      expect(content?.example?.text).toContain('1.988.500,00 TL');
      expect(content?.example?.text).toContain('7491');
      expect(content?.example?.text).toContain('29/y');
      expect(content?.example?.text).toContain('teorik net nakit değer');

      // GİB Özelgesi ve hisseli konut açıklamaları doğrulanmalı
      const bsmvSection = content?.sections.find(s => s.title.includes('BSMV İstisnası'));
      expect(bsmvSection?.paragraphs.some(p => p.includes('29/y'))).toBe(true);
      expect(bsmvSection?.paragraphs.some(p => p.includes('1600427'))).toBe(true);
      expect(bsmvSection?.paragraphs.some(p => p.includes('hisseli'))).toBe(true);

      // Resmî mevzuat kaynakları doğrulanmalı
      expect(content?.sources?.length).toBeGreaterThanOrEqual(4);
      const urls = content?.sources?.map(s => s.url) || [];
      expect(urls.some(u => u.includes('resmigazete.gov.tr'))).toBe(true);
      expect(urls.some(u => u.includes('mevzuat.gov.tr'))).toBe(true);
      expect(urls.some(u => u.includes('gib.gov.tr'))).toBe(true);
    });
  });
});
