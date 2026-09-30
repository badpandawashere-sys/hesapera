import { describe, expect, it } from 'vitest';
import { calculateHmgs } from '../hmgs';
import { hmgsCalculatorDef } from '../../definitions/hmgs';

describe('HMGS Calculator Formula', () => {
  it('Golden 1: HP=110, X=72, S=14, B=110 -> 100', () => {
    const res = calculateHmgs('current', 110, 72, 14, 110);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(100);
    }
  });

  it('Golden 2: HP=74, X=72, S=14, B=110 -> 70', () => {
    const res = calculateHmgs('current', 74, 72, 14, 110);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(70);
    }
  });

  it('Golden 3: HP=84, X=72, S=14, B=110 -> 78.333333', () => {
    const res = calculateHmgs('current', 84, 72, 14, 110);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      const score = parseFloat(res.primaryResult.replace(',', '.'));
      expect(score).toBeGreaterThan(78.33);
      expect(score).toBeLessThan(78.34);
    }
  });

  it('Yalnız HP84 -> Ham Puan 84, HMGS final puanı YOK', () => {
    const res = calculateHmgs('current', 84);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(res.primaryResult).toBe('84');
      expect(res.primaryLabel).toBe('HMGS Ham Puanı');
      expect(res.secondaryResults?.['Ham Puan']).toBe('84');
      expect(res.secondaryResults?.['Başarı Durumu']).toBeUndefined();
    }
  });

  it('partial X/S/B -> invalid', () => {
    const res = calculateHmgs('current', 84, 72, 14);
    expect(res.success).toBe(false);
  });

  it('HP121 -> invalid', () => {
    const res = calculateHmgs('current', 121);
    expect(res.success).toBe(false);
  });

  it('decimal HP -> invalid', () => {
    const res = calculateHmgs('current', 84.5);
    expect(res.success).toBe(false);
  });

  it('negative HP -> invalid', () => {
    const res = calculateHmgs('current', -5);
    expect(res.success).toBe(false);
  });

  it('NaN -> invalid', () => {
    const res = calculateHmgs('current', NaN);
    expect(res.success).toBe(false);
  });

  it('Infinity -> invalid', () => {
    const res = calculateHmgs('current', Infinity);
    expect(res.success).toBe(false);
  });

  it('B < HP -> invalid', () => {
    const res = calculateHmgs('current', 84, 72, 14, 80);
    expect(res.success).toBe(false);
  });

  it('B <= X -> invalid', () => {
    const res = calculateHmgs('current', 84, 72, 14, 72);
    expect(res.success).toBe(false);
  });

  it('denominator <= 0 -> invalid', () => {
    const res = calculateHmgs('current', 84, 72, 140, 90);
    expect(res.success).toBe(false);
  });

  // Legacy
  it('120/0 -> 100', () => {
    const res = calculateHmgs('legacy', 120, undefined, undefined, undefined, 0);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(100);
    }
  });

  it('84/0 -> 70', () => {
    const res = calculateHmgs('legacy', 84, undefined, undefined, undefined, 0);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(70);
    }
  });

  it('83/0 -> 69.166666', () => {
    const res = calculateHmgs('legacy', 83, undefined, undefined, undefined, 0);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      const score = parseFloat(res.primaryResult.replace(',', '.'));
      expect(score).toBeGreaterThan(69.16);
      expect(score).toBeLessThan(69.17);
    }
  });

  it('60/0 -> 50', () => {
    const res = calculateHmgs('legacy', 60, undefined, undefined, undefined, 0);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(50);
    }
  });

  it('119/1 -> 100', () => {
    const res = calculateHmgs('legacy', 119, undefined, undefined, undefined, 1);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(100);
    }
  });

  it('84/1 -> 70.588235', () => {
    const res = calculateHmgs('legacy', 84, undefined, undefined, undefined, 1);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      const score = parseFloat(res.primaryResult.replace(',', '.'));
      expect(score).toBeGreaterThan(70.58);
      expect(score).toBeLessThan(70.59);
    }
  });

  it('120/1 -> invalid', () => {
    const res = calculateHmgs('legacy', 120, undefined, undefined, undefined, 1);
    expect(res.success).toBe(false);
  });

  it('cancelled blank -> 0', () => {
    const res = calculateHmgs('legacy', 84);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(70);
    }
  });

  // Pre-release Regression Tests
  it('B. Current-mode false claim regression: should not have false claims', () => {
    const res = calculateHmgs('current', 84);
    expect(res.success).toBe(true);
    if (res.success && res.notes) {
      const allNotes = res.notes.join(' ');
      expect(allNotes).not.toContain('84 doğru kesin 70');
      expect(allNotes).not.toContain('84 doğru = 70');
    }
  });

  it('C. Wrong-answer penalty regression: should not use wrong/4', () => {
    const fnString = calculateHmgs.toString();
    expect(fnString).not.toContain('wrong / 4');
    expect(fnString).not.toContain('calculateNet');
  });

  it('D. GERÇEK denominator <= 0 testi', () => {
    // HP=84, X=80, S=80, B=90
    const res = calculateHmgs('current', 84, 80, 80, 90);
    expect(res.success).toBe(false);
  });
});

describe('HMGS Calculator Definition', () => {
  it('A. Default system should be current', () => {
    const systemField = hmgsCalculatorDef.fields.find(f => f.id === 'system');
    expect(systemField?.defaultValue).toBe('current');
  });

  it('E. FAQ regression: faq.length >= 10', () => {
    expect((hmgsCalculatorDef.metadata.faq || []).length).toBeGreaterThanOrEqual(10);
  });

  it('F. Content date regression: dates are correct', () => {
    const content = JSON.stringify(hmgsCalculatorDef.metadata.content);
    expect(content).toContain('27 Eylül 2026');
    expect(content).toContain('22 Ekim 2026');
    expect(content).not.toContain('27 Eylül 2026 tarihinde uygulanacak');
  });
});
