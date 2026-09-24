import { describe, it, expect } from 'vitest';
import { calculateIndirim } from '../indirimHesaplama';

describe('calculateIndirim Formula', () => {
  it('TEST 1: 1000 normal, 20% indirim', () => {
    const res = calculateIndirim({ mod: 'yuzde', normalFiyat: 1000, indirimOrani: 20 });
    expect(res.primaryResult).toBe(800);
    expect(res.secondaryResults['İndirim Tutarı']).toBe(200);
  });

  it('TEST 2: 2500 normal, 10% indirim', () => {
    const res = calculateIndirim({ mod: 'yuzde', normalFiyat: 2500, indirimOrani: 10 });
    expect(res.primaryResult).toBe(2250);
    expect(res.secondaryResults['İndirim Tutarı']).toBe(250);
  });

  it('TEST 3: 1000 normal, 800 indirimli => Oran Bul', () => {
    const res = calculateIndirim({ mod: 'oran-bul', normalFiyat: 1000, indirimliFiyat: 800 });
    expect(res.primaryResult).toBe(20);
    expect(res.secondaryResults['İndirim Tutarı']).toBe(200);
  });

  it('TEST 4: 1000 normal, 20% ve 10% coklu', () => {
    const res = calculateIndirim({ mod: 'coklu', normalFiyat: 1000, indirimOrani: 20, ikinciIndirimOrani: 10 });
    expect(res.primaryResult).toBe(720);
    expect(res.secondaryResults['Toplam Tasarruf']).toBe(280);
    expect(res.secondaryResults['Efektif İndirim Oranı']).toBe('%28');
  });

  it('TEST 5: 1000 normal, 50% ve 50% coklu', () => {
    const res = calculateIndirim({ mod: 'coklu', normalFiyat: 1000, indirimOrani: 50, ikinciIndirimOrani: 50 });
    expect(res.primaryResult).toBe(250);
    expect(res.secondaryResults['Efektif İndirim Oranı']).toBe('%75');
  });

  it('TEST 6: 1234.56, 12.5%', () => {
    const res = calculateIndirim({ mod: 'yuzde', normalFiyat: 1234.56, indirimOrani: 12.5 });
    expect(res.primaryResult).toBeCloseTo(1080.24, 2);
    expect(res.secondaryResults['İndirim Tutarı']).toBeCloseTo(154.32, 2);
  });

  it('TEST 7: 1000000 normal, 20% indirim', () => {
    const res = calculateIndirim({ mod: 'yuzde', normalFiyat: 1000000, indirimOrani: 20 });
    expect(res.primaryResult).toBe(800000);
  });
});
