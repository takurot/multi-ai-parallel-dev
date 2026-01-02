/**
 * Budget management
 */
import { BudgetState } from "./types";

export class BudgetManager {
  private state: BudgetState;
  private warningThreshold: number; // percentage (0-100)

  constructor(initialState: BudgetState, warningThreshold = 80) {
    this.state = { ...initialState };
    this.warningThreshold = warningThreshold;
  }

  getState(): BudgetState {
    return { ...this.state };
  }

  isBudgetAvailable(costToAdd: number, tokensToAdd: number): boolean {
    const newMonthlyCostSpent = this.state.monthlyCostSpent + costToAdd;
    const newDailyTokenSpent = this.state.dailyTokenSpent + tokensToAdd;

    // Check if adding this cost would exceed limits
    // If limits are 0, no spending should be allowed
    const monthlyExceeded =
      this.state.monthlyCostLimit === 0 ||
      (this.state.monthlyCostLimit > 0 &&
        newMonthlyCostSpent > this.state.monthlyCostLimit);
    const dailyExceeded =
      this.state.dailyTokenLimit === 0 ||
      (this.state.dailyTokenLimit > 0 &&
        newDailyTokenSpent > this.state.dailyTokenLimit);

    return !monthlyExceeded && !dailyExceeded;
  }

  addSpending(cost: number, tokens: number): void {
    this.state.monthlyCostSpent += cost;
    this.state.dailyTokenSpent += tokens;
  }

  getRemainingBudget(): {
    monthlyCostRemaining: number;
    dailyTokenRemaining: number;
  } {
    const monthlyCostRemaining = Math.max(
      0,
      this.state.monthlyCostLimit - this.state.monthlyCostSpent,
    );
    const dailyTokenRemaining = Math.max(
      0,
      this.state.dailyTokenLimit - this.state.dailyTokenSpent,
    );

    return { monthlyCostRemaining, dailyTokenRemaining };
  }

  getUtilizationPercentage(): {
    monthlyCostUtilization: number;
    dailyTokenUtilization: number;
  } {
    const monthlyCostUtilization =
      this.state.monthlyCostLimit > 0
        ? (this.state.monthlyCostSpent / this.state.monthlyCostLimit) * 100
        : 0;

    const dailyTokenUtilization =
      this.state.dailyTokenLimit > 0
        ? (this.state.dailyTokenSpent / this.state.dailyTokenLimit) * 100
        : 0;

    return { monthlyCostUtilization, dailyTokenUtilization };
  }

  isWarningThresholdExceeded(): boolean {
    const utilization = this.getUtilizationPercentage();
    return (
      utilization.monthlyCostUtilization >= this.warningThreshold ||
      utilization.dailyTokenUtilization >= this.warningThreshold
    );
  }
}
