import { calculateIbanValidation } from '../ibanValidation';
import { describe, it, expect } from 'vitest';

describe('IBAN Validation Calculator', () => {
  it('should validate correct mock TR IBAN', () => {
    // Generate a mathematically valid IBAN TRxx ...
    // E.g. TR02 0000 0000 0000 0000 0000 00
    // Checksum calculation:
    // 0000000000000000000000 TR02 -> 0000000000000000000000292702 -> mod 97 = 292702 % 97 = 35. 
    // Wait, TR02 does not mean it's valid. TR11 0000 0000 0000 0000 0000 00
    // Actually, TR11 -> 292711. 292711 % 97 = 44. We need the remainder to be 1.
    // Let's find one programmatically. 2927XX % 97 == 1.
    // 292700 % 97 = 33. We want 33 + X % 97 = 1 -> X = 65.
    // TR47 0000 0000 0000 0000 0000 00 should be valid.
    const res = calculateIbanValidation('TR47 0000 0000 0000 0000 0000 00');
    expect(res.primaryResult).toBe('Geçerli IBAN');
  });

  it('should invalidate incorrect length', () => {
    const res = calculateIbanValidation('TR47 0000 0000');
    expect(res.primaryResult).toBe('Geçersiz IBAN');
  });
});