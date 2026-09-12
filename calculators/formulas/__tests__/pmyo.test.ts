import { calculatePmyo } from '../pmyo';
import { describe, it, expect } from 'vitest';

describe('PMYO Calculator', () => {
  it('should calculate successful score correctly', () => {
    // TYT: 300 (*0.25 = 75)
    // Fiziki: 80 (*0.25 = 20)
    // Mulakat: 90 (*0.50 = 45)
    // Total: 75 + 20 + 45 = 140
    const res = calculatePmyo(300, 80, 90);
    expect(res.nihaiScore).toBe(140);
    expect(res.isBasarili).toBe(true);
  });

  it('should fail if fiziki is below 60', () => {
    const res = calculatePmyo(300, 59, 90);
    expect(res.isBasarili).toBe(false);
    expect(res.statusMessage).toContain('Fiziki');
  });

  it('should fail if mulakat is below 70', () => {
    const res = calculatePmyo(300, 80, 69);
    expect(res.isBasarili).toBe(false);
    expect(res.statusMessage).toContain('Mulakat');
  });

  it('should throw on limits', () => {
    expect(() => calculatePmyo(99, 80, 90)).toThrow(); // TYT below 100
    expect(() => calculatePmyo(501, 80, 90)).toThrow();
    expect(() => calculatePmyo(300, -1, 90)).toThrow();
    expect(() => calculatePmyo(300, 80, 101)).toThrow();
  });
});
