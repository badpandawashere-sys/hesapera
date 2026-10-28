import { calculateWorkplaceLoan, resolveTaxRates } from '../workplaceLoan';
import { workplaceLoanCalculatorDef } from '../../definitions/workplaceLoan';
import { describe, it, expect } from 'vitest';

describe('İş Yeri Kredisi Hesaplama — Master #2 Güvenli Doğrulama', () => {
  // Senaryo 1: 1.000.000 TL / %3,50 / 60 ay (Ticari Müşteri: %5 BSMV, %0 KKDF)
  it('Senaryo 1: 1.000.000 TL / %3,50 / 60 ay ticari kredi bağımsız matematiksel test vektörünü doğrulamalı', () => {
    const res = calculateWorkplaceLoan(1000000, 3.5, 60, 'commercial');
    expect(res.primaryLabel).toBe('Aylık Taksit Tutarı');
    expect(res.rawValues.monthlyPayment).toBe(41511.28);
    expect(res.rawValues.totalInterest).toBe(1419691.77);
    expect(res.rawValues.totalBSMV).toBe(70984.62);
    expect(res.rawValues.totalKKDF).toBe(0.0);
    expect(res.rawValues.totalPayment).toBe(2490676.39);
    expect(res.table.length).toBe(60);
  });

  // Senaryo 2: 5.000.000 TL / %3,00 / 120 ay (Ticari Müşteri azami vade)
  it('Senaryo 2: 5.000.000 TL / %3,00 / 120 ay bağımsız test vektörünü doğrulamalı', () => {
    const res = calculateWorkplaceLoan(5000000, 3.0, 120, 'commercial');
    expect(res.rawValues.monthlyPayment).toBe(161404.89);
    expect(res.rawValues.totalInterest).toBe(13684368.73);
    expect(res.rawValues.totalBSMV).toBe(684218.46);
    expect(res.rawValues.totalKKDF).toBe(0.0);
    expect(res.rawValues.totalPayment).toBe(19368587.19);
    expect(res.table.length).toBe(120);
  });

  // Senaryo 3: %0 Faiz
  it('Senaryo 3: %0 faiz durumunda taksit ve toplam ödeme anaparaya eşit olmalı', () => {
    const res = calculateWorkplaceLoan(100000, 0, 10, 'commercial');
    expect(res.rawValues.monthlyPayment).toBe(10000.0);
    expect(res.rawValues.totalPayment).toBe(100000.0);
    expect(res.rawValues.totalInterest).toBe(0.0);
    expect(res.rawValues.totalBSMV).toBe(0.0);
    expect(res.rawValues.totalKKDF).toBe(0.0);
  });

  // Senaryo 4: 1 Ay Vade
  it('Senaryo 4: 1 ay vade durumunda anapara ve tek dönem faiz/vergi doğru hesaplanmalı', () => {
    const res = calculateWorkplaceLoan(50000, 2.0, 1, 'commercial');
    // 50.000 anapara + 1.000 faiz + 50 BSMV (%5) = 51.050 TL
    expect(res.rawValues.monthlyPayment).toBe(51050.0);
    expect(res.rawValues.totalPayment).toBe(51050.0);
    expect(res.rawValues.totalInterest).toBe(1000.0);
    expect(res.rawValues.totalBSMV).toBe(50.0);
    expect(res.table.length).toBe(1);
  });

  // Senaryo 5: Negatif Tutar Doğrulaması (Zod)
  it('Senaryo 5: Negatif kredi tutarı Zod şeması tarafından reddedilmeli', () => {
    const parseResult = workplaceLoanCalculatorDef.schema.safeParse({
      loanAmount: -1000,
      monthlyInterestRate: 3.5,
      termMonths: 60
    });
    expect(parseResult.success).toBe(false);
  });

  // Senaryo 6: Sıfır Tutar Doğrulaması (Zod)
  it('Senaryo 6: Sıfır kredi tutarı Zod şeması tarafından reddedilmeli', () => {
    const parseResult = workplaceLoanCalculatorDef.schema.safeParse({
      loanAmount: 0,
      monthlyInterestRate: 3.5,
      termMonths: 60
    });
    expect(parseResult.success).toBe(false);
  });

  // Senaryo 7: Geçersiz Vade Doğrulaması (Zod)
  it('Senaryo 7: 0, negatif ve 120 aydan büyük vadeler reddedilmeli', () => {
    expect(workplaceLoanCalculatorDef.schema.safeParse({ loanAmount: 100000, monthlyInterestRate: 3, termMonths: 0 }).success).toBe(false);
    expect(workplaceLoanCalculatorDef.schema.safeParse({ loanAmount: 100000, monthlyInterestRate: 3, termMonths: -12 }).success).toBe(false);
    expect(workplaceLoanCalculatorDef.schema.safeParse({ loanAmount: 100000, monthlyInterestRate: 3, termMonths: 121 }).success).toBe(false);
    expect(workplaceLoanCalculatorDef.schema.safeParse({ loanAmount: 100000, monthlyInterestRate: 3, termMonths: 60 }).success).toBe(true);
  });

  // Senaryo 8: Vergili Hesaplama (Bireysel Yatırımcı: %15 BSMV, %15 KKDF)
  it('Senaryo 8: Bireysel yatırımcı statüsünde %15 BSMV ve %15 KKDF rejimini doğru hesaplamalı', () => {
    const res = calculateWorkplaceLoan(1000000, 3.5, 60, 'individual');
    expect(res.rawValues.bsmvRate).toBe(15);
    expect(res.rawValues.kkdfRate).toBe(15);
    expect(res.rawValues.monthlyPayment).toBe(48886.46);
    expect(res.rawValues.totalInterest).toBe(1487067.81);
    expect(res.rawValues.totalBSMV).toBe(223060.2);
    expect(res.rawValues.totalKKDF).toBe(223060.2);
    expect(res.rawValues.totalPayment).toBe(2933188.21);
  });

  // Senaryo 9: Vergisiz / Yalın Hesaplama (Exempt: %0 BSMV, %0 KKDF)
  it('Senaryo 9: Yalın vergisiz rejimde yalnızca anüite faizi hesaplanmalı ve kanuni muafiyet olmadığı belirtilmeli', () => {
    const res = calculateWorkplaceLoan(1000000, 3.5, 60, 'exempt');
    expect(res.rawValues.bsmvRate).toBe(0);
    expect(res.rawValues.kkdfRate).toBe(0);
    expect(res.rawValues.monthlyPayment).toBe(40088.62);
    expect(res.rawValues.totalInterest).toBe(1405317.54);
    expect(res.rawValues.totalBSMV).toBe(0);
    expect(res.rawValues.totalKKDF).toBe(0);
    expect(res.rawValues.totalPayment).toBe(2405317.54);
    expect(res.secondaryResults['Vergi Rejimi']).toContain('Vergisiz Karşılaştırma Modu');
    expect(res.secondaryResults['Vergi Rejimi']).toContain('Kanuni muafiyet değildir');
    expect(res.infoReference?.description).toContain('2020/4');
  });

  // Senaryo 10: Toplam Anapara Kontrolü
  it('Senaryo 10: Taksit tablosundaki anapara ödemelerinin toplamı kredi tutarına tam eşit olmalı', () => {
    const loanAmount = 1500000;
    const res = calculateWorkplaceLoan(loanAmount, 3.25, 48, 'commercial');
    const totalPrincipal = res.rawValues.schedule.reduce((acc, row) => acc + row.principalPaid, 0);
    expect(Math.round(totalPrincipal * 100) / 100).toBe(loanAmount);
  });

  // Senaryo 11: Toplam Faiz Kontrolü
  it('Senaryo 11: Taksit tablosundaki faiz ödemelerinin toplamı totalInterest ile birebir eşleşmeli', () => {
    const res = calculateWorkplaceLoan(750000, 3.4, 36, 'commercial');
    const tableInterest = res.rawValues.schedule.reduce((acc, row) => acc + row.interestPaid, 0);
    expect(Math.round(tableInterest * 100) / 100).toBe(res.rawValues.totalInterest);
  });

  // Senaryo 12: Son Taksit Yuvarlama Kontrolü
  it('Senaryo 12: Son taksitte kalan anapara bakiyesi tam olarak 0 olmalı', () => {
    const res = calculateWorkplaceLoan(1234567, 3.67, 47, 'commercial');
    const lastRow = res.rawValues.schedule[res.rawValues.schedule.length - 1];
    expect(lastRow.remainingPrincipal).toBe(0);
  });

  // Senaryo 13: Ödeme Planı ve Özetin Eşitliği
  it('Senaryo 13: Taksit tablosundaki tüm taksit tutarlarının toplamı totalPayment ile tam eşit olmalı', () => {
    const res = calculateWorkplaceLoan(2000000, 3.15, 84, 'commercial');
    const sumPayments = res.rawValues.schedule.reduce((acc, row) => acc + row.payment, 0);
    expect(Math.round(sumPayments * 100) / 100).toBe(res.rawValues.totalPayment);
  });

  // Senaryo 14: Canonical URL Doğrulaması
  it('Senaryo 14: Canonical URL doğru domain ve /hesaplama/ öneki ile tanımlanmış olmalı', () => {
    expect(workplaceLoanCalculatorDef.metadata.canonical).toBe('https://www.hesapera.com.tr/hesaplama/is-yeri-kredisi');
  });

  // Senaryo 15: Sonuç Etiketinin Doğrulanması
  it('Senaryo 15: Birincil sonuç etiketi kesinlikle "Aylık Taksit Tutarı" olmalı', () => {
    const res = calculateWorkplaceLoan(1000000, 3.5, 60);
    expect(res.primaryLabel).toBe('Aylık Taksit Tutarı');
  });

  // Metadata, FAQ, Content ve Published Statüsü Doğrulamaları
  it('Published statüsü, FAQ, icon, features ve zengin rehber içerikleri eksiksiz olmalı', () => {
    expect(workplaceLoanCalculatorDef.status).toBe('published');
    expect(workplaceLoanCalculatorDef.slug).toBe('is-yeri-kredisi');
    expect(workplaceLoanCalculatorDef.metadata.icon).toBe('Building2');
    expect(workplaceLoanCalculatorDef.metadata.features?.length).toBeGreaterThanOrEqual(3);
    expect(workplaceLoanCalculatorDef.metadata.infoBox?.title).toBeDefined();
    expect(workplaceLoanCalculatorDef.metadata.faq?.length).toBeGreaterThanOrEqual(5);
    expect(workplaceLoanCalculatorDef.metadata.content?.sections.length).toBeGreaterThanOrEqual(3);
    expect(workplaceLoanCalculatorDef.metadata.content?.sources?.length).toBeGreaterThanOrEqual(2);
    expect(workplaceLoanCalculatorDef.fields.find(f => f.id === 'loanAmount')?.defaultValue).toBe(1000000);
    expect(workplaceLoanCalculatorDef.fields.find(f => f.id === 'monthlyInterestRate')?.defaultValue).toBe(3.50);
    expect(workplaceLoanCalculatorDef.fields.find(f => f.id === 'termMonths')?.defaultValue).toBe(60);
    expect(workplaceLoanCalculatorDef.fields.find(f => f.id === 'termMonths')?.step).toBe(1);
  });
});