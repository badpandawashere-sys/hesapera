import { calculateVolume } from '../volume';
import { describe, it, expect } from 'vitest';
import { volumeCalculatorDef } from '../../definitions/volume';

describe('ID29 Hacim Hesaplama Formülü', () => {

  it('TEST 1: Dikdörtgen prizma (2 x 3 x 4)', () => {
    const res = calculateVolume({ sekil: 'Dikdörtgenler Prizması', birim: 'm', kenarA: 2, kenarB: 3, kenarC: 4 });
    expect(res.primaryResult).toContain('24');
    expect(res.secondaryResults['Uzunluk (a)']).toBe('2 m');
  });

  it('TEST 2: Küp (3)', () => {
    const res = calculateVolume({ sekil: 'Küp', birim: 'm', kenarA: 3 });
    expect(res.primaryResult).toContain('27');
  });

  it('TEST 3: Silindir (r=2, h=5)', () => {
    const res = calculateVolume({ sekil: 'Silindir', birim: 'm', yaricap: 2, yukseklik: 5 });
    // pi * 4 * 5 = 62.831853
    expect(res.primaryResult).toContain('62,831853');
  });

  it('TEST 4: Küre (r=3)', () => {
    const res = calculateVolume({ sekil: 'Küre', birim: 'm', yaricap: 3 });
    // 4/3 * pi * 27 = 36 * pi = 113.097336
    expect(res.primaryResult).toContain('113,097336');
  });

  it('TEST 5: Koni (r=3, h=4)', () => {
    const res = calculateVolume({ sekil: 'Koni', birim: 'm', yaricap: 3, yukseklik: 4 });
    // 1/3 * pi * 9 * 4 = 12 * pi = 37.699112
    expect(res.primaryResult).toContain('37,699112');
  });

  it('TEST 6: ondalıklı değerler', () => {
    const res = calculateVolume({ sekil: 'Küp', birim: 'cm', kenarA: 2.5 });
    expect(res.primaryResult).toContain('15,625');
  });

  it('TEST 7: 0 değer', () => {
    expect(() => calculateVolume({ sekil: 'Küp', birim: 'm', kenarA: 0 })).toThrow();
  });

  it('TEST 8: negatif', () => {
    expect(() => calculateVolume({ sekil: 'Küp', birim: 'm', kenarA: -5 })).toThrow();
  });

  it('TEST 9: NaN', () => {
    expect(() => calculateVolume({ sekil: 'Küp', birim: 'm', kenarA: NaN })).toThrow();
  });

  it('TEST 10: Infinity', () => {
    expect(() => calculateVolume({ sekil: 'Küp', birim: 'm', kenarA: Infinity })).toThrow();
  });

  it('TEST 11: Zod Schema - geçersiz shape', () => {
    const schema = volumeCalculatorDef.schema;
    expect(schema.safeParse({ sekil: 'Bilinmeyen', birim: 'm', kenarA: 5 }).success).toBe(false);
  });

  it('TEST 12: Zod Schema - shape\'e göre eksik field', () => {
    const schema = volumeCalculatorDef.schema;
    // Küp için kenarA lazım
    expect(schema.safeParse({ sekil: 'Küp', birim: 'm' }).success).toBe(false);
    // Prizma için kenarB, kenarC de lazım
    expect(schema.safeParse({ sekil: 'Dikdörtgenler Prizması', birim: 'm', kenarA: 2 }).success).toBe(false);
    // Koni için yaricap, yukseklik
    expect(schema.safeParse({ sekil: 'Koni', birim: 'm', yaricap: 2 }).success).toBe(false);
    
    // Doğru olanlar
    expect(schema.safeParse({ sekil: 'Küp', birim: 'm', kenarA: 5 }).success).toBe(true);
    expect(schema.safeParse({ sekil: 'Koni', birim: 'm', yaricap: 3, yukseklik: 4 }).success).toBe(true);
  });
});
