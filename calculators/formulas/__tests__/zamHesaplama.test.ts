import { describe, it, expect } from 'vitest';
import { calculateZamHesaplama } from '../zamHesaplama';

describe('calculateZamHesaplama Formula', () => {
  it('TEST 1: 1000 + 20%', () => {
    const res = calculateZamHesaplama({ mod: 'zam-ekle', eskiFiyat: 1000, zamOrani: 20 });
    expect(res.primaryResult).toBe(1200);
    expect(res.secondaryResults['Zam Tutarı']).toBe(200);
  });

  it('TEST 2: 2500 + 10%', () => {
    const res = calculateZamHesaplama({ mod: 'zam-ekle', eskiFiyat: 2500, zamOrani: 10 });
    expect(res.primaryResult).toBe(2750);
    expect(res.secondaryResults['Zam Tutarı']).toBe(250);
  });

  it('TEST 3: 1000 -> 1250', () => {
    const res = calculateZamHesaplama({ mod: 'oran-bul', eskiFiyat: 1000, yeniFiyat: 1250 });
    expect(res.primaryResult).toBe(25);
    expect(res.secondaryResults['Artış Tutarı']).toBe(250);
  });

  it('TEST 4: 800 -> 1000', () => {
    const res = calculateZamHesaplama({ mod: 'oran-bul', eskiFiyat: 800, yeniFiyat: 1000 });
    expect(res.primaryResult).toBe(25);
    expect(res.secondaryResults['Artış Tutarı']).toBe(200);
  });

  it('TEST 5: 1200 yeni, 20% zam -> eski fiyat bul', () => {
    const res = calculateZamHesaplama({ mod: 'eski-fiyat-bul', yeniFiyat: 1200, zamOrani: 20 });
    expect(res.primaryResult).toBeCloseTo(1000, 5);
    expect(res.secondaryResults['Zam Tutarı']).toBe(200);
  });

  it('TEST 6: 1100 yeni, 10% zam -> eski fiyat bul', () => {
    const res = calculateZamHesaplama({ mod: 'eski-fiyat-bul', yeniFiyat: 1100, zamOrani: 10 });
    expect(res.primaryResult).toBeCloseTo(1000, 5);
    expect(res.secondaryResults['Zam Tutarı']).toBeCloseTo(100, 5);
  });

  it('TEST 7: 1234.56 + 12.5%', () => {
    const res = calculateZamHesaplama({ mod: 'zam-ekle', eskiFiyat: 1234.56, zamOrani: 12.5 });
    expect(res.primaryResult).toBeCloseTo(1388.88, 2);
  });

  it('TEST 8: 1000000 + 20%', () => {
    const res = calculateZamHesaplama({ mod: 'zam-ekle', eskiFiyat: 1000000, zamOrani: 20 });
    expect(res.primaryResult).toBe(1200000);
  });
});
