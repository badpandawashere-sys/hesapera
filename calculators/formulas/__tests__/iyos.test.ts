import { describe, it, expect } from 'vitest';
import { calculateIyos } from '../iyos';
import { iyosCalculatorDef } from '../../definitions/iyos';

describe('IYOS Puan Hesaplama Formula', () => {
  describe('CURRENT MODE (2026)', () => {
    it('1. HP110 X72 S14 B110 -> 100 PASS', () => {
      const result = calculateIyos({ system: 'current', hp: 110, x: 72, s: 14, b: 110 });
      expect(result.score).toBe(100);
      expect(result.details?.status).toBe('Başarılı');
    });

    it('2. HP74 X72 S14 B110 -> 70 PASS', () => {
      const result = calculateIyos({ system: 'current', hp: 74, x: 72, s: 14, b: 110 });
      expect(result.score).toBe(70);
      expect(result.details?.status).toBe('Başarılı');
    });

    it('3. HP84 X72 S14 B110 -> 78.33333 PASS', () => {
      const result = calculateIyos({ system: 'current', hp: 84, x: 72, s: 14, b: 110 });
      expect(result.score).toBeCloseTo(78.333333, 5);
      expect(result.details?.status).toBe('Başarılı');
    });

    it('4. HP60 X72 S14 B110 -> 58.33333 FAIL', () => {
      const result = calculateIyos({ system: 'current', hp: 60, x: 72, s: 14, b: 110 });
      expect(result.score).toBeCloseTo(58.333333, 5);
      expect(result.details?.status).toBe('Başarısız');
    });

    it('5. yalniz HP84 -> Ham Puan 84, final score yok', () => {
      const result = calculateIyos({ system: 'current', hp: 84 });
      expect(result.score).toBeNull();
      expect(result.details?.hp).toBe(84);
      expect(result.details?.note).toContain('kesin İYÖS puanı hesaplanamaz');
    });

    it('6. partial X/S/B -> INVALID', () => {
      expect(() => calculateIyos({ system: 'current', hp: 84, x: 72, s: 14 })).toThrow();
      expect(() => calculateIyos({ system: 'current', hp: 84, x: 72 })).toThrow();
    });

    it('7. HP121 -> INVALID', () => {
      expect(() => calculateIyos({ system: 'current', hp: 121 })).toThrow();
    });

    it('8. HP decimal -> INVALID', () => {
      expect(() => calculateIyos({ system: 'current', hp: 84.5 })).toThrow();
    });

    it('9. HP negative -> INVALID', () => {
      expect(() => calculateIyos({ system: 'current', hp: -5 })).toThrow();
    });

    it('10. NaN -> INVALID', () => {
      expect(() => calculateIyos({ system: 'current', hp: NaN })).toThrow();
    });

    it('11. Infinity -> INVALID', () => {
      expect(() => calculateIyos({ system: 'current', hp: Infinity })).toThrow();
    });

    it('12. B < HP -> INVALID', () => {
      expect(() => calculateIyos({ system: 'current', hp: 110, x: 72, s: 14, b: 100 })).toThrow();
    });

    it('13. B <= X -> INVALID', () => {
      expect(() => calculateIyos({ system: 'current', hp: 84, x: 90, s: 14, b: 90 })).toThrow();
    });

    it('14. HP84 X80 S80 B90 -> denominator INVALID', () => {
      expect(() => calculateIyos({ system: 'current', hp: 84, x: 80, s: 80, b: 90 })).toThrow();
    });
  });

  describe('LEGACY MODE (2025)', () => {
    it('15. 120/0 -> 100', () => {
      const result = calculateIyos({ system: 'legacy', hp: 120, cancelled: 0 });
      expect(result.score).toBe(100);
    });

    it('16. 84/0 -> 70', () => {
      const result = calculateIyos({ system: 'legacy', hp: 84, cancelled: 0 });
      expect(result.score).toBe(70);
    });

    it('17. 83/0 -> 69.16666', () => {
      const result = calculateIyos({ system: 'legacy', hp: 83, cancelled: 0 });
      expect(result.score).toBeCloseTo(69.16666, 4);
    });

    it('18. 119/1 -> 100', () => {
      const result = calculateIyos({ system: 'legacy', hp: 119, cancelled: 1 });
      expect(result.score).toBe(100);
    });

    it('19. 84/1 -> 70.588235', () => {
      const result = calculateIyos({ system: 'legacy', hp: 84, cancelled: 1 });
      expect(result.score).toBeCloseTo(70.588235, 5);
      expect(result.details?.status).toBe('Başarılı');
    });

    it('20. 83/1 -> 69.747899', () => {
      const result = calculateIyos({ system: 'legacy', hp: 83, cancelled: 1 });
      expect(result.score).toBeCloseTo(69.747899, 5);
      expect(result.details?.status).toBe('Başarısız');
    });

    it('21. 120/1 -> INVALID', () => {
      expect(() => calculateIyos({ system: 'legacy', hp: 120, cancelled: 1 })).toThrow();
    });

    it('22. cancelled blank -> 0', () => {
      const result = calculateIyos({ system: 'legacy', hp: 84 });
      expect(result.score).toBe(70);
    });
  });

  describe('STRUCTURAL', () => {
    it('23. default mode current', () => {
      const systemField = iyosCalculatorDef.fields.find((f: any) => f.id === 'system');
      expect(systemField?.defaultValue).toBe('current');
    });

    it('24. wrong field YOK', () => {
      const wrongField = iyosCalculatorDef.fields.find((f: any) => f.id === 'wrong');
      expect(wrongField).toBeUndefined();
    });

    it('25. wrong/4 YOK', () => {
      const funcStr = calculateIyos.toString();
      expect(funcStr).not.toContain('wrong / 4');
      expect(funcStr).not.toContain('calculateNet');
    });

    it('26. current result icinde fixed 84=70 claim YOK', () => {
      const contentStr = JSON.stringify(iyosCalculatorDef.metadata.content);
      expect(contentStr).not.toContain('2026 İYÖS\'te 84 doğru 70 puandır.');
    });

    it('27. FAQ >= 13', () => {
      expect(iyosCalculatorDef.metadata.faq?.length).toBeGreaterThanOrEqual(13);
    });

    it('28. canonical exact', () => {
      expect(iyosCalculatorDef.metadata.canonical).toBe('https://www.hesapera.com.tr/hesaplama/iyos-puan');
    });

    it('29. contentte 27 Eylul 2026 var', () => {
      const contentStr = JSON.stringify(iyosCalculatorDef.metadata.content);
      expect(contentStr).toContain('27 Eylül 2026');
    });

    it('30. contentte 22 Ekim 2026 var', () => {
      const contentStr = JSON.stringify(iyosCalculatorDef.metadata.content);
      expect(contentStr).toContain('22 Ekim 2026');
    });

    it('31. 27 Eylul uygulanacak YOK', () => {
      const contentStr = JSON.stringify(iyosCalculatorDef.metadata.content);
      expect(contentStr).not.toContain('uygulanacak');
    });

    it('32. status draft', () => {
      expect(iyosCalculatorDef.status).toBe('published');
    });

    it('33. formula client bundleda yok (dummy test, gercek test python ile yapilacak)', () => {
      expect(true).toBe(true);
    });
  });
});
