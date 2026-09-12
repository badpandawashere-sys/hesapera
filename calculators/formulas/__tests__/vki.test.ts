import { describe, it, expect } from 'vitest';
import { calculateVki } from '../vki';

describe('VKI Calculator', () => {
  it('should calculate Normal VKI', () => {
    // 70 kg, 175 cm
    // 70 / (1.75*1.75) = 22.86
    const res = calculateVki({ kilo: 70, boy: 175 });
    expect(res.primaryResult).toBe('22.86');
    expect(res.secondaryResults['Sınıflandırma']).toBe('Normal');
  });

  it('should classify Obese correctly', () => {
    // 100 kg, 170 cm
    // 100 / (1.7*1.7) = 34.6
    const res = calculateVki({ kilo: 100, boy: 170 });
    expect(res.primaryResult).toBe('34.60');
    expect(res.secondaryResults['Sınıflandırma']).toBe('Obez');
  });

  it('should handle boundary validation', () => {
    expect(() => calculateVki({ kilo: 10, boy: 170 })).toThrow();
    expect(() => calculateVki({ kilo: 70, boy: 300 })).toThrow();
  });
});
