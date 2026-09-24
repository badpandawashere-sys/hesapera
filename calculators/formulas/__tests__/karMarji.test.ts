import { describe, it, expect } from 'vitest';
import { calculateKarMarji } from '../karMarji';

describe('calculateKarMarji Formula', () => {
  it('TEST 1: Maliyet 100, Satis 125', () => {
    const res = calculateKarMarji({ mod: 'kar-zarar', maliyet: 100, satisFiyati: 125 });
    expect(res.primaryResult).toBe(25);
    expect(res.secondaryResults['Kâr Oranı']).toBe('%25');
    expect(res.secondaryResults['Kâr Marjı']).toBe('%20');
    expect(res.secondaryResults['Durum']).toBe('Kâr');
  });

  it('TEST 2: Maliyet 100, Satis 80', () => {
    const res = calculateKarMarji({ mod: 'kar-zarar', maliyet: 100, satisFiyati: 80 });
    expect(res.primaryResult).toBe(-20);
    expect(res.secondaryResults['Kâr Oranı']).toBe('%-20');
    expect(res.secondaryResults['Kâr Marjı']).toBe('%-25');
    expect(res.secondaryResults['Durum']).toBe('Zarar');
  });

  it('TEST 3: Maliyet 100, Satis 100', () => {
    const res = calculateKarMarji({ mod: 'kar-zarar', maliyet: 100, satisFiyati: 100 });
    expect(res.primaryResult).toBe(0);
    expect(res.secondaryResults['Kâr Oranı']).toBe('%0');
    expect(res.secondaryResults['Kâr Marjı']).toBe('%0');
    expect(res.secondaryResults['Durum']).toBe('Başabaş');
  });

  it('TEST 4: Maliyet 100, Hedef Marj %20', () => {
    const res = calculateKarMarji({ mod: 'hedef-marj', maliyet: 100, hedefMarj: 20 });
    expect(res.primaryResult).toBe(125);
    expect(res.secondaryResults['Kâr Tutarı']).toBe(25);
  });

  it('TEST 5: Maliyet 100, Kar Orani %20', () => {
    const res = calculateKarMarji({ mod: 'kar-orani', maliyet: 100, karOrani: 20 });
    expect(res.primaryResult).toBe(120);
    expect(res.secondaryResults['Kâr Tutarı']).toBe(20);
    // 20/120 = 16.666666 => 16.6667
    expect(res.secondaryResults['Gerçek Kâr Marjı']).toBe('%16.6667');
  });

  it('TEST 6: Maliyet 1000, Hedef Marj %25', () => {
    const res = calculateKarMarji({ mod: 'hedef-marj', maliyet: 1000, hedefMarj: 25 });
    expect(res.primaryResult).toBeCloseTo(1333.33, 2);
    expect(res.secondaryResults['Kâr Tutarı']).toBeCloseTo(333.33, 2);
  });

  it('TEST 7: Maliyet 1234.56, Satis 1500 (Decimal)', () => {
    const res = calculateKarMarji({ mod: 'kar-zarar', maliyet: 1234.56, satisFiyati: 1500 });
    expect(res.primaryResult).toBeCloseTo(265.44, 2);
    expect(res.secondaryResults['Durum']).toBe('Kâr');
  });

  it('TEST 8: Maliyet 1000000, Satis 1250000 (Large Number)', () => {
    const res = calculateKarMarji({ mod: 'kar-zarar', maliyet: 1000000, satisFiyati: 1250000 });
    expect(res.primaryResult).toBe(250000);
    expect(res.secondaryResults['Kâr Oranı']).toBe('%25');
    expect(res.secondaryResults['Kâr Marjı']).toBe('%20');
  });
});
