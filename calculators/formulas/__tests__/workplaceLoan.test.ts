import { calculateWorkplaceLoan } from '../workplaceLoan';
import { describe, it, expect } from 'vitest';

describe('İş Yeri Kredisi Hesaplama', () => {
  it('should calculate and return generic result format', () => {
    const res = calculateWorkplaceLoan(100000, 2, 12);
    expect(res.table).toBeDefined();
    expect(res.table?.length).toBe(12);
  });
});