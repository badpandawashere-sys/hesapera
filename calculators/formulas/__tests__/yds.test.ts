import { calculateYds } from '../yds';
import { describe, it, expect } from 'vitest';

describe('YDS Calculator', () => {
  it('should calculate 100 correctly', () => {
    const res = calculateYds(80, 0);
    expect(res.primaryResult).toBe('100.00');
    expect(res.secondaryResults['Yabancı Dil Seviyesi']).toBe('A Seviyesi');
  });

  it('should calculate 90 correctly', () => {
    const res = calculateYds(72, 8); // 72 * 1.25 = 90
    expect(res.primaryResult).toBe('90.00');
    expect(res.secondaryResults['Yabancı Dil Seviyesi']).toBe('A Seviyesi');
  });

  it('should calculate border 50 correctly', () => {
    const res = calculateYds(40, 40); // 40 * 1.25 = 50
    expect(res.primaryResult).toBe('50.00');
    expect(res.secondaryResults['Yabancı Dil Seviyesi']).toBe('E Seviyesi');
  });

  it('should calculate below 50 correctly', () => {
    const res = calculateYds(30, 50); // 30 * 1.25 = 37.5
    expect(res.primaryResult).toBe('37.50');
    expect(res.secondaryResults['Yabancı Dil Seviyesi']).toContain('Seviyesiz');
  });

  it('should calculate 0 correctly', () => {
    const res = calculateYds(0, 80);
    expect(res.primaryResult).toBe('0.00');
  });

  it('wrong answers should not affect correct answers', () => {
    const res1 = calculateYds(60, 0);  // 60*1.25 = 75
    const res2 = calculateYds(60, 20); // 60*1.25 = 75
    expect(res1.primaryResult).toBe(res2.primaryResult);
  });

  it('should throw on limits', () => {
    expect(() => calculateYds(81, 0)).toThrow();
    expect(() => calculateYds(40, 41)).toThrow();
    expect(() => calculateYds(-1, 0)).toThrow();
    expect(() => calculateYds(0, -1)).toThrow();
  });
});
