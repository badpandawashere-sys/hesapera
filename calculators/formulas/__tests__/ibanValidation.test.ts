import { describe, it, expect } from 'vitest';
import { calculateIbanValidation } from '../ibanValidation';

// Not: Test IBAN'ları sadece format/algoritma doğrulaması için kullanılmaktadır.
// Bu numaralar matematiksel olarak MOD-97 uyumludur ancak gerçek bir hesaba ait olup olmadığını temsil etmez.

describe('calculateIbanValidation', () => {
  const validTrIbanNoSpaces = 'TR470000000000000000000000';
  const validTrIbanSpaces = 'TR47 0000 0000 0000 0000 0000 00';
  const validTrIbanLower = 'tr47 0000 0000 0000 0000 0000 00';
  const validDeIban = 'DE89 3704 0044 0532 0130 00';
  
  it('1. Geçerli Türkiye IBAN doğrulaması', () => {
    const res = calculateIbanValidation(validTrIbanNoSpaces);
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('IBAN Geçerli');
  });

  it('2. Aynı IBAN boşluklu kabul edilmeli', () => {
    const res = calculateIbanValidation(validTrIbanSpaces);
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('IBAN Geçerli');
  });

  it('3. Aynı IBAN küçük harfli kabul edilmeli', () => {
    const res = calculateIbanValidation(validTrIbanLower);
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('IBAN Geçerli');
  });

  it('4. Geçersiz checksum (MOD-97 hatası)', () => {
    const res = calculateIbanValidation('TR99 0000 0000 0000 0000 0000 00');
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('Geçersiz IBAN');
    // @ts-ignore
    expect(res.secondaryResults['Hata Nedeni']).toContain('geçersiz');
  });

  it('5. Yanlış uzunluk (26 yerine kısa)', () => {
    const res = calculateIbanValidation('TR47 0000 0000');
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('Geçersiz IBAN');
    // @ts-ignore
    expect(res.secondaryResults['Hata Nedeni']).toContain('Uzunluk hatası');
  });

  it('6. Geçersiz özel karakterler reddedilmeli', () => {
    const res = calculateIbanValidation('TR47?0000*0000!');
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('Geçersiz IBAN');
    // @ts-ignore
    expect(res.secondaryResults['Hata Nedeni']).toContain('geçersiz karakter içeriyor');
  });

  it('7. Boş giriş hatası', () => {
    const res = calculateIbanValidation('');
    expect(res.success).toBe(false);
  });

  it('8. Sadece rakamlardan oluşan giriş', () => {
    const res = calculateIbanValidation('12345678901234567890123456');
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('Geçersiz IBAN');
    // @ts-ignore
    expect(res.secondaryResults['Hata Nedeni']).toContain('ülke kodu (harf) olmalıdır');
  });

  it('9. Desteklenmeyen ülke kodu', () => {
    const res = calculateIbanValidation('ZZ47 0000 0000 0000 0000 0000 00');
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('Geçersiz IBAN');
    // @ts-ignore
    expect(res.secondaryResults['Hata Nedeni']).toContain('desteklenmemektedir');
  });

  it('10. Başında/sonunda boşluk bulunan IBAN (trim çalışmalı)', () => {
    const res = calculateIbanValidation('   ' + validTrIbanSpaces + '   ');
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('IBAN Geçerli');
  });

  it('11. Çok uzun giriş reddedilmeli', () => {
    const res = calculateIbanValidation(validTrIbanNoSpaces + '00000');
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('Geçersiz IBAN');
    // @ts-ignore
    expect(res.secondaryResults['Hata Nedeni']).toContain('Uzunluk hatası');
  });

  it('12. Farklı bir ülkeye ait geçerli IBAN (Almanya - DE)', () => {
    const res = calculateIbanValidation(validDeIban);
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('IBAN Geçerli');
    // @ts-ignore
    expect(res.secondaryResults['Ülke']).toBe('DE');
  });

  it('13. Tire içeren IBAN reddedilmeli', () => {
    const res = calculateIbanValidation('TR47-0000-0000-0000-0000-0000-00');
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('Geçersiz IBAN');
    // @ts-ignore
    expect(res.secondaryResults['Hata Nedeni']).toContain('geçersiz karakter içeriyor');
  });

  it('14. Slash içeren IBAN reddedilmeli', () => {
    const res = calculateIbanValidation('TR47/0000/0000/0000/0000/0000/00');
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('Geçersiz IBAN');
    // @ts-ignore
    expect(res.secondaryResults['Hata Nedeni']).toContain('geçersiz karakter içeriyor');
  });
  
  it('15. Maskeleme işlevinin güvenli dönüş yapması (Kısa format vs)', () => {
    const res = calculateIbanValidation('ABC');
    expect(res.success).toBe(true);
    // @ts-ignore
    expect(res.primaryResult).toBe('Geçersiz IBAN');
    // length < 4 should fail earlier but fallback works nicely if directly tested
  });
});
