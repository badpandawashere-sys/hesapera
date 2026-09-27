import { calculateEus } from '../eus';
import { describe, it, expect } from 'vitest';

describe('EUS Calculator', () => {
  it('should calculate 75 correct exactly as reference', () => {
    const res = calculateEus('2017', '4', 75, 0);
    expect(res.primaryResult).toBe('92,99224');
    expect(res.secondaryResults['Net']).toBe('75,00 net');
  });

  it('should calculate 50 correct exactly as reference', () => {
    const res = calculateEus('2017', '4', 50, 0);
    expect(res.primaryResult).toBe('70,68873');
  });

  it('should calculate 50 correct 10 wrong exactly as reference', () => {
    const res = calculateEus('2017', '4', 50, 10);
    expect(res.primaryResult).toBe('68,45838');
    expect(res.secondaryResults['Net']).toBe('47,50 net');
  });

  it('should apply %2 deduction correctly for Durum 1', () => {
    const res = calculateEus('2017', '1', 50, 10);
    expect(res.primaryResult).toBe('67,08921'); // the 0.98 reduction test
    expect(res.notes[0]).toContain('%2 oranında düşürülmüştür');
  });

  it('should handle direct net input when wrong is undefined', () => {
    const res = calculateEus('2017', '4', 50, undefined);
    expect(res.primaryResult).toBe('70,68873');
    expect(res.secondaryResults['Net']).toBe('50,00 net');
  });

  it('should allow negative nets', () => {
    const res = calculateEus('2017', '4', 0, 75);
    expect(res.primaryResult).toBe('9,35409');
    expect(res.secondaryResults['Net']).toBe('-18,75 net');
  });
});
