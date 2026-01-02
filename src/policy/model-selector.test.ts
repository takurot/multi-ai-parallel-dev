/**
 * Tests for model selector
 */
import { describe, it, expect } from "vitest";
import { ModelProfile, TaskAttributes } from "./types";
import { selectModel } from "./model-selector";

describe("Model Selector", () => {
  const mockModels: ModelProfile[] = [
    {
      id: "cheap-model",
      provider: "openai",
      model: "gpt-3.5-turbo",
      costPer1kInputTokens: 0.0005,
      costPer1kOutputTokens: 0.0015,
      maxTokensPerCall: 4096,
      qualityTags: ["fast", "cheap"],
      defaultUse: ["tests", "refactor"],
      tier: 1,
    },
    {
      id: "medium-model",
      provider: "openai",
      model: "gpt-4",
      costPer1kInputTokens: 0.03,
      costPer1kOutputTokens: 0.06,
      maxTokensPerCall: 8192,
      qualityTags: ["high-quality"],
      defaultUse: ["public-api", "core-domain"],
      tier: 2,
    },
    {
      id: "expensive-model",
      provider: "anthropic",
      model: "claude-opus",
      costPer1kInputTokens: 0.015,
      costPer1kOutputTokens: 0.075,
      maxTokensPerCall: 200000,
      qualityTags: ["very-high-quality", "review-strong"],
      defaultUse: ["critical-review"],
      tier: 3,
    },
  ];

  it("should select appropriate model based on cost tier and complexity hint", () => {
    // For low cost tier and tests, should select cheap model
    const lowTask: TaskAttributes = {
      costTier: "low",
      complexityHint: "tests",
    };
    const selectedLow = selectModel(mockModels, lowTask);
    expect(selectedLow.id).toBe("cheap-model");

    // For high cost tier and public-api, should select expensive model
    const highTask: TaskAttributes = {
      costTier: "high",
      complexityHint: "public-api",
    };
    const selectedHigh = selectModel(mockModels, highTask);
    expect(selectedHigh.id).toBe("expensive-model");

    // For medium cost tier and refactor, should select medium model
    const mediumTask: TaskAttributes = {
      costTier: "medium",
      complexityHint: "refactor",
    };
    const selectedMedium = selectModel(mockModels, mediumTask);
    expect(selectedMedium.id).toBe("medium-model");
  });

  it("should select model based on complexity hint when cost tiers are same", () => {
    const task: TaskAttributes = {
      costTier: "medium",
      complexityHint: "public-api",
    };
    const selected = selectModel(mockModels, task);
    expect(selected.id).toBe("medium-model"); // matches defaultUse: ['public-api', 'core-domain']
  });

  it("should select model based on quality tags for review tasks", () => {
    const reviewModels: ModelProfile[] = [
      {
        id: "review-model",
        provider: "anthropic",
        model: "claude-sonnet",
        costPer1kInputTokens: 0.003,
        costPer1kOutputTokens: 0.015,
        maxTokensPerCall: 200000,
        qualityTags: ["review-strong", "high-quality"],
        defaultUse: ["review"],
        tier: 2,
      },
      ...mockModels,
    ];

    const reviewTask: TaskAttributes = {
      costTier: "medium",
      complexityHint: "review",
    };
    const selected = selectModel(reviewModels, reviewTask);
    expect(selected.id).toBe("review-model"); // has 'review' in defaultUse
  });

  it("should return undefined if no models match", () => {
    const emptyModels: ModelProfile[] = [];
    const task: TaskAttributes = {
      costTier: "high",
      complexityHint: "public-api",
    };
    const selected = selectModel(emptyModels, task);
    expect(selected).toBeUndefined();
  });

  it("should handle unknown complexity hints by selecting based on cost tier", () => {
    const task: TaskAttributes = {
      costTier: "high",
      complexityHint: "unknown-hint",
    };
    const selected = selectModel(mockModels, task);
    // Should select the highest tier model since costTier is 'high'
    expect(selected.tier).toBe(3); // expensive-model has tier 3
  });
});
