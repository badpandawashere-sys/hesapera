export interface DynamicCashFlow {
  period: number;
  amount: number;
}

export function calculateDynamicNPV(discountRate: number, cashFlows: DynamicCashFlow[]): number {
  return cashFlows.reduce((npv, cf) => {
    return npv + (cf.amount / Math.pow(1 + discountRate, cf.period));
  }, 0);
}