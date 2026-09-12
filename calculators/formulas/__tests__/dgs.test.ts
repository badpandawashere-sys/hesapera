import { calculateDgs } from '../dgs';
import { describe, it, expect } from 'vitest';

describe('DGS Calculator', () => {
  it('should calculate DGS score correctly', () => {
    // SAY: 40 net, SOZ: 20 net, OBP: 60 (Katkı 36)
    // EA = 105 + (40 * 1.85) + (20 * 1.85) + 36 = 105 + 74 + 37 + 36 = 252
    const res = calculateDgs(40, 0, 20, 0, 60);
    expect(res.secondaryResults['DGS EA']).toBe('252.000');
    expect(res.secondaryResults['ÖBP Katkısı']).toBe('+36.0');
  });
});