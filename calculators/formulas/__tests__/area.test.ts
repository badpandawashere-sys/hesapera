import { calculateArea } from '../area';
import { describe, it, expect } from 'vitest';

describe('Area Formula', () => {
  it('should calculate area correctly', () => {
    const result = calculateArea(10, 20);
    expect(result.primaryResult).toBe('200 m²');
  });
});