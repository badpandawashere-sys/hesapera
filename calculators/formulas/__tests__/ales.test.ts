import { calculateAles } from '../ales';
import { describe, it, expect } from 'vitest';

describe('ALES Calculator', () => {
  it('should calculate standard ALES score', () => {
    // 50 SAY (50 net), 0 SOZ
    const res = calculateAles(50, 0, 0, 0);
    // EA = 50 + 25 = 75
    // SAY = 50 + 37.5 = 87.5
    expect(res.secondaryResults['ALES SAY (Sayısal)']).toBe('87.500');
    expect(res.secondaryResults['ALES EA (Eşit Ağırlık)']).toBe('75.000');
  });
});