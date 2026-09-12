import { calculateRepo } from '../repo';
import { describe, it, expect } from 'vitest';

describe('Repo Calculator', () => {
  it('should calculate net return correctly', () => {
    // 100000, 20%, 30 days, 15% tax
    // Gross = 100000 * 0.20 * (30/365) = 1643.835
    // Tax = 1643.835 * 0.15 = 246.575
    // Net = 1397.26
    const res = calculateRepo(100000, 20, 30, 15);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(numValue).toBeCloseTo(1397.26, 1);
  });
});