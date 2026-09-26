import { calculateLoanEarlyPayoffPenalty } from '../loanEarlyPayoffPenalty';
import { loanEarlyPayoffPenaltyCalculatorDef } from '../../definitions/loanEarlyPayoffPenalty';
import { describe, it, expect } from 'vitest';

describe('Loan Early Payoff Penalty', () => {
  describe('Formula', () => {
    it('should return 0 for consumer loans (100.000 TL / 40 ay)', () => {
      const res = calculateLoanEarlyPayoffPenalty('consumer', 100000, 40);
      expect(res.primaryResult).toContain('0,00');
    });

    it('should return 1% for fixed housing with clause <= 36 months (1.000.000 / 24 ay)', () => {
      const res = calculateLoanEarlyPayoffPenalty('housing', 1000000, 24, 'fixed', true);
      expect(res.primaryResult).toContain('10.000');
      expect(res.notes?.[0]).toContain('toplam indirim tutarını kesinlikle aşamaz');
    });

    it('should return 1% for fixed housing with clause = 36 months (1.000.000 / 36 ay)', () => {
      const res = calculateLoanEarlyPayoffPenalty('housing', 1000000, 36, 'fixed', true);
      expect(res.primaryResult).toContain('10.000');
    });

    it('should return 2% for fixed housing with clause > 36 months (1.000.000 / 37 ay)', () => {
      const res = calculateLoanEarlyPayoffPenalty('housing', 1000000, 37, 'fixed', true);
      expect(res.primaryResult).toContain('20.000');
    });

    it('should return 2% for fixed housing with clause > 36 months (1.000.000 / 60 ay)', () => {
      const res = calculateLoanEarlyPayoffPenalty('housing', 1000000, 60, 'fixed', true);
      expect(res.primaryResult).toContain('20.000');
    });

    it('should return 0 for variable housing', () => {
      const res = calculateLoanEarlyPayoffPenalty('housing', 1000000, 60, 'variable');
      expect(res.primaryResult).toContain('0,00');
      expect(res.notes?.[0]).toContain('Değişken faizli konut finansmanında erken ödeme tazminatı talep edilemez');
    });

    it('should return 0 for fixed housing without clause', () => {
      const res = calculateLoanEarlyPayoffPenalty('housing', 1000000, 60, 'fixed', false);
      expect(res.primaryResult).toContain('0,00');
      expect(res.notes?.[0]).toContain('hüküm yoksa bu tazminat uygulanamaz');
    });

    it('should have correct primary label', () => {
      const res = calculateLoanEarlyPayoffPenalty('housing', 1000000, 60, 'fixed', true);
      expect(res.primaryLabel).toBe('Oran Bazlı Azami Erken Ödeme Tazminatı');
    });
  });

  describe('Schema Validation', () => {
    const schema = loanEarlyPayoffPenaltyCalculatorDef.schema;

    it('remainingPrincipal = 0 -> FAIL', () => {
      const result = schema.safeParse({ loanType: 'consumer', remainingPrincipal: 0, remainingMonths: 10 });
      expect(result.success).toBe(false);
    });

    it('remainingPrincipal < 0 -> FAIL', () => {
      const result = schema.safeParse({ loanType: 'consumer', remainingPrincipal: -100, remainingMonths: 10 });
      expect(result.success).toBe(false);
    });

    it('remainingMonths = 0 -> FAIL', () => {
      const result = schema.safeParse({ loanType: 'consumer', remainingPrincipal: 10000, remainingMonths: 0 });
      expect(result.success).toBe(false);
    });

    it('remainingMonths decimal -> FAIL', () => {
      const result = schema.safeParse({ loanType: 'consumer', remainingPrincipal: 10000, remainingMonths: 12.5 });
      expect(result.success).toBe(false);
    });

    it('NaN validations -> FAIL', () => {
      expect(schema.safeParse({ loanType: 'consumer', remainingPrincipal: 10000, remainingMonths: NaN }).success).toBe(false);
      expect(schema.safeParse({ loanType: 'consumer', remainingPrincipal: NaN, remainingMonths: 12 }).success).toBe(false);
    });

    it('Infinity validations -> FAIL', () => {
      expect(schema.safeParse({ loanType: 'consumer', remainingPrincipal: 10000, remainingMonths: Infinity }).success).toBe(false);
      expect(schema.safeParse({ loanType: 'consumer', remainingPrincipal: Infinity, remainingMonths: 12 }).success).toBe(false);
    });

    it('housing + interestType missing -> FAIL', () => {
      const result = schema.safeParse({ loanType: 'housing', remainingPrincipal: 10000, remainingMonths: 12 });
      expect(result.success).toBe(false);
    });

    it('housing + fixed + hasCompensationClause missing -> FAIL', () => {
      const result = schema.safeParse({ loanType: 'housing', remainingPrincipal: 10000, remainingMonths: 12, interestType: 'fixed' });
      expect(result.success).toBe(false);
    });

    it('consumer without housing fields -> PASS', () => {
      const result = schema.safeParse({ loanType: 'consumer', remainingPrincipal: 10000, remainingMonths: 12 });
      expect(result.success).toBe(true);
    });
  });
});
