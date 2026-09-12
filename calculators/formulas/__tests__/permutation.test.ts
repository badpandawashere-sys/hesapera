import { calculatePermutation } from '../permutation';
import { describe, it, expect } from 'vitest';

describe('Permutation Formula', () => {
  it('should calculate correctly', () => {
    expect(calculatePermutation(5, 2).primaryResult).toBe(20);
  });
});