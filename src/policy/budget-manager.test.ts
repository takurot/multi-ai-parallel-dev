/**
 * Tests for budget manager
 */
import { describe, it, expect } from "vitest";
import { BudgetManager } from "./budget-manager";

describe("Budget Manager", () => {
  it("should initialize with correct budget state", () => {
    const budgetManager = new BudgetManager({
      monthlyCostLimit: 100,
      dailyTokenLimit: 500000,
      monthlyCostSpent: 0,
      dailyTokenSpent: 0,
    });

    const state = budgetManager.getState();
    expect(state.monthlyCostSpent).toBe(0);
    expect(state.dailyTokenSpent).toBe(0);
    expect(state.monthlyCostLimit).toBe(100);
    expect(state.dailyTokenLimit).toBe(500000);
  });

  it("should check if budget is available", () => {
    const budgetManager = new BudgetManager({
      monthlyCostLimit: 100,
      dailyTokenLimit: 500000,
      monthlyCostSpent: 50,
      dailyTokenSpent: 250000,
    });

    // Should have budget available
    expect(budgetManager.isBudgetAvailable(10, 10000)).toBe(true);

    // Should not have budget available if it would exceed monthly limit
    expect(budgetManager.isBudgetAvailable(60, 10000)).toBe(false); // 50 + 60 > 100

    // Should not have budget available if it would exceed daily limit
    expect(budgetManager.isBudgetAvailable(1, 300000)).toBe(false); // 250000 + 300000 > 500000
  });

  it("should track spending correctly", () => {
    const budgetManager = new BudgetManager({
      monthlyCostLimit: 100,
      dailyTokenLimit: 500000,
      monthlyCostSpent: 25,
      dailyTokenSpent: 100000,
    });

    // Add spending
    budgetManager.addSpending(10, 50000);

    const state = budgetManager.getState();
    expect(state.monthlyCostSpent).toBe(35); // 25 + 10
    expect(state.dailyTokenSpent).toBe(150000); // 100000 + 50000
  });

  it("should calculate remaining budget correctly", () => {
    const budgetManager = new BudgetManager({
      monthlyCostLimit: 100,
      dailyTokenLimit: 500000,
      monthlyCostSpent: 30,
      dailyTokenSpent: 200000,
    });

    const remaining = budgetManager.getRemainingBudget();
    expect(remaining.monthlyCostRemaining).toBe(70); // 100 - 30
    expect(remaining.dailyTokenRemaining).toBe(300000); // 500000 - 200000
  });

  it("should calculate budget utilization percentage", () => {
    const budgetManager = new BudgetManager({
      monthlyCostLimit: 100,
      dailyTokenLimit: 500000,
      monthlyCostSpent: 80,
      dailyTokenSpent: 400000,
    });

    const utilization = budgetManager.getUtilizationPercentage();
    expect(utilization.monthlyCostUtilization).toBe(80); // (80/100)*100
    expect(utilization.dailyTokenUtilization).toBe(80); // (400000/500000)*100
  });

  it("should check if budget warning threshold is exceeded", () => {
    const budgetManager = new BudgetManager(
      {
        monthlyCostLimit: 100,
        dailyTokenLimit: 500000,
        monthlyCostSpent: 80,
        dailyTokenSpent: 400000,
      },
      75,
    ); // 75% warning threshold

    // Should return warning since 80% > 75%
    expect(budgetManager.isWarningThresholdExceeded()).toBe(true);

    // Create another budget manager with lower utilization
    const budgetManager2 = new BudgetManager(
      {
        monthlyCostLimit: 100,
        dailyTokenLimit: 500000,
        monthlyCostSpent: 50,
        dailyTokenSpent: 250000,
      },
      75,
    ); // 75% warning threshold

    // Should not return warning since 50% < 75%
    expect(budgetManager2.isWarningThresholdExceeded()).toBe(false);
  });

  it("should handle zero budget limits", () => {
    const budgetManager = new BudgetManager({
      monthlyCostLimit: 0,
      dailyTokenLimit: 0,
      monthlyCostSpent: 0,
      dailyTokenSpent: 0,
    });

    // With zero limits, no spending should be allowed
    expect(budgetManager.isBudgetAvailable(1, 1)).toBe(false);
    expect(
      budgetManager.getUtilizationPercentage().monthlyCostUtilization,
    ).toBe(0);
    expect(budgetManager.getUtilizationPercentage().dailyTokenUtilization).toBe(
      0,
    );
  });
});
