import { calculateLoss } from '../loss';
import { describe, it, expect } from 'vitest';

describe('Loss Formula', () => {
  it('should calculate loss correctly', () => {
    const result = calculateLoss(120, 100);
    expect(result.primaryResult).toBe(20);
  });
});