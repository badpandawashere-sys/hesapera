import { describe, it, expect } from 'vitest';
import { calculateAltinOran } from '../altinOran';

describe('Altin Oran Calculator', () => {
  it('should calculate perfect golden ratio', () => {
    // Phi = 1.6180339887...
    const kisa = 10;
    const uzun = 16.180339887;
    const res = calculateAltinOran({ kisaKenar: kisa, uzunKenar: uzun });
    expect(res.secondaryResults['Uyumluluk']).toBe('Altın orana kusursuz uyum (Mükemmel)');
    expect(res.primaryResult).toBe('1.6180');
  });

  it('should handle standard non-perfect ratio', () => {
    const kisa = 10;
    const uzun = 15;
    const res = calculateAltinOran({ kisaKenar: kisa, uzunKenar: uzun });
    // Ratio = 1.5. Diff from 1.618 is 0.118, which is about 7.3% diff
    expect(res.secondaryResults['Uyumluluk']).toBe('Altın orana uzak (Kabul edilebilir)');
  });

  it('should throw on negative/zero values', () => {
    expect(() => calculateAltinOran({ kisaKenar: 0, uzunKenar: 10 })).toThrow();
  });

  it('should throw if kisa is larger than uzun', () => {
    expect(() => calculateAltinOran({ kisaKenar: 20, uzunKenar: 10 })).toThrow();
  });
});
