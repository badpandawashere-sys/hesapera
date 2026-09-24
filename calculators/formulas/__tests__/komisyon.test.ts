import { describe, it, expect } from 'vitest';
import { calculateKomisyon } from '../komisyon';

describe('Komisyon Hesaplama Formülü', () => {
  it('TEST 1: Satış 1000, Komisyon %10 => Komisyon 100, Net 900', () => {
    const res = calculateKomisyon({
      mode: 'calculate_commission',
      grossAmount: 1000,
      commissionRate: 10
    });
    expect(res.success).toBe(true);
    expect(res.commissionAmount).toBe(100);
    expect(res.netAmount).toBe(900);
  });

  it('TEST 2: Satış 2500, Komisyon %20 => Komisyon 500, Net 2000', () => {
    const res = calculateKomisyon({
      mode: 'calculate_commission',
      grossAmount: 2500,
      commissionRate: 20
    });
    expect(res.success).toBe(true);
    expect(res.commissionAmount).toBe(500);
    expect(res.netAmount).toBe(2000);
  });

  it('TEST 3: Hedef net 900, Komisyon %10 => Satış 1000, Komisyon 100', () => {
    const res = calculateKomisyon({
      mode: 'calculate_target_gross',
      targetNet: 900,
      commissionRate: 10
    });
    expect(res.success).toBe(true);
    expect(res.grossAmount).toBe(1000);
    expect(res.commissionAmount).toBe(100);
  });

  it('TEST 4: Hedef net 800, Komisyon %20 => Satış 1000, Komisyon 200', () => {
    const res = calculateKomisyon({
      mode: 'calculate_target_gross',
      targetNet: 800,
      commissionRate: 20
    });
    expect(res.success).toBe(true);
    expect(res.grossAmount).toBe(1000);
    expect(res.commissionAmount).toBe(200);
  });

  it('TEST 5: Satış 1000, Komisyon tutarı 150 => Oran %15, Net 850', () => {
    const res = calculateKomisyon({
      mode: 'calculate_rate',
      grossAmount: 1000,
      commissionAmount: 150
    });
    expect(res.success).toBe(true);
    expect(res.commissionRate).toBe(15);
    expect(res.netAmount).toBe(850);
  });

  it('TEST 6: Satış 1250, Komisyon 125 => Oran %10, Net 1125', () => {
    const res = calculateKomisyon({
      mode: 'calculate_rate',
      grossAmount: 1250,
      commissionAmount: 125
    });
    expect(res.success).toBe(true);
    expect(res.commissionRate).toBe(10);
    expect(res.netAmount).toBe(1125);
  });

  it('TEST 7: Decimal 1234,56 ve %12,5 çalışmalı', () => {
    const res = calculateKomisyon({
      mode: 'calculate_commission',
      grossAmount: 1234.56,
      commissionRate: 12.5
    });
    expect(res.success).toBe(true);
    expect(res.commissionAmount).toBeCloseTo(154.32, 2);
    expect(res.netAmount).toBeCloseTo(1080.24, 2);
  });

  it('TEST 8: 1000000 %20 => 200000 komisyon => 800000 net', () => {
    const res = calculateKomisyon({
      mode: 'calculate_commission',
      grossAmount: 1000000,
      commissionRate: 20
    });
    expect(res.success).toBe(true);
    expect(res.commissionAmount).toBe(200000);
    expect(res.netAmount).toBe(800000);
  });

  it('Validation - should fail if negative', () => {
    const res = calculateKomisyon({
      mode: 'calculate_commission',
      grossAmount: -100,
      commissionRate: 10
    });
    expect(res.success).toBe(false);
  });

  it('Validation - should fail if commission rate >= 100 in Mode B', () => {
    const res = calculateKomisyon({
      mode: 'calculate_target_gross',
      targetNet: 100,
      commissionRate: 100
    });
    expect(res.success).toBe(false);
  });

  it('Validation - should fail if commission amount > gross in Mode C', () => {
    const res = calculateKomisyon({
      mode: 'calculate_rate',
      grossAmount: 100,
      commissionAmount: 150
    });
    expect(res.success).toBe(false);
  });
});
