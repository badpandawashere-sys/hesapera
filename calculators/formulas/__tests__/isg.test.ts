import { describe, expect, it } from 'vitest';
import { calculateIsg } from '../isg';
import { isgCalculatorDef } from '../../definitions/isg';

describe('ISG Puan Hesaplama Formula', () => {
  it('1. C 35/0 -> 70 PASS', () => {
    const res = calculateIsg('cClass', 35, 0);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(70);
      expect(res.secondaryResults?.['Başarı Durumu']).toBe('Başarılı');
    }
  });

  it('2. A 34/0 -> 68 FAIL', () => {
    const res = calculateIsg('aClass', 34, 0);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(68);
      expect(res.secondaryResults?.['Başarı Durumu']).toBe('Başarısız');
    }
  });

  it('3. Hekim 50/0 -> 100 PASS', () => {
    const res = calculateIsg('workplacePhysician', 50, 0);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(100);
      expect(res.secondaryResults?.['Başarı Durumu']).toBe('Başarılı');
    }
  });

  it('4. DSP 30/0 -> 60 PASS', () => {
    const res = calculateIsg('otherHealthPersonnel', 30, 0);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(60);
      expect(res.secondaryResults?.['Başarı Durumu']).toBe('Başarılı');
    }
  });

  it('5. DSP 29/0 -> 58 FAIL', () => {
    const res = calculateIsg('otherHealthPersonnel', 29, 0);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(58);
      expect(res.secondaryResults?.['Başarı Durumu']).toBe('Başarısız');
    }
  });

  it('6. B 35/1 -> 71.428571... PASS', () => {
    const res = calculateIsg('bClass', 35, 1);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      const val = parseFloat(res.primaryResult.replace(',', '.'));
      expect(val).toBeGreaterThan(71.42);
      expect(val).toBeLessThan(71.43);
      expect(res.secondaryResults?.['Başarı Durumu']).toBe('Başarılı');
    }
  });

  it('7. C 34/1 -> 69.387755... FAIL', () => {
    const res = calculateIsg('cClass', 34, 1);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      const val = parseFloat(res.primaryResult.replace(',', '.'));
      expect(val).toBeGreaterThan(69.38);
      expect(val).toBeLessThan(69.39);
      expect(res.secondaryResults?.['Başarı Durumu']).toBe('Başarısız');
    }
  });

  it('8. DSP 30/1 -> 61.224489... PASS', () => {
    const res = calculateIsg('otherHealthPersonnel', 30, 1);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      const val = parseFloat(res.primaryResult.replace(',', '.'));
      expect(val).toBeGreaterThan(61.22);
      expect(val).toBeLessThan(61.23);
      expect(res.secondaryResults?.['Başarı Durumu']).toBe('Başarılı');
    }
  });

  it('9. DSP 29/1 -> 59.183673... FAIL', () => {
    const res = calculateIsg('otherHealthPersonnel', 29, 1);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      const val = parseFloat(res.primaryResult.replace(',', '.'));
      expect(val).toBeGreaterThan(59.18);
      expect(val).toBeLessThan(59.19);
      expect(res.secondaryResults?.['Başarı Durumu']).toBe('Başarısız');
    }
  });

  it('10. A 49/1 -> 100 PASS', () => {
    const res = calculateIsg('aClass', 49, 1);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(100);
      expect(res.secondaryResults?.['Başarı Durumu']).toBe('Başarılı');
    }
  });

  it('11. 50 correct / 1 cancelled -> INVALID', () => {
    const res = calculateIsg('cClass', 50, 1);
    expect(res.success).toBe(false);
  });

  it('12. blank cancelled -> 0', () => {
    const res = calculateIsg('cClass', 35);
    expect(res.success).toBe(true);
    if (res.success && res.primaryResult) {
      expect(parseFloat(res.primaryResult.replace(',', '.'))).toBe(70);
    }
  });

  // Validations
  it('13. correct negative INVALID', () => {
    const res = calculateIsg('cClass', -1, 0);
    expect(res.success).toBe(false);
  });

  it('14. correct >50 INVALID', () => {
    const res = calculateIsg('cClass', 51, 0);
    expect(res.success).toBe(false);
  });

  it('15. correct decimal INVALID', () => {
    const res = calculateIsg('cClass', 35.5, 0);
    expect(res.success).toBe(false);
  });

  it('16. cancelled negative INVALID', () => {
    const res = calculateIsg('cClass', 35, -1);
    expect(res.success).toBe(false);
  });

  it('17. cancelled >=50 INVALID', () => {
    const res = calculateIsg('cClass', 35, 50);
    expect(res.success).toBe(false);
  });

  it('18. cancelled decimal INVALID', () => {
    const res = calculateIsg('cClass', 35, 1.5);
    expect(res.success).toBe(false);
  });

  it('19. NaN INVALID', () => {
    const res = calculateIsg('cClass', NaN, 0);
    expect(res.success).toBe(false);
  });

  it('20. Infinity INVALID', () => {
    const res = calculateIsg('cClass', Infinity, 0);
    expect(res.success).toBe(false);
  });

  it('21. certificate invalid/missing INVALID', () => {
    const res = calculateIsg('fakeClass' as any, 35, 0);
    expect(res.success).toBe(false);
  });

  // Structural checks via def or formula string
  it('23. wrong-answer field does not exist', () => {
    const wrongField = isgCalculatorDef.fields.find(f => f.id === 'wrong');
    expect(wrongField).toBeUndefined();
  });

  it('24. wrong/4 calculation does not exist', () => {
    const fnString = calculateIsg.toString();
    expect(fnString).not.toContain('wrong / 4');
    expect(fnString).not.toContain('calculateNet');
  });

  it('25. FAQ >=12', () => {
    expect((isgCalculatorDef.metadata.faq || []).length).toBeGreaterThanOrEqual(12);
  });

  it('26. canonical exact', () => {
    expect(isgCalculatorDef.metadata.canonical).toBe('https://www.hesapera.com.tr/hesaplama/isg-puan');
  });

  it('27. status draft', () => {
    expect(isgCalculatorDef.status).toBe('published');
  });
});
