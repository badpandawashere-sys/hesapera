import { DynamicCashFlow, calculateDynamicNPV } from './npv';

export function calculateDynamicIRR(cashFlows: DynamicCashFlow[], maxIter = 100, tol = 1e-7): number {
  let low = -0.9999;
  let high = 10;
  
  const npvLow = calculateDynamicNPV(low, cashFlows);
  const npvHigh = calculateDynamicNPV(high, cashFlows);
  
  if (Math.sign(npvLow) === Math.sign(npvHigh)) {
    throw new Error('IRR hesaplanamıyor. Nakit akışlarında eksi ve artı değerlerin doğru dağıldığından emin olun.');
  }

  for (let iter = 0; iter < maxIter; iter++) {
    const mid = (low + high) / 2;
    const npvMid = calculateDynamicNPV(mid, cashFlows);

    if (Math.abs(npvMid) < tol) {
      return mid;
    }

    if (Math.sign(npvMid) === Math.sign(npvLow)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  throw new Error('IRR hesaplaması yakınsamadı. Limit aşıldı.');
}

export function npv(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((acc, val, i) => acc + val / Math.pow(1 + rate, i), 0);
}

export function calculateIRR(cashFlows: number[], maxIter = 100, tol = 1e-7): number {
  let low = -0.9999; // Almost -100%
  let high = 10;     // 1000%
  
  const npvLow = npv(low, cashFlows);
  const npvHigh = npv(high, cashFlows);
  
  if (Math.sign(npvLow) === Math.sign(npvHigh)) {
    throw new Error('IRR yakınsaması başarısız oldu (Nakit akışları işareti eşlenik değil).');
  }

  for (let iter = 0; iter < maxIter; iter++) {
    const mid = (low + high) / 2;
    const npvMid = npv(mid, cashFlows);

    if (Math.abs(npvMid) < tol) {
      return mid;
    }

    if (Math.sign(npvMid) === Math.sign(npvLow)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  throw new Error('IRR hesaplaması belirlenen iterasyon limitine ulaştı ve yakınsamadı.');
}