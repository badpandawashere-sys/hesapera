import { calculateMaxLoanAmount } from '../maxLoanAmount';
import { describe, it, expect } from 'vitest';

describe('Max Loan Amount Calculator', () => {
  it('should calculate theoretical maximum loan', () => {
    // capacity = 10000, 2%, 12 months -> 10000 * ((1.02^12 - 1) / (0.02 * 1.02^12)) ≈ 105753
    const res = calculateMaxLoanAmount(10000, 2, 12, 0);
    // Remove formatting characters logically for test
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(numValue).toBeCloseTo(105753.41, 0);
  });
  
  it('should handle zero interest', () => {
    const res = calculateMaxLoanAmount(10000, 0, 10, 0);
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(numValue).toBeCloseTo(100000, 0);
  });
  
  it('should handle existing debt correctly', () => {
    const res = calculateMaxLoanAmount(10000, 0, 10, 2000); // 8000 * 10 = 80000
    const numValue = parseFloat(res.primaryResult.replace(/[^0-9,]/g, '').replace(',', '.'));
    expect(numValue).toBeCloseTo(80000, 0);
  });
});