import { calculateCreditCardCashAdvance } from '../creditCardCashAdvance';
import { describe, it, expect } from 'vitest';

describe('Credit Card Cash Advance', () => {
  it('should calculate cash advance correctly with fee', () => {
    const res = calculateCreditCardCashAdvance(10000, 2, 12, 1);
    // fee = 100, principal = 10100
    expect(res.secondaryResults['İşlem Ücreti'].includes('100')).toBe(true);
    expect(res.primaryResult).toBeDefined();
  });
});