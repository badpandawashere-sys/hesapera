import { calculateKpss } from '../kpss';
import { describe, it, expect } from 'vitest';

describe('KPSS Calculator', () => {
  it('GOLDEN 1 & 2: P3 and P1 golden net 51.25, P1 weights 70/30, P3 weights 50/50', () => {
    // 30D/10Y -> 27.5 Net, 25D/5Y -> 23.75 Net. Total: 51.25 Net.
    const p3 = calculateKpss('lisans', 'KPSSP3', 30, 10, 25, 5);
    expect(p3.primaryResult).toBe('51.25');
    expect(p3.secondaryResults['Puan Türü']).toBe('KPSSP3');
    expect(p3.secondaryResults['GY Ağırlığı']).toBe('%50');
    expect(p3.secondaryResults['GK Ağırlığı']).toBe('%50');
    expect(p3.secondaryResults['Genel Yetenek Neti']).toBe('27.50');
    expect(p3.secondaryResults['Genel Kültür Neti']).toBe('23.75');
    expect(p3.isEligible).toBe(true);

    const p1 = calculateKpss('lisans', 'KPSSP1', 30, 10, 25, 5);
    expect(p1.primaryResult).toBe('51.25');
    expect(p1.secondaryResults['Puan Türü']).toBe('KPSSP1');
    expect(p1.secondaryResults['GY Ağırlığı']).toBe('%70');
    expect(p1.secondaryResults['GK Ağırlığı']).toBe('%30');
    expect(p1.isEligible).toBe(true);
  });

  it('GOLDEN 3: 60/0 + 60/0 total net 120 (no fake 100 score)', () => {
    const res = calculateKpss('lisans', 'KPSSP3', 60, 0, 60, 0);
    expect(res.primaryResult).toBe('120.00'); // total net
  });

  it('GOLDEN 4 & 5: Onlisans uses P93 and Ortaogretim uses P94, max 60 valid', () => {
    const onlisans = calculateKpss('onlisans', 'KPSSP3', 60, 0, 60, 0); // User tries to request P3
    expect(onlisans.primaryResult).toBe('120.00');
    expect(onlisans.secondaryResults['Puan Türü']).toBe('KPSSP93'); // backend overrides
    expect(onlisans.secondaryResults['GY Ağırlığı']).toBe('%50');

    const orta = calculateKpss('ortaogretim', 'KPSSP1', 30, 10, 25, 5);
    expect(orta.secondaryResults['Puan Türü']).toBe('KPSSP94');
    expect(orta.primaryResult).toBe('51.25');
  });

  it('GOLDEN 6 & 13: 0/60 net -15, no negative clamp', () => {
    // 0D 60Y -> 0 - 60/4 = -15
    const res = calculateKpss('lisans', 'KPSSP3', 0, 60, 0, 60);
    expect(res.secondaryResults['Genel Yetenek Neti']).toBe('-15.00');
    expect(res.primaryResult).toBe('-30.00');
  });

  it('GOLDEN 7 & 14: each test <1 eligibility false', () => {
    // GY: 1D 0Y (1 net)
    // GK: 4D 12Y (4 - 3 = 1 net)
    const res = calculateKpss('lisans', 'KPSSP3', 1, 0, 4, 12);
    expect(res.isEligible).toBe(true);

    // GY: 4D 16Y (4 - 4 = 0 net) -> not eligible
    const res2 = calculateKpss('lisans', 'KPSSP3', 4, 16, 20, 0);
    expect(res2.isEligible).toBe(false);
    expect(res2.notes.some(n => n.includes('en az 1 ham puanı'))).toBe(true);
    expect(res2.secondaryResults['Uygunluk']).toContain('Geçersiz');
  });

  it('15: correct+wrong >60 invalid', () => {
    expect(() => calculateKpss('lisans', 'KPSSP3', 41, 20, 0, 0)).toThrow(); // 61
    expect(() => calculateKpss('onlisans', 'KPSSP93', 0, 0, 50, 20)).toThrow();
  });

  it('GOLDEN 16: content does not contain 70 ile 100 arasi', async () => {
    const { kpssCalculatorDef } = await import('../../definitions/kpss');
    const content = JSON.stringify(kpssCalculatorDef.metadata.content);
    expect(content.includes('70 ile 100 arası')).toBe(false);
    expect(content.includes('Nihai KPSS puanı, ASP dağılımının ortalama, standart sapma ve en yüksek değerleri')).toBe(true);
  });
});
