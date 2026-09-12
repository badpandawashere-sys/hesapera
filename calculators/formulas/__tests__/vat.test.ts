import { calculateVat } from '../vat';
import { describe, it, expect } from 'vitest';

describe('VAT Formula', () => {
  it('should calculate VAT correctly', () => {
    const result = calculateVat(1000, 20);
    expect(result.primaryResult).toBe(1200);
    expect(result.secondaryResults['KDV Tutarı']).toBe(200);
  });
});