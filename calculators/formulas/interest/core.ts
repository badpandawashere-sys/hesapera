export function computeSimpleInterest(principal: number, annualRate: number, termYears: number): number {
  return principal * (annualRate / 100) * termYears;
}

export function computeCompoundInterest(principal: number, annualRate: number, termYears: number, timesPerYear: number): number {
  const r = annualRate / 100;
  return principal * Math.pow(1 + (r / timesPerYear), timesPerYear * termYears) - principal;
}

export function normalizeTermToYears(term: number, termUnit: 'year' | 'month' | 'day'): number {
  if (termUnit === 'year') return term;
  if (termUnit === 'month') return term / 12;
  if (termUnit === 'day') return term / 365;
  return term;
}