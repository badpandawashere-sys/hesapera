export interface LoanParams {
  principal: number;
  monthlyInterestRate: number; // as percentage, e.g., 2.5 for 2.5%
  termMonths: number;
}

export interface AmortizationRow {
  installmentNumber: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingPrincipal: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: AmortizationRow[];
}