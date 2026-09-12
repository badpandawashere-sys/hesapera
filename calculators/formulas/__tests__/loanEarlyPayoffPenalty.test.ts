import { calculateLoanEarlyPayoffPenalty } from '../loanEarlyPayoffPenalty';
import { describe, it, expect } from 'vitest';

describe('Loan Early Payoff Penalty', () => {
  it('should calculate penalty correctly', () => {
    const res = calculateLoanEarlyPayoffPenalty(100000, 2);
    expect(res.primaryResult.includes('2.000')).toBe(true);
  });
});