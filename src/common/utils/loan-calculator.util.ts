import { LoanCalculation } from '../types';

export class LoanCalculatorUtil {
  /**
   * Calculate loan payment details
   */
  static calculateLoanPayment(
    loanAmount: number,
    interestRate: number,
    termMonths: number,
  ): LoanCalculation {
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = this.calculateMonthlyPayment(
      loanAmount,
      monthlyRate,
      termMonths,
    );
    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - loanAmount;

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
    };
  }

  /**
   * Calculate monthly payment using the standard loan formula
   */
  private static calculateMonthlyPayment(
    principal: number,
    monthlyRate: number,
    termMonths: number,
  ): number {
    if (monthlyRate === 0) {
      return principal / termMonths;
    }

    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
    );
  }

  /**
   * Generate payment schedule
   */
  static generatePaymentSchedule(
    loanAmount: number,
    interestRate: number,
    termMonths: number,
  ): LoanCalculation {
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = this.calculateMonthlyPayment(
      loanAmount,
      monthlyRate,
      termMonths,
    );

    let balance = loanAmount;
    const paymentSchedule = [];

    for (let month = 1; month <= termMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      paymentSchedule.push({
        month,
        payment: Math.round(monthlyPayment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        balance: Math.round(Math.max(0, balance) * 100) / 100,
      });
    }

    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(monthlyPayment * termMonths * 100) / 100,
      totalInterest: Math.round((monthlyPayment * termMonths - loanAmount) * 100) / 100,
      paymentSchedule,
    };
  }

  /**
   * Calculate loan to value ratio
   */
  static calculateLoanToValueRatio(loanAmount: number, vehicleValue: number): number {
    return Math.round((loanAmount / vehicleValue) * 100 * 100) / 100;
  }

  /**
   * Validate loan criteria
   */
  static validateLoanCriteria(
    loanAmount: number,
    vehicleValue: number,
    maxLTV: number = 80,
  ): { isValid: boolean; reason?: string } {
    const ltv = this.calculateLoanToValueRatio(loanAmount, vehicleValue);

    if (ltv > maxLTV) {
      return {
        isValid: false,
        reason: `Loan-to-value ratio (${ltv}%) exceeds maximum allowed (${maxLTV}%)`,
      };
    }

    if (loanAmount < 1000) {
      return {
        isValid: false,
        reason: 'Loan amount must be at least $1,000',
      };
    }

    return { isValid: true };
  }
}