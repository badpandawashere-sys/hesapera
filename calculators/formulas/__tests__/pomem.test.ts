import { calculatePomem } from '../pomem';
import { describe, it, expect } from 'vitest';

describe('POMEM Calculator', () => {
  it('should calculate successful score correctly', () => {
    // KPSS: 80 (*0.25 = 20)
    // Fiziki: 80 (*0.25 = 20)
    // Mulakat: 90 (*0.50 = 45)
    // Total: 20 + 20 + 45 = 85
    const res = calculatePomem(80, 80, 90);
    expect(res.nihaiScore).toBe(85);
    expect(res.isBasarili).toBe(true);
  });

  it('should fail if fiziki is below 60', () => {
    const res = calculatePomem(80, 59, 90);
    expect(res.isBasarili).toBe(false);
    expect(res.statusMessage).toContain('Fiziki');
  });

  it('should fail if mulakat is below 70', () => {
    const res = calculatePomem(80, 80, 69);
    expect(res.isBasarili).toBe(false);
    expect(res.statusMessage).toContain('Mulakat');
  });

  it('should throw on limits', () => {
    expect(() => calculatePomem(-1, 80, 90)).toThrow();
    expect(() => calculatePomem(101, 80, 90)).toThrow();
    expect(() => calculatePomem(80, -1, 90)).toThrow();
    expect(() => calculatePomem(80, 80, 101)).toThrow();
  });
});
