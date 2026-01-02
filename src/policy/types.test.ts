/**
 * Tests for policy types
 */
import { describe, it, expect } from "vitest";
import {
  ModelProfile,
  CostPolicy,
  TaskAttributes,
  CostEstimate,
  BudgetState,
} from "./types";

// Test that types can be properly defined and used
describe("Policy Types", () => {
  it("should define ModelProfile interface correctly", () => {
    const modelProfile: ModelProfile = {
      id: "test-model",
      provider: "openai",
      model: "gpt-4",
      costPer1kInputTokens: 0.03,
      costPer1kOutputTokens: 0.06,
      maxTokensPerCall: 8192,
      qualityTags: ["high-quality", "code"],
      defaultUse: ["public-api", "core-domain"],
      tier: 2,
    };

    expect(modelProfile.id).toBe("test-model");
    expect(modelProfile.provider).toBe("openai");
    expect(modelProfile.model).toBe("gpt-4");
    expect(modelProfile.costPer1kInputTokens).toBe(0.03);
    expect(modelProfile.costPer1kOutputTokens).toBe(0.06);
    expect(modelProfile.maxTokensPerCall).toBe(8192);
    expect(modelProfile.qualityTags).toEqual(["high-quality", "code"]);
    expect(modelProfile.defaultUse).toEqual(["public-api", "core-domain"]);
    expect(modelProfile.tier).toBe(2);
  });

  it("should define CostPolicy interface correctly", () => {
    const costPolicy: CostPolicy = {
      monthlyLimitUsd: 100,
      dailyTokenLimit: 500000,
      warnAtPercent: 80,
    };

    expect(costPolicy.monthlyLimitUsd).toBe(100);
    expect(costPolicy.dailyTokenLimit).toBe(500000);
    expect(costPolicy.warnAtPercent).toBe(80);
  });

  it("should define TaskAttributes interface correctly", () => {
    const taskAttributes: TaskAttributes = {
      costTier: "high",
      complexityHint: "public-api",
    };

    expect(taskAttributes.costTier).toBe("high");
    expect(taskAttributes.complexityHint).toBe("public-api");
  });

  it("should define CostEstimate interface correctly", () => {
    const costEstimate: CostEstimate = {
      inputTokens: 1000,
      outputTokens: 500,
      inputCost: 0.03,
      outputCost: 0.03,
      totalCost: 0.06,
    };

    expect(costEstimate.inputTokens).toBe(1000);
    expect(costEstimate.outputTokens).toBe(500);
    expect(costEstimate.inputCost).toBe(0.03);
    expect(costEstimate.outputCost).toBe(0.03);
    expect(costEstimate.totalCost).toBe(0.06);
  });

  it("should define BudgetState interface correctly", () => {
    const budgetState: BudgetState = {
      monthlySpent: 50,
      dailySpent: 250000,
      monthlyLimit: 100,
      dailyLimit: 500000,
    };

    expect(budgetState.monthlySpent).toBe(50);
    expect(budgetState.dailySpent).toBe(250000);
    expect(budgetState.monthlyLimit).toBe(100);
    expect(budgetState.dailyLimit).toBe(500000);
  });
});
