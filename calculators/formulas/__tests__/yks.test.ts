import { calculateYks } from '../yks';
import { describe, it, expect } from 'vitest';

describe('YKS Calculator', () => {
  it('should calculate SAY correctly with OBP', () => {
    // Perfect score scenario
    const input: any = {
      puanTuru: 'SAY',
      tytTurkceC: 40, tytTurkceW: 0,
      tytSosyalC: 20, tytSosyalW: 0,
      tytMatC: 40, tytMatW: 0,
      tytFenC: 20, tytFenW: 0,
      aytMatC: 40, aytMatW: 0,
      aytFizikC: 14, aytFizikW: 0,
      aytKimyaC: 13, aytKimyaW: 0,
      aytBiyoC: 13, aytBiyoW: 0,
      diplomaNotu: 100, isKirikObp: false
    };
    const res = calculateYks(input);
    // 500 max score expected approx
    expect(parseFloat(res.primaryResult)).toBeCloseTo(500, 0); // Might be slightly off due to multipliers
    // OBP should add exactly 60
    expect(res.secondaryResults['OBP Katkısı']).toContain('60.00');
  });

  it('should calculate EA correctly without OBP', () => {
    const input: any = {
      puanTuru: 'EA',
      tytTurkceC: 30, tytTurkceW: 0,
      tytSosyalC: 15, tytSosyalW: 0,
      tytMatC: 20, tytMatW: 0,
      tytFenC: 0, tytFenW: 0,
      aytMatC: 20, aytMatW: 0,
      aytEdebiyatC: 15, aytEdebiyatW: 0,
      aytTarih1C: 5, aytTarih1W: 0,
      aytCografya1C: 5, aytCografya1W: 0
    };
    const res = calculateYks(input);
    // Check EA specific outputs
    expect(res.secondaryResults['EA Puanı']).toBeDefined();
    expect(res.secondaryResults['OBP Katkısı']).toBeUndefined();
  });

  it('should calculate DIL correctly with kirik OBP', () => {
    const input: any = {
      puanTuru: 'DIL',
      tytTurkceC: 30, tytTurkceW: 0,
      tytSosyalC: 15, tytSosyalW: 0,
      tytMatC: 20, tytMatW: 0,
      tytFenC: 0, tytFenW: 0,
      ydtDilC: 70, ydtDilW: 0,
      diplomaNotu: 100, isKirikObp: true
    };
    const res = calculateYks(input);
    expect(res.secondaryResults['OBP Katkısı']).toContain('30.00'); // 100 diploma * 5 = 500 -> * 0.06 = 30
    expect(res.secondaryResults['DİL Puanı']).toBeDefined();
  });

  it('should handle zero net scenario correctly', () => {
    const input: any = {
      puanTuru: 'SOZ',
      tytTurkceC: 0, tytTurkceW: 0, tytSosyalC: 0, tytSosyalW: 0, tytMatC: 0, tytMatW: 0, tytFenC: 0, tytFenW: 0,
      aytEdebiyatC: 0, aytEdebiyatW: 0, aytTarih1C: 0, aytTarih1W: 0, aytCografya1C: 0, aytCografya1W: 0,
      aytTarih2C: 0, aytTarih2W: 0, aytCografya2C: 0, aytCografya2W: 0, aytFelsefeC: 0, aytFelsefeW: 0, aytDinC: 0, aytDinW: 0
    };
    const res = calculateYks(input);
    expect(parseFloat(res.primaryResult)).toBe(100); // Taban 100
  });

  it('should apply penalty correctly (4 wrong = 1 correct)', () => {
    const input: any = {
      puanTuru: 'DIL',
      tytTurkceC: 0, tytTurkceW: 0, tytSosyalC: 0, tytSosyalW: 0, tytMatC: 0, tytMatW: 0, tytFenC: 0, tytFenW: 0,
      ydtDilC: 40, ydtDilW: 20 // 40 - 5 = 35 net
    };
    const res = calculateYks(input);
    expect(res.secondaryResults['YDT Net']).toBe('35.00');
  });
});
