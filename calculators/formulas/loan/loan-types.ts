export interface LoanParams {
  principal: number;
  monthlyInterestRate: number; // as percentage, e.g., 2.5 for 2.5%
  termMonths: number;
  kkdfRate?: number; // as percentage, e.g., 15 for 15%
  bsmvRate?: number; // as percentage, e.g., 15 for 15%
}

export interface AmortizationRow {
  installmentNumber: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  kkdfPaid?: number;
  bsmvPaid?: number;
  remainingPrincipal: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalKKDF?: number;
  totalBSMV?: number;
  totalPayment: number;
  schedule: AmortizationRow[];
}
