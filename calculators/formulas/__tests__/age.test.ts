import { calculateAge } from '../age';
import { describe, it, expect } from 'vitest';

describe('Age Formula', () => {
  it('should calculate correctly', () => {
    const res = calculateAge('1990-05-15', '2020-05-15');
    expect(res.primaryResult).toBe('30 Yaşında');
    expect(res.secondaryResults['Yıl']).toBe(30);
    expect(res.secondaryResults['Ay']).toBe(0);
    expect(res.secondaryResults['Gün']).toBe(0);
  });
  
  it('should calculate partial months correctly', () => {
    const res = calculateAge('1990-05-15', '2020-04-10');
    expect(res.primaryResult).toBe('29 Yaşında');
  });
});