/**
 * Tests for cost calculator
 */
import { describe, it, expect } from "vitest";
import { ModelProfile, CostEstimate } from "./types";
import { calculateCost } from "./cost-calculator";

describe("Cost Calculator", () => {
  it("should calculate cost correctly for given tokens", () => {
    const modelProfile: ModelProfile = {
      id: "test-model",
      provider: "openai",
      model: "gpt-4",
      costPer1kInputTokens: 0.03, // $0.03 per 1k input tokens
      costPer1kOutputTokens: 0.06, // $0.06 per 1k output tokens
      maxTokensPerCall: 8192,
      qualityTags: ["high-quality", "code"],
      defaultUse: ["public-api", "core-domain"],
      tier: 2,
    };

    const costEstimate: CostEstimate = calculateCost(modelProfile, 1000, 500); // 1000 input, 500 output tokens

    expect(costEstimate.inputTokens).toBe(1000);
    expect(costEstimate.outputTokens).toBe(500);
    expect(costEstimate.inputCost).toBe(0.03); // (1000 / 1000) * 0.03
    expect(costEstimate.outputCost).toBe(0.03); // (500 / 1000) * 0.06
    expect(costEstimate.totalCost).toBe(0.06); // 0.03 + 0.03
  });

  it("should handle zero tokens correctly", () => {
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

    const costEstimate: CostEstimate = calculateCost(modelProfile, 0, 0);

    expect(costEstimate.inputTokens).toBe(0);
    expect(costEstimate.outputTokens).toBe(0);
    expect(costEstimate.inputCost).toBe(0);
    expect(costEstimate.outputCost).toBe(0);
    expect(costEstimate.totalCost).toBe(0);
  });

  it("should calculate cost for large token counts", () => {
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

    const costEstimate: CostEstimate = calculateCost(modelProfile, 5000, 2500);

    expect(costEstimate.inputTokens).toBe(5000);
    expect(costEstimate.outputTokens).toBe(2500);
    expect(costEstimate.inputCost).toBe(0.15); // (5000 / 1000) * 0.03
    expect(costEstimate.outputCost).toBe(0.15); // (2500 / 1000) * 0.06
    expect(costEstimate.totalCost).toBe(0.3);
  });

  it("should handle fractional costs correctly", () => {
    const modelProfile: ModelProfile = {
      id: "test-model",
      provider: "openai",
      model: "gpt-4",
      costPer1kInputTokens: 0.00015, // Very cheap model
      costPer1kOutputTokens: 0.0006,
      maxTokensPerCall: 128000,
      qualityTags: ["fast", "cheap", "ok-code"],
      defaultUse: ["tests", "refactor", "docs"],
      tier: 1,
    };

    const costEstimate: CostEstimate = calculateCost(modelProfile, 150, 75);

    expect(costEstimate.inputTokens).toBe(150);
    expect(costEstimate.outputTokens).toBe(75);
    expect(costEstimate.inputCost).toBeCloseTo(0.0000225, 10); // (150 / 1000) * 0.00015
    expect(costEstimate.outputCost).toBeCloseTo(0.000045, 10); // (75 / 1000) * 0.0006
    expect(costEstimate.totalCost).toBeCloseTo(0.0000675, 10);
  });
});
